import EditableText from "../EditableText";
import type { PricingSection } from "../../types/site";

export default function PricingBlock({
  section,
  onChange,
}: {
  section: PricingSection;
  onChange: (patch: Partial<PricingSection>) => void;
}) {
  const explicitIndex = section.plans.findIndex((p) => p.highlighted);
  const highlightIndex = section.variant === "highlight" ? (explicitIndex >= 0 ? explicitIndex : Math.floor(section.plans.length / 2)) : -1;

  if (section.variant === "table") {
    return (
      <section className="pv-pricing">
        <EditableText as="h2" value={section.title} onChange={(v) => onChange({ title: v })} />
        <div className="pv-pricing-table">
          {section.plans.map((plan, i) => (
            <div className={`pv-pricing-row${plan.highlighted ? " highlighted" : ""}`} key={i}>
              <div className="pv-pricing-row-name">{plan.name}</div>
              <div className="pv-pricing-row-features">{plan.features.join(" · ")}</div>
              <div className="pv-pricing-row-price">
                {plan.price} ₽/{plan.period}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.variant === "minimal") {
    return (
      <section className="pv-pricing">
        <EditableText as="h2" value={section.title} onChange={(v) => onChange({ title: v })} />
        <div className="pv-pricing-minimal">
          {section.plans.map((plan, i) => (
            <div className={`pv-pricing-minimal-item${plan.highlighted ? " highlighted" : ""}`} key={i}>
              <span>{plan.name}</span>
              <span className="pv-price">
                {plan.price} ₽/{plan.period}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pv-pricing">
      <EditableText as="h2" value={section.title} onChange={(v) => onChange({ title: v })} />
      <div className={`pv-plans${section.variant === "highlight" ? " pv-plans--highlight" : ""}`}>
        {section.plans.map((plan, i) => (
          <div className={`pv-plan${i === highlightIndex ? " highlighted" : ""}`} key={i}>
            <h3>{plan.name}</h3>
            <div className="pv-plan-price">
              {plan.price} ₽/{plan.period}
            </div>
            <ul>
              {plan.features.map((feature, j) => (
                <li key={j}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
