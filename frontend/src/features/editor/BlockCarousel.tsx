import { useDraggable } from "@dnd-kit/core";

import { BLOCK_LIBRARY } from "../../types/site";
import type { SectionType } from "../../types/site";

function BlockChip({ type, label }: { type: SectionType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { kind: "library", blockType: type },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="block-chip" style={{ opacity: isDragging ? 0.4 : 1 }}>
      {label}
    </div>
  );
}

// Вкладка «Блоки» (ТЗ п.4): горизонтальная карусель из 8 типов блоков —
// перетаскиваются на превью и вставляются в отпущенное место.
export default function BlockCarousel() {
  return (
    <div>
      <div className="block-carousel">
        {BLOCK_LIBRARY.map((b) => (
          <BlockChip key={b.type} type={b.type} label={b.label} />
        ))}
      </div>
      <p className="block-hint">Перетащите блок на превью слева — он встанет в отпущенное место.</p>
    </div>
  );
}
