import EditableText from "../EditableText";
import type { ContactMapSection } from "../../types/site";

export default function ContactMapBlock({
  section,
  onChange,
}: {
  section: ContactMapSection;
  onChange: (patch: Partial<ContactMapSection>) => void;
}) {
  const info = (
    <>
      <EditableText as="h2" value={section.title} onChange={(title) => onChange({ title })} />
      <EditableText as="p" value={section.address} onChange={(address) => onChange({ address })} placeholder="Адрес" />
      <EditableText as="p" value={section.phone} onChange={(phone) => onChange({ phone })} placeholder="Телефон" />
      <EditableText as="p" value={section.email} onChange={(email) => onChange({ email })} placeholder="Email" />
    </>
  );

  if (section.variant === "split") {
    return (
      <section className="pv-contact pv-contact--split">
        <div className="pv-contact-map-col">
          {section.show_map && section.map_embed_url ? (
            <iframe src={section.map_embed_url} className="pv-contact-iframe" loading="lazy" title="Карта" />
          ) : (
            <div className="pv-image-placeholder pv-contact-map-placeholder">
              <span className="ai-badge">🗺️ Карта</span>
              Добавьте embed-ссылку 2ГИС в настройках блока
            </div>
          )}
        </div>
        <div className="pv-contact-info-col">{info}</div>
      </section>
    );
  }

  if (section.variant === "cards") {
    return (
      <section className="pv-contact">
        <EditableText as="h2" value={section.title} onChange={(title) => onChange({ title })} />
        <div className="pv-contact-cards">
          <div className="pv-contact-card">
            <span className="pv-contact-card-label">Адрес</span>
            <EditableText as="p" value={section.address} onChange={(address) => onChange({ address })} placeholder="Адрес" />
          </div>
          <div className="pv-contact-card">
            <span className="pv-contact-card-label">Телефон</span>
            <EditableText as="p" value={section.phone} onChange={(phone) => onChange({ phone })} placeholder="Телефон" />
          </div>
          <div className="pv-contact-card">
            <span className="pv-contact-card-label">Email</span>
            <EditableText as="p" value={section.email} onChange={(email) => onChange({ email })} placeholder="Email" />
          </div>
        </div>
        {section.show_map && section.map_embed_url && (
          <iframe src={section.map_embed_url} style={{ width: "100%", height: 260, border: 0, marginTop: 24 }} loading="lazy" title="Карта" />
        )}
      </section>
    );
  }

  return (
    <section className="pv-contact">
      {info}
      {section.show_map && section.map_embed_url && (
        <iframe src={section.map_embed_url} style={{ width: "100%", height: 260, border: 0, marginTop: 16 }} loading="lazy" title="Карта" />
      )}
    </section>
  );
}
