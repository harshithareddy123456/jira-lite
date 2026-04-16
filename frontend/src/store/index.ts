import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./slices/taskSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
