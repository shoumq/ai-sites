import EditableText from "../EditableText";
import type { TextImageSection } from "../../types/site";

export default function TextImageBlock({
  section,
  onChange,
}: {
  section: TextImageSection;
  onChange: (patch: Partial<TextImageSection>) => void;
}) {
  return (
    <section className={`pv-text-image pos-${section.image_position}`}>
      <div className="pv-text">
        <EditableText as="h2" value={section.title} onChange={(title) => onChange({ title })} />
        <EditableText as="p" value={section.text} onChange={(text) => onChange({ text })} />
      </div>
      {section.image ? (
        <img src={section.image} alt={section.title} />
      ) : (
        <div className="pv-image-placeholder">
          <span className="ai-badge">✨ Изображение</span>
          Сгенерируйте картинку во вкладке «Конструктор»
        </div>
      )}
    </section>
  );
}
