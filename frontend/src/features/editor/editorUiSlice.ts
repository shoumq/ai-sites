import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type PanelTab = "constructor" | "blocks" | "chat";
export type PreviewMode = "desktop" | "mobile";

interface EditorUiState {
  selectedSectionId: string | null;
  activeTab: PanelTab;
  previewMode: PreviewMode;
}

const initialState: EditorUiState = {
  selectedSectionId: null,
  activeTab: "constructor",
  previewMode: "desktop",
};

const editorUiSlice = createSlice({
  name: "editorUi",
  initialState,
  reducers: {
    selectSection(state, action: PayloadAction<string | null>) {
      state.selectedSectionId = action.payload;
    },
    setActiveTab(state, action: PayloadAction<PanelTab>) {
      state.activeTab = action.payload;
    },
    setPreviewMode(state, action: PayloadAction<PreviewMode>) {
      state.previewMode = action.payload;
    },
  },
});

export const { selectSection, setActiveTab, setPreviewMode } = editorUiSlice.actions;
export default editorUiSlice.reducer;
