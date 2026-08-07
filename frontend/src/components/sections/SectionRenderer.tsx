import type { MouseEvent } from "react";

import { usePreviewMode } from "../PreviewModeContext";
import type { Section } from "../../types/site";
import ContactMapBlock from "./ContactMapBlock";
import FooterBlock from "./FooterBlock";
import Grid3ColBlock from "./Grid3ColBlock";
import HeaderBlock from "./HeaderBlock";
import HeroBlock from "./HeroBlock";
import PricingBlock from "./PricingBlock";
import TestimonialsBlock from "./TestimonialsBlock";
import TextImageBlock from "./TextImageBlock";

interface SectionRendererProps {
  section: Section;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdateSection: (id: string, patch: Record<string, unknown>) => void;
}

export default function SectionRenderer({ section, selected, onSelect, onUpdateSection }: SectionRendererProps) {
  const { readOnly } = usePreviewMode();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(section.id);
  };

  const onChange = (patch: Record<string, unknown>) => onUpdateSection(section.id, patch);

  return (
    <div
      id={section.id}
      className={`site-section${selected && !readOnly ? " selected" : ""}${readOnly ? " readonly" : ""}`}
      onClick={readOnly ? undefined : handleClick}
      data-section-id={section.id}
    >
      {section.type === "header" && <HeaderBlock section={section} onChange={onChange} />}
      {section.type === "hero" && <HeroBlock section={section} onChange={onChange} />}
      {section.type === "text_image" && <TextImageBlock section={section} onChange={onChange} />}
      {section.type === "grid_3col" && <Grid3ColBlock section={section} onChange={onChange} />}
      {section.type === "pricing" && <PricingBlock section={section} onChange={onChange} />}
      {section.type === "testimonials" && <TestimonialsBlock section={section} onChange={onChange} />}
      {section.type === "contact_map" && <ContactMapBlock section={section} onChange={onChange} />}
      {section.type === "footer" && <FooterBlock section={section} onChange={onChange} />}
    </div>
  );
}
