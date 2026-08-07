import EditableText from "../EditableText";
import type { FooterSection } from "../../types/site";

export default function FooterBlock({
  section,
  onChange,
}: {
  section: FooterSection;
  onChange: (patch: Partial<FooterSection>) => void;
}) {
  if (section.variant === "columns") {
    return (
      <footer className="pv-footer pv-footer--columns">
        <div className="pv-footer-grid">
          <div className="pv-footer-col">
            <EditableText
              as="div"
              className="pv-footer-brand"
              value={section.company_name}
              onChange={(company_name) => onChange({ company_name })}
            />
          </div>
          {section.links.length > 0 && (
            <div className="pv-footer-col">
              <div className="pv-footer-col-title">Меню</div>
              <nav className="pv-footer-col-links">
                {section.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
          {section.socials.length > 0 && (
            <div className="pv-footer-col">
              <div className="pv-footer-col-title">Мы в сети</div>
              <nav className="pv-footer-col-links">
                {section.socials.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.platform}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
        <EditableText
          as="div"
          className="pv-footer-copyright"
          value={section.copyright_text}
          onChange={(copyright_text) => onChange({ copyright_text })}
        />
      </footer>
    );
  }

  if (section.variant === "minimal") {
    return (
      <footer className="pv-footer pv-footer--minimal">
        <EditableText value={section.copyright_text} onChange={(copyright_text) => onChange({ copyright_text })} />
      </footer>
    );
  }

  return (
    <footer className="pv-footer">
      <EditableText value={section.company_name} onChange={(company_name) => onChange({ company_name })} />
      <nav className="pv-header-nav">
        {section.links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <EditableText value={section.copyright_text} onChange={(copyright_text) => onChange({ copyright_text })} />
    </footer>
  );
}
