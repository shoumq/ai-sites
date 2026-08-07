import { createContext, useContext } from "react";

// Позволяет EditableText и SectionRenderer узнать, что они рендерятся в
// автономном режиме просмотра (см. PreviewPage), не трогая сигнатуры
// компонентов блоков — иначе readOnly пришлось бы прокидывать через все 8
// Block-компонентов до каждого вызова EditableText.
export const PreviewModeContext = createContext<{ readOnly: boolean }>({ readOnly: false });

export function usePreviewMode() {
  return useContext(PreviewModeContext);
}
