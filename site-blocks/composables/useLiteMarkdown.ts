export interface LiteMdSpan {
  text: string
  bold?: boolean
  italic?: boolean
}

export interface LiteMdParagraph {
  type: 'p'
  spans: LiteMdSpan[]
}

export interface LiteMdList {
  type: 'ul'
  items: LiteMdSpan[][]
}

export type LiteMdBlock = LiteMdParagraph | LiteMdList

/**
 * Мини-парсер лёгкой разметки для custom_content.body — **жирный**, *курсив*
 * и списки через "- ". Намеренно НЕ полноценный markdown/HTML-парсер и не
 * использует v-html: результат — обычные текстовые Vue-узлы (см.
 * CustomContentStandard.vue), поэтому в отличие от markdown-it/dompurify не
 * добавляет новую XSS-поверхность, даже когда body пришёл от ИИ по
 * свободному запросу пользователя (extra_requirements/чат).
 */
export function parseLiteMarkdown(text: string): LiteMdBlock[] {
  const blocks: LiteMdBlock[] = []
  let currentList: LiteMdSpan[][] | null = null

  const flushList = () => {
    if (currentList && currentList.length) blocks.push({ type: 'ul', items: currentList })
    currentList = null
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      continue
    }
    if (line.startsWith('- ')) {
      currentList ??= []
      currentList.push(parseSpans(line.slice(2)))
      continue
    }
    flushList()
    blocks.push({ type: 'p', spans: parseSpans(line) })
  }
  flushList()
  return blocks
}

function parseSpans(line: string): LiteMdSpan[] {
  const spans: LiteMdSpan[] = []
  // **bold** и *italic* — непересекающиеся, простой последовательный разбор
  // регуляркой вместо полноценного токенайзера (сложность разметки этим и
  // ограничена намеренно).
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(line))) {
    if (match.index > lastIndex) spans.push({ text: line.slice(lastIndex, match.index) })
    if (match[1] !== undefined) spans.push({ text: match[1], bold: true })
    else if (match[2] !== undefined) spans.push({ text: match[2], italic: true })
    lastIndex = re.lastIndex
  }
  if (lastIndex < line.length) spans.push({ text: line.slice(lastIndex) })
  return spans.length ? spans : [{ text: line }]
}
