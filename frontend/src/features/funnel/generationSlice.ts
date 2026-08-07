import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { GenerationProgress } from "../../types/api";

export type GenerationStatus = "idle" | "connecting" | "generating" | "done" | "error";

interface GenerationState {
  status: GenerationStatus;
  progress: GenerationProgress | null;
  error: string | null;
  resultProjectId: string | null;
}

const initialState: GenerationState = {
  status: "idle",
  progress: null,
  error: null,
  resultProjectId: null,
};

const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    startConnecting(state) {
      state.status = "connecting";
      state.progress = null;
      state.error = null;
      state.resultProjectId = null;
    },
    progressReceived(state, action: PayloadAction<GenerationProgress>) {
      state.status = "generating";
      state.progress = action.payload;
    },
    completed(state, action: PayloadAction<string>) {
      state.status = "done";
      state.resultProjectId = action.payload;
    },
    failed(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const { startConnecting, progressReceived, completed, failed, reset } = generationSlice.actions;
export default generationSlice.reducer;
