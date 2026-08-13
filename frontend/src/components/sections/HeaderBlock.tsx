import EditableText from "../EditableText";
import SiteNavLink from "../SiteNavLink";
import type { HeaderSection } from "../../types/site";

export default function HeaderBlock({
  section,
  onChange,
}: {
  section: HeaderSection;
  onChange: (patch: Partial<HeaderSection>) => void;
}) {
  return (
    <header className={`pv-header pv-header--${section.variant}${section.sticky ? " sticky" : ""}`}>
      <EditableText
        as="div"
        className="pv-header-logo"
        value={section.logo_text}
        onChange={(logo_text) => onChange({ logo_text })}
      />
      <nav className="pv-header-nav">
        {section.nav_items.map((item) => (
          <SiteNavLink key={item.label} href={item.href}>
            {item.label}
          </SiteNavLink>
        ))}
      </nav>
      {section.cta_text && <span className="pv-btn">{section.cta_text}</span>}
    </header>
  );
}
