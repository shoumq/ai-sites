// Человекочитаемые подписи для стандартных slug'ов многостраничного сайта
// (см. backend/app/services/ai/orchestrator.py: _build_multipage). Используется
// и в редакторе, и в автономном просмотре — единый источник подписей вкладок.
export const PAGE_SLUG_LABELS: Record<string, string> = {
  main: "Главная",
  services: "Услуги",
  about: "О нас",
  contacts: "Контакты",
};

export function pageLabel(slug: string, title?: string): string {
  return PAGE_SLUG_LABELS[slug] ?? title ?? slug;
}
