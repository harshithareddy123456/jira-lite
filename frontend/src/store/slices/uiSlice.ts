import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../api/taskAPI";

export interface UIState {
  isModalOpen: boolean;
  editingTask: Task | null;
  filterCategory: string;
  filterPriority: string;
  searchTerm: string;
  debouncedSearchTerm: string;
}

const initialState: UIState = {
  isModalOpen: false,
  editingTask: null,
  filterCategory: "All",
  filterPriority: "All",
  searchTerm: "",
  debouncedSearchTerm: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingTask = null;
    },
    setEditingTask: (state, action: PayloadAction<Task | null>) => {
      state.editingTask = action.payload;
      state.isModalOpen = true;
    },
    clearEditingTask: (state) => {
      state.editingTask = null;
    },
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<string>) => {
      state.filterPriority = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setDebouncedSearchTerm: (state, action: PayloadAction<string>) => {
      state.debouncedSearchTerm = action.payload;
    },
    resetFilters: (state) => {
      state.filterCategory = "All";
      state.filterPriority = "All";
      state.searchTerm = "";
      state.debouncedSearchTerm = "";
    },
  },
});

export const {
  openModal,
  closeModal,
  setEditingTask,
  clearEditingTask,
  setFilterCategory,
  setFilterPriority,
  setSearchTerm,
  setDebouncedSearchTerm,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;
