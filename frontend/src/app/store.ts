import { configureStore } from "@reduxjs/toolkit";

import { api } from "./api";
import authReducer from "../features/auth/authSlice";
import editorUiReducer from "../features/editor/editorUiSlice";
import generationReducer from "../features/funnel/generationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    editorUi: editorUiReducer,
    generation: generationReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
