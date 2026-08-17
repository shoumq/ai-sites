// site-builder — маленький HTTP-микросервис (ESM), оборачивающий site-renderer
// в API для бэкенда. Принимает SiteSchema, кладёт его в site-renderer/data/site.json,
// запускает `npx nuxi generate` как child process и копирует статическую сборку
// в BUILDS_DIR/{subdomain}/{build_id}/.
//
// Сознательно НЕ использует child_process.exec со строковой интерполяцией —
// это инъекция команд. Только execFile с явным массивом аргументов, shell:false.

import express from 'express'
import { Mutex } from 'async-mutex'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const execFile = promisify(execFileCb)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PORT) || 4000

// Рабочая копия site-renderer, которую мы перезаписываем/собираем перед каждым билдом.
// По умолчанию — соседняя директория в репозитории; переопределяемо для Docker/тестов.
const SITE_RENDERER_DIR = process.env.SITE_RENDERER_DIR
  ? path.resolve(process.env.SITE_RENDERER_DIR)
  : path.resolve(__dirname, '..', 'site-renderer')

const SITE_DATA_PATH = path.join(SITE_RENDERER_DIR, 'data', 'site.json')
// Аналитика/SEO/корзина/адрес приёма заявок — публичная часть настроек проекта.
// Раньше бэкенд передавал settings, но сборщик их игнорировал, и счётчик
// Яндекс.Метрики в опубликованный сайт не попадал вообще.
const SITE_RUNTIME_PATH = path.join(SITE_RENDERER_DIR, 'data', 'runtime.json')
const OUTPUT_PUBLIC_DIR = path.join(SITE_RENDERER_DIR, '.output', 'public')

// Точка монтирования будущего docker-volume. На хосте вне контейнера (например,
// на Windows-разработке) `/builds` в корне диска чаще всего недоступен для записи —
// поэтому даём возможность переопределить путь через BUILDS_DIR, а если и
// дефолтный `/builds` не создать, тихо откатываемся на ./builds рядом с сервисом.
function resolveBuildsDir() {
  const configured = process.env.BUILDS_DIR || '/builds'
  try {
    fs.mkdirSync(configured, { recursive: true })
    fs.accessSync(configured, fs.constants.W_OK)
    return configured
  } catch {
    const fallback = path.join(process.cwd(), 'builds')
    fs.mkdirSync(fallback, { recursive: true })
    console.warn(
      `[site-builder] BUILDS_DIR "${configured}" недоступен для записи, использую fallback "${fallback}". ` +
        'Задайте BUILDS_DIR явно, если это нежелательно.',
    )
    return fallback
  }
}

const BUILDS_DIR = resolveBuildsDir()

// Последовательные сборки — очередь не нужна (единственный worker), но два
// параллельных HTTP-запроса не должны затирать site.json друг друга.
const buildMutex = new Mutex()

// subdomain/build_id идут прямиком в путь на файловой системе (BUILDS_DIR/<subdomain>/<build_id>) —
// белый список символов защищает от path traversal ("../../etc") и прочих сюрпризов.
const SAFE_SEGMENT_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/

function validateBuildRequest(body) {
  const errors = []

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Тело запроса должно быть JSON-объектом']
  }

  if (typeof body.subdomain !== 'string' || !SAFE_SEGMENT_RE.test(body.subdomain)) {
    errors.push('Поле subdomain обязательно и должно содержать только буквы/цифры/-/_ (1-128 символов)')
  }

  if (typeof body.build_id !== 'string' || !SAFE_SEGMENT_RE.test(body.build_id)) {
    errors.push('Поле build_id обязательно и должно содержать только буквы/цифры/-/_ (1-128 символов)')
  }

  if (!body.site || typeof body.site !== 'object' || Array.isArray(body.site)) {
    errors.push('Поле site обязательно и должно быть объектом (SiteSchema)')
  } else if (!Array.isArray(body.site.pages)) {
    errors.push('Поле site.pages обязательно и должно быть массивом')
  }

  return errors
}

async function writeSiteData(site, runtime) {
  await fs.promises.mkdir(path.dirname(SITE_DATA_PATH), { recursive: true })
  await fs.promises.writeFile(SITE_DATA_PATH, JSON.stringify(site, null, 2), 'utf-8')
  // Пишем всегда, даже при пустом runtime: site-renderer импортирует этот файл
  // статически, и его отсутствие уронило бы сборку на резолве импорта.
  await fs.promises.writeFile(SITE_RUNTIME_PATH, JSON.stringify(runtime ?? {}, null, 2), 'utf-8')
}

async function runNuxiGenerate() {
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  try {
    const { stdout, stderr } = await execFile(npxBin, ['nuxi', 'generate'], {
      cwd: SITE_RENDERER_DIR,
      env: process.env,
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
    })
    return { ok: true, stdout, stderr }
  } catch (err) {
    return {
      ok: false,
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? String(err.message ?? err),
      code: err.code,
    }
  }
}

async function copyBuildOutput(subdomain, buildId) {
  const destDir = path.join(BUILDS_DIR, subdomain, buildId)
  await fs.promises.rm(destDir, { recursive: true, force: true })
  await fs.promises.mkdir(destDir, { recursive: true })
  await fs.promises.cp(OUTPUT_PUBLIC_DIR, destDir, { recursive: true })
  return destDir
}

const app = express()
app.use(express.json({ limit: '25mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/build', async (req, res) => {
  const errors = validateBuildRequest(req.body)
  if (errors.length) {
    return res.status(400).json({ error: 'Некорректный запрос', details: errors })
  }

  const { subdomain, build_id: buildId, site, runtime } = req.body

  const release = await buildMutex.acquire()
  try {
    await writeSiteData(site, runtime)

    const result = await runNuxiGenerate()
    if (!result.ok) {
      return res.status(500).json({
        error: 'nuxi generate завершился с ошибкой',
        stdout: result.stdout,
        stderr: result.stderr,
      })
    }

    if (!fs.existsSync(OUTPUT_PUBLIC_DIR)) {
      return res.status(500).json({
        error: 'nuxi generate завершился без ошибок, но .output/public не найден',
        stdout: result.stdout,
        stderr: result.stderr,
      })
    }

    const outputDir = await copyBuildOutput(subdomain, buildId)
    return res.json({ output_dir: outputDir })
  } catch (err) {
    console.error('[site-builder] Ошибка при сборке сайта:', err)
    return res.status(500).json({ error: 'Внутренняя ошибка сборки', details: String(err.message ?? err) })
  } finally {
    release()
  }
})

// Единый обработчик неотловленных ошибок express (например, невалидный JSON в теле запроса) —
// не должен ронять процесс.
app.use((err, _req, res, _next) => {
  console.error('[site-builder] Необработанная ошибка запроса:', err)
  res.status(400).json({ error: 'Некорректный запрос', details: String(err.message ?? err) })
})

process.on('unhandledRejection', (reason) => {
  console.error('[site-builder] unhandledRejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[site-builder] uncaughtException:', err)
})

app.listen(PORT, () => {
  console.log(`[site-builder] слушаю порт ${PORT}`)
  console.log(`[site-builder] SITE_RENDERER_DIR = ${SITE_RENDERER_DIR}`)
  console.log(`[site-builder] BUILDS_DIR = ${BUILDS_DIR}`)
})
