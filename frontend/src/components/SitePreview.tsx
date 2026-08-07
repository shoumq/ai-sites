import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties } from "react";

import { PreviewModeContext } from "./PreviewModeContext";
import { FONT_STACKS } from "../types/site";
import type { Page, Theme } from "../types/site";
import SectionRenderer from "./sections/SectionRenderer";

function DropGap({ index, insertMode }: { index: number; insertMode: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `gap-${index}` });
  return (
    <div
      ref={setNodeRef}
      className={`drop-gap${insertMode ? " insert-mode" : ""}${isOver ? " over" : ""}`}
      style={{
        height: insertMode ? 16 : 0,
        transition: "height 0.15s ease",
        background: isOver ? "var(--app-accent)" : insertMode ? "rgba(37,99,235,0.15)" : "transparent",
      }}
    />
  );
}

interface SitePreviewProps {
  page: Page;
  theme: Theme;
  selectedSectionId?: string | null;
  onSelect?: (id: string) => void;
  onUpdateSection?: (id: string, patch: Record<string, unknown>) => void;
  insertMode?: boolean;
  /** Автономный просмотр сайта (см. PreviewPage) — без выделения блоков,
   * inline-редактирования и DnD drop-zones, только вёрстка. */
  readOnly?: boolean;
}

export default function SitePreview({
  page,
  theme,
  selectedSectionId = null,
  onSelect,
  onUpdateSection,
  insertMode = false,
  readOnly = false,
}: SitePreviewProps) {
  const style: CSSProperties & Record<string, string> = {
    "--primary": theme.primary_color,
    "--preview-font": FONT_STACKS[theme.font],
  };
  const noop = () => {};

  return (
    <PreviewModeContext.Provider value={{ readOnly }}>
      <div className="site-preview" style={style} onClick={readOnly ? undefined : () => onSelect?.("")}>
        {!readOnly && <DropGap index={0} insertMode={insertMode} />}
        {page.sections.map((section, i) => (
          <div key={section.id}>
            <SectionRenderer
              section={section}
              selected={selectedSectionId === section.id}
              onSelect={onSelect ?? noop}
              onUpdateSection={onUpdateSection ?? noop}
            />
            {!readOnly && <DropGap index={i + 1} insertMode={insertMode} />}
          </div>
        ))}
      </div>
    </PreviewModeContext.Provider>
  );
}
