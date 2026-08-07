import { CheckIcon } from "../../components/icons";
import { COLOR_PRESETS, FONT_OPTIONS, SECTION_VARIANTS, SECTION_VARIANT_LABELS } from "../../types/site";
import type {
  ContactMapSection,
  FooterSection,
  Grid3ColSection,
  HeaderSection,
  HeroSection,
  PricingSection,
  Section,
  SectionType,
  TestimonialsSection,
  Theme,
} from "../../types/site";
import ListEditor from "./ListEditor";

interface ConstructorPanelProps {
  theme: Theme;
  selectedSection: Section | null;
  onUpdateTheme: (patch: Partial<Theme>) => void;
  onUpdateSection: (id: string, patch: Record<string, unknown>) => void;
  onDeleteSection: (id: string) => void;
  onGenerateImage: (field: "bg_image" | "image") => void;
  imageGenerating: boolean;
}

const IMAGE_PRESET_LABELS: Record<Theme["style"], string> = {
  business: "Деловой",
  warm: "Тёплый",
  techno: "Техно",
  custom: "Свой стиль",
};

export default function ConstructorPanel({
  theme,
  selectedSection,
  onUpdateTheme,
  onUpdateSection,
  onDeleteSection,
  onGenerateImage,
  imageGenerating,
}: ConstructorPanelProps) {
  const patch = (p: Record<string, unknown>) => selectedSection && onUpdateSection(selectedSection.id, p);
  const handleDelete = () => {
    if (!selectedSection) return;
    if (window.confirm("Удалить этот блок со страницы?")) onDeleteSection(selectedSection.id);
  };

  return (
    <div>
      <div className="constructor-section-title">Контент</div>
      {!selectedSection && (
        <p className="no-selection">
          <span className="no-selection-icon">👆</span>
          Выберите блок на превью слева, чтобы отредактировать его содержимое
        </p>
      )}
      {selectedSection?.type === "header" && <HeaderFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "hero" && <HeroFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "text_image" && (
        <>
          <div className="field">
            <label className="label">Позиция картинки</label>
            <select
              className="select"
              value={selectedSection.image_position}
              onChange={(e) => patch({ image_position: e.target.value })}
            >
              <option value="left">Слева</option>
              <option value="right">Справа</option>
            </select>
          </div>
        </>
      )}
      {selectedSection?.type === "grid_3col" && <GridFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "pricing" && <PricingFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "testimonials" && <TestimonialsFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "contact_map" && <ContactMapFields section={selectedSection} patch={patch} />}
      {selectedSection?.type === "footer" && <FooterFields section={selectedSection} patch={patch} />}

      <div className="constructor-section-title">Внешний вид</div>
      <div className="appearance-block">
        <div className="field">
          <label className="label">Цветовой пресет</label>
          <div className="color-presets">
            {(Object.keys(COLOR_PRESETS) as Theme["style"][]).map((style) => (
              <button
                key={style}
                type="button"
                title={IMAGE_PRESET_LABELS[style]}
                className={`color-swatch${theme.style === style ? " selected" : ""}`}
                style={{ background: COLOR_PRESETS[style] }}
                onClick={() => onUpdateTheme({ style, primary_color: COLOR_PRESETS[style] })}
              />
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">Свой HEX-цвет</label>
          <input
            className="input"
            type="color"
            value={theme.primary_color}
            onChange={(e) => onUpdateTheme({ style: "custom", primary_color: e.target.value })}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label">Шрифт</label>
          <select className="select" value={theme.font} onChange={(e) => onUpdateTheme({ font: e.target.value as Theme["font"] })}>
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(selectedSection?.type === "hero" || selectedSection?.type === "text_image") && (
        <div className="field" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-block"
            disabled={imageGenerating}
            onClick={() => onGenerateImage(selectedSection.type === "hero" ? "bg_image" : "image")}
          >
            ✨ {imageGenerating ? "Генерируем…" : "Сгенерировать картинку для блока"}
          </button>
          {((selectedSection.type === "hero" && selectedSection.bg_image) ||
            (selectedSection.type === "text_image" && selectedSection.image)) && (
            <p className="hint" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--app-success)" }}>
              <CheckIcon /> Картинка уже сгенерирована
            </p>
          )}
        </div>
      )}

      {selectedSection && (
        <button type="button" className="btn btn-danger btn-block" style={{ marginTop: 16 }} onClick={handleDelete}>
          🗑 Удалить блок
        </button>
      )}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Выбор визуального варианта блока (ТЗ: каждый сгенерированный сайт должен
// быть уникальным — тут же можно переопределить выбор ИИ вручную).
function VariantField({
  sectionType,
  variant,
  patch,
}: {
  sectionType: Exclude<SectionType, "text_image">;
  variant: string;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="field">
      <label className="label">Вариант блока</label>
      <select className="select" value={variant} onChange={(e) => patch({ variant: e.target.value })}>
        {SECTION_VARIANTS[sectionType].map((v) => (
          <option key={v} value={v}>
            {SECTION_VARIANT_LABELS[v] ?? v}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeaderFields({ section, patch }: { section: HeaderSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="header" variant={section.variant} patch={patch} />
      <TextField label="Логотип (текст)" value={section.logo_text} onChange={(v) => patch({ logo_text: v })} />
      <TextField label="Текст кнопки" value={section.cta_text} onChange={(v) => patch({ cta_text: v })} />
      <label className="checkbox-row field">
        <input type="checkbox" checked={section.sticky} onChange={(e) => patch({ sticky: e.target.checked })} />
        Липкая шапка (position: sticky)
      </label>
      <label className="label">Пункты меню</label>
      <ListEditor
        items={section.nav_items}
        onChange={(nav_items) => patch({ nav_items })}
        newItem={() => ({ label: "Пункт", href: "#" })}
        addLabel="пункт меню"
        renderRow={(item, update) => (
          <>
            <input className="input" placeholder="Название" value={item.label} onChange={(e) => update({ label: e.target.value })} />
            <input className="input" placeholder="Ссылка" value={item.href} onChange={(e) => update({ href: e.target.value })} />
          </>
        )}
      />
    </>
  );
}

function HeroFields({ section, patch }: { section: HeroSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="hero" variant={section.variant} patch={patch} />
      <TextField label="Заголовок (H1)" value={section.title} onChange={(v) => patch({ title: v })} />
      <TextAreaField label="Подзаголовок" value={section.subtitle} onChange={(v) => patch({ subtitle: v })} />
      <TextField label="Текст кнопки" value={section.cta_text} onChange={(v) => patch({ cta_text: v })} />
      <TextField label="Ссылка кнопки" value={section.cta_href} onChange={(v) => patch({ cta_href: v })} />
    </>
  );
}

function GridFields({ section, patch }: { section: Grid3ColSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="grid_3col" variant={section.variant} patch={patch} />
      <TextField label="Заголовок секции" value={section.title} onChange={(v) => patch({ title: v })} />
      <TextField label="Текст кнопки под сеткой (необязательно)" value={section.cta_text} onChange={(v) => patch({ cta_text: v })} />
      <label className="label">Список услуг</label>
      <ListEditor
        items={section.items}
        onChange={(items) => patch({ items })}
        newItem={() => ({ name: "Услуга", description: "", price: "", icon: "" })}
        addLabel="услугу"
        renderRow={(item, update) => (
          <>
            <input className="input" placeholder="Название" value={item.name} onChange={(e) => update({ name: e.target.value })} />
            <input
              className="input"
              placeholder="Описание"
              value={item.description}
              onChange={(e) => update({ description: e.target.value })}
            />
            <input className="input" placeholder="Цена" value={item.price} onChange={(e) => update({ price: e.target.value })} />
            <input
              className="input"
              placeholder="Иконка-эмодзи (для варианта «С иконкой»)"
              value={item.icon}
              onChange={(e) => update({ icon: e.target.value })}
            />
          </>
        )}
      />
    </>
  );
}

function PricingFields({ section, patch }: { section: PricingSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="pricing" variant={section.variant} patch={patch} />
      <TextField label="Заголовок секции" value={section.title} onChange={(v) => patch({ title: v })} />
      <label className="label">Тарифные планы</label>
      <ListEditor
        items={section.plans}
        onChange={(plans) => patch({ plans })}
        newItem={() => ({ name: "Тариф", price: "0", period: "мес", features: [], highlighted: false })}
        addLabel="тариф"
        renderRow={(plan, update) => (
          <>
            <input className="input" placeholder="Название" value={plan.name} onChange={(e) => update({ name: e.target.value })} />
            <input className="input" placeholder="Цена" value={plan.price} onChange={(e) => update({ price: e.target.value })} />
            <textarea
              className="textarea"
              placeholder="Опции — каждая с новой строки"
              value={plan.features.join("\n")}
              onChange={(e) => update({ features: e.target.value.split("\n") })}
            />
            <label className="checkbox-row">
              <input type="checkbox" checked={plan.highlighted} onChange={(e) => update({ highlighted: e.target.checked })} />
              Выделить тариф
            </label>
          </>
        )}
      />
    </>
  );
}

function TestimonialsFields({ section, patch }: { section: TestimonialsSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="testimonials" variant={section.variant} patch={patch} />
      <TextField label="Заголовок секции" value={section.title} onChange={(v) => patch({ title: v })} />
      <label className="label">Отзывы</label>
      <ListEditor
        items={section.items}
        onChange={(items) => patch({ items })}
        newItem={() => ({ author: "Имя", text: "", avatar: "", rating: 5 })}
        addLabel="отзыв"
        renderRow={(item, update) => (
          <>
            <input className="input" placeholder="Автор" value={item.author} onChange={(e) => update({ author: e.target.value })} />
            <textarea className="textarea" placeholder="Текст отзыва" value={item.text} onChange={(e) => update({ text: e.target.value })} />
          </>
        )}
      />
    </>
  );
}

function ContactMapFields({ section, patch }: { section: ContactMapSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="contact_map" variant={section.variant} patch={patch} />
      <TextField label="Адрес" value={section.address} onChange={(v) => patch({ address: v })} />
      <TextField label="Телефон" value={section.phone} onChange={(v) => patch({ phone: v })} />
      <TextField label="Email" value={section.email} onChange={(v) => patch({ email: v })} />
      <TextField label="2ГИС / карта — embed URL" value={section.map_embed_url} onChange={(v) => patch({ map_embed_url: v })} />
    </>
  );
}

function FooterFields({ section, patch }: { section: FooterSection; patch: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <VariantField sectionType="footer" variant={section.variant} patch={patch} />
      <TextField label="Название компании" value={section.company_name} onChange={(v) => patch({ company_name: v })} />
      <TextField label="Копирайт" value={section.copyright_text} onChange={(v) => patch({ copyright_text: v })} />
      <label className="label">Ссылки в футере</label>
      <ListEditor
        items={section.links}
        onChange={(links) => patch({ links })}
        newItem={() => ({ label: "Ссылка", href: "#" })}
        addLabel="ссылку"
        renderRow={(item, update) => (
          <>
            <input className="input" placeholder="Название" value={item.label} onChange={(e) => update({ label: e.target.value })} />
            <input className="input" placeholder="URL" value={item.href} onChange={(e) => update({ href: e.target.value })} />
          </>
        )}
      />
    </>
  );
}
