<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <div class="workspace">
    <aside class="workspace__rail">
      <NuxtLink to="/" class="workspace__brand" aria-label="AI Sites — мои сайты"><span class="workspace__mark"><Icon name="lucide:layers-2" /></span> sites<span class="workspace__edition">studio</span></NuxtLink>
      <div class="workspace__group-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav class="workspace__nav" aria-label="Основная навигация">
        <NuxtLink to="/" :class="{ active: route.path === '/' }"><Icon name="lucide:panels-top-left" /> Мои сайты</NuxtLink>
        <NuxtLink to="/new" :class="{ active: route.path === '/new' }"><Icon name="lucide:sparkles" /> Создать сайт <span>+</span></NuxtLink>
      </nav>
      <div class="workspace__note"><span class="workspace__note-icon"><Icon name="lucide:orbit" /></span><strong>Ваша идея. Ваш характер.</strong><p>Расскажите о бизнесе.<br>Придайте ему форму.</p></div>
      <div class="workspace__account"><span class="workspace__avatar">{{ (auth.user?.email || 'S').slice(0, 1).toUpperCase() }}</span><div><strong>Моё пространство</strong><small>{{ auth.user?.email }}</small></div><ThemeToggle inline /></div>
    </aside>
    <div class="workspace__body"><slot /></div>
  </div>
</template>

<style scoped>
.workspace { display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh; }
.workspace__rail { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 36px 18px 18px; background: var(--a-glass-bg); border-right: 1px solid var(--a-border); backdrop-filter: blur(28px); }
.workspace__brand { display: flex; align-items: center; gap: 9px; padding: 0 14px; margin-bottom: 64px; font-size: 26px; font-weight: 650; letter-spacing: -.06em; text-decoration: none; }
.workspace__mark { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 10px; background: var(--a-text); color: var(--a-bg); font-size: 20px; }
.workspace__edition { font-size: 12px; letter-spacing: 0; color: var(--a-text-muted); font-weight: 450; margin-top: 8px; }
.workspace__group-label { padding: 0 14px; font-size: 9px; letter-spacing: .12em; color: var(--a-text-muted); font-weight: 600; margin-bottom: 12px; }
.workspace__nav { display: grid; gap: 5px; }
.workspace__nav a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; text-decoration: none; color: var(--a-text-muted); font-size: 13px; }
.workspace__nav a.active { background: var(--a-surface-solid); box-shadow: var(--a-shadow-sm); color: var(--a-text); font-weight: 600; }
.workspace__nav a:hover { background: var(--a-surface-hover); }
.workspace__nav a > span:last-child:not(:first-child) { margin-left: auto; }
.workspace__note { margin: auto 14px 36px; padding-top: 70px; }
.workspace__note-icon { display: block; font-size: 28px; margin-bottom: 12px; color: var(--a-text-muted); }
.workspace__note strong { font-size: 12px; font-weight: 550; }
.workspace__note p { margin-top: 8px; color: var(--a-text-muted); font-size: 12px; line-height: 1.7; }
.workspace__account { display: flex; align-items: center; gap: 9px; padding-top: 18px; border-top: 1px solid var(--a-border); }
.workspace__avatar { width: 32px; height: 32px; display: grid; place-items: center; background: #dedbd3; color: #47433b; border-radius: 50%; font-size: 12px; flex-shrink: 0; }
.workspace__account > div { min-width: 0; flex: 1; }
.workspace__account strong, .workspace__account small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
.workspace__account small { margin-top: 3px; color: var(--a-text-muted); }
.workspace__account :deep(.theme-switcher__trigger) { width: 30px; height: 30px; font-size: 14px; box-shadow: none; }
.workspace__body { min-width: 0; }
@media (max-width: 1000px) { .workspace { grid-template-columns: 200px minmax(0, 1fr); } .workspace__rail { padding-inline: 12px; } }
@media (max-width: 760px) { .workspace { display: block; } .workspace__rail { position: relative; height: auto; padding: 16px 20px; flex-direction: row; align-items: center; gap: 20px; border-right: 0; border-bottom: 1px solid var(--a-border); } .workspace__brand { margin: 0; padding: 0; } .workspace__group-label, .workspace__note, .workspace__account, .workspace__edition { display: none; } .workspace__nav { display: flex; margin-left: auto; } .workspace__nav a { padding: 9px; font-size: 11px; } .workspace__nav a > span:last-child:not(:first-child) { display: none; } }
</style>
