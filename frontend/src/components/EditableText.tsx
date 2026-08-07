import { useEffect, useRef, useState } from "react";
import type { ElementType, KeyboardEvent, MouseEvent } from "react";

import { usePreviewMode } from "./PreviewModeContext";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: ElementType;
  className?: string;
  placeholder?: string;
}

// Click-to-Edit (ТЗ п.4): двойной клик по тексту в превью превращает блок в
// редактируемое поле. Пока идёт правка, элемент не перерисовывается из React
// state (contentEditable — de facto неконтролируемый узел): перерисовка на
// каждый keystroke сбрасывала бы каретку в начало строки. Итоговый текст
// читаем из DOM в момент commit (blur / Enter).
export default function EditableText({ value, onChange, as = "span", className, placeholder }: EditableTextProps) {
  const { readOnly } = usePreviewMode();
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!editing || !ref.current) return;
    ref.current.textContent = value;
    ref.current.focus();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    const next = (ref.current?.textContent ?? "").trim();
    if (next !== value) onChange(next);
  };

  const cancel = () => {
    if (ref.current) ref.current.textContent = value;
    setEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      cancel();
    }
  };

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (readOnly) return;
    event.stopPropagation();
    setEditing(true);
  };

  const Component = as;

  return (
    <Component
      ref={ref}
      className={`editable-text${readOnly ? " readonly" : ""}${editing ? " editing" : ""}${className ? ` ${className}` : ""}`}
      contentEditable={!readOnly && editing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={readOnly ? undefined : commit}
      onKeyDown={readOnly ? undefined : handleKeyDown}
    >
      {editing ? undefined : value || placeholder}
    </Component>
  );
}
