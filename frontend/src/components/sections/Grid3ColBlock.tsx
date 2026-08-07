import EditableText from "../EditableText";
import type { Grid3ColSection } from "../../types/site";

export default function Grid3ColBlock({
  section,
  onChange,
}: {
  section: Grid3ColSection;
  onChange: (patch: Partial<Grid3ColSection>) => void;
}) {
  const title = <EditableText as="h2" value={section.title} onChange={(v) => onChange({ title: v })} />;
  const cta = section.cta_text && (
    <div style={{ marginTop: 24 }}>
      <span className="pv-btn">{section.cta_text}</span>
    </div>
  );

  if (section.variant === "icon_rows") {
    return (
      <section className="pv-grid">
        {title}
        <div className="pv-rows">
          {section.items.map((item, i) => (
            <div className="pv-row" key={i}>
              <span className="pv-row-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="pv-row-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <span className="pv-price">{item.price}</span>
            </div>
          ))}
        </div>
        {cta}
      </section>
    );
  }

  if (section.variant === "minimal_list") {
    return (
      <section className="pv-grid">
        {title}
        <div className="pv-minimal-list">
          {section.items.map((item, i) => (
            <div className="pv-minimal-row" key={i}>
              <span>{item.name}</span>
              <span className="pv-price">{item.price}</span>
            </div>
          ))}
        </div>
        {cta}
      </section>
    );
  }

  if (section.variant === "icon_top") {
    return (
      <section className="pv-grid">
        {title}
        <div className="pv-grid-cols pv-grid-cols--icon-top">
          {section.items.map((item, i) => (
            <div className="pv-card pv-card--icon-top" key={i}>
              <span className="pv-card-icon">{item.icon || "✦"}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="pv-price">{item.price}</span>
            </div>
          ))}
        </div>
        {cta}
      </section>
    );
  }

  if (section.variant === "compact_grid") {
    return (
      <section className="pv-grid">
        {title}
        <div className="pv-compact-grid">
          {section.items.map((item, i) => (
            <div className="pv-compact-card" key={i}>
              <h3>{item.name}</h3>
              <span className="pv-price">{item.price}</span>
            </div>
          ))}
        </div>
        {cta}
      </section>
    );
  }

  return (
    <section className="pv-grid">
      {title}
      <div className="pv-grid-cols">
        {section.items.map((item, i) => (
          <div className="pv-card" key={i}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span className="pv-price">{item.price}</span>
          </div>
        ))}
      </div>
      {cta}
    </section>
  );
}
