import type { ReactNode } from "react";

// Универсальный редактор списков (услуги, тарифы, отзывы, ссылки…) с кнопкой
// «+» для добавления строк, как требует ТЗ п.4 («Секция «Контент»»).
interface ListEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  newItem: () => T;
  addLabel: string;
}

export default function ListEditor<T>({ items, onChange, renderRow, newItem, addLabel }: ListEditorProps<T>) {
  const updateAt = (index: number, patch: Partial<T>) => {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      {items.map((item, i) => (
        <div className="list-row" key={i}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {renderRow(item, (patch) => updateAt(i, patch))}
          </div>
          <button type="button" className="remove-row-btn" onClick={() => removeAt(i)} aria-label="Удалить">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="add-row-btn" onClick={() => onChange([...items, newItem()])}>
        + {addLabel}
      </button>
    </div>
  );
}
