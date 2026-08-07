import type { Section, SectionType } from "../../types/site";

function newId(type: SectionType): string {
  return `${type}-${Math.random().toString(36).slice(2, 9)}`;
}

// Значения по умолчанию для блока, добавленного через DnD-карусель
// («Блоки», ТЗ п.4) — пользователь донаполняет содержимое через «Конструктор».
export function createDefaultSection(type: SectionType): Section {
  const id = newId(type);
  switch (type) {
    case "header":
      return { id, type, variant: "standard", logo_text: "Логотип", nav_items: [], sticky: false, cta_text: "" };
    case "hero":
      return {
        id,
        type,
        variant: "centered",
        title: "Заголовок",
        subtitle: "Подзаголовок",
        cta_text: "Узнать больше",
        cta_href: "#",
        bg_image: "",
      };
    case "text_image":
      return { id, type, title: "О нас", text: "Расскажите о своей компании", image: "", image_position: "right" };
    case "grid_3col":
      return { id, type, variant: "cards", title: "Наши услуги", items: [], cta_text: "" };
    case "pricing":
      return { id, type, variant: "cards", title: "Тарифы", plans: [] };
    case "testimonials":
      return { id, type, variant: "cards", title: "Отзывы клиентов", items: [] };
    case "contact_map":
      return {
        id,
        type,
        variant: "centered",
        title: "Контакты",
        address: "",
        phone: "",
        email: "",
        map_embed_url: "",
        show_map: true,
      };
    case "footer":
      return { id, type, variant: "simple", company_name: "", copyright_text: "", links: [], socials: [] };
  }
}
