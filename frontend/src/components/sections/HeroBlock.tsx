import EditableText from "../EditableText";
import type { HeroSection } from "../../types/site";

export default function HeroBlock({
  section,
  onChange,
}: {
  section: HeroSection;
  onChange: (patch: Partial<HeroSection>) => void;
}) {
  const title = <EditableText as="h1" value={section.title} onChange={(v) => onChange({ title: v })} placeholder="Заголовок" />;
  const subtitle = (
    <EditableText as="p" value={section.subtitle} onChange={(v) => onChange({ subtitle: v })} placeholder="Подзаголовок" />
  );
  const cta = section.cta_text && (
    <a className="pv-btn" href={section.cta_href || "#"}>
      {section.cta_text}
    </a>
  );

  if (section.variant === "split") {
    return (
      <section className="pv-hero pv-hero--split">
        <div className="pv-hero-text">
          {title}
          {subtitle}
          {cta}
        </div>
        {section.bg_image ? (
          <img src={section.bg_image} alt={section.title} />
        ) : (
          <div className="pv-image-placeholder">
            <span className="ai-badge">✨ Изображение</span>
            Сгенерируйте картинку во вкладке «Конструктор»
          </div>
        )}
      </section>
    );
  }

  if (section.variant === "minimal") {
    return (
      <section className="pv-hero pv-hero--minimal">
        {title}
        {subtitle}
        {cta}
      </section>
    );
  }

  if (section.variant === "gradient") {
    return (
      <section className="pv-hero pv-hero--gradient">
        {title}
        {subtitle}
        {cta}
      </section>
    );
  }

  if (section.variant === "overlay") {
    return (
      <section
        className={`pv-hero pv-hero--overlay${section.bg_image ? "" : " no-image"}`}
        style={section.bg_image ? { backgroundImage: `url(${section.bg_image})` } : undefined}
      >
        <div className="pv-hero-overlay-scrim" />
        <div className="pv-hero-overlay-content">
          {title}
          {subtitle}
          {cta}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`pv-hero pv-hero--centered${section.bg_image ? "" : " no-image"}`}
      style={section.bg_image ? { backgroundImage: `url(${section.bg_image})` } : undefined}
    >
      {title}
      {subtitle}
      {cta}
    </section>
  );
}
