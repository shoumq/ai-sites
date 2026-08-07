import EditableText from "../EditableText";
import type { TestimonialsSection } from "../../types/site";

export default function TestimonialsBlock({
  section,
  onChange,
}: {
  section: TestimonialsSection;
  onChange: (patch: Partial<TestimonialsSection>) => void;
}) {
  const title = <EditableText as="h2" value={section.title} onChange={(v) => onChange({ title: v })} />;

  if (section.variant === "quotes") {
    return (
      <section className="pv-testimonials">
        {title}
        <div className="pv-quotes">
          {section.items.map((item, i) => (
            <div className="pv-quote" key={i}>
              <span className="pv-quote-mark">&ldquo;</span>
              <p>{item.text}</p>
              <cite>{item.author}</cite>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.variant === "avatars_row") {
    return (
      <section className="pv-testimonials">
        {title}
        <div className="pv-avatars-row">
          {section.items.map((item, i) => (
            <div className="pv-avatar-item" key={i}>
              <div className="pv-avatar-circle">
                {item.avatar ? <img src={item.avatar} alt={item.author} /> : item.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p>{item.text}</p>
                <cite>{item.author}</cite>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.variant === "single_featured" && section.items.length > 0) {
    const item = section.items[0];
    return (
      <section className="pv-testimonials">
        {title}
        <div className="pv-featured-quote">
          <span className="pv-quote-mark">&ldquo;</span>
          <p>{item.text}</p>
          <cite>{item.author}</cite>
        </div>
      </section>
    );
  }

  return (
    <section className="pv-testimonials">
      {title}
      <div className="pv-testimonial-list">
        {section.items.map((item, i) => (
          <div className="pv-testimonial" key={i}>
            <p>&ldquo;{item.text}&rdquo;</p>
            <cite>{item.author}</cite>
          </div>
        ))}
      </div>
    </section>
  );
}
