import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskAPI, Task, TaskFilters } from "../../api/taskAPI";

export interface TaskState {
  items: Task[];
  stats: any;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
}

const initialState: TaskState = {
  items: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filters: TaskFilters = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getAllTasks(filters);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error || "Failed to fetch tasks");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(taskData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Failed to create task");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, data }: { id: number; data: Partial<Task> },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskAPI.updateTask(id, data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Failed to update task");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await taskAPI.deleteTask(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || "Failed to delete task");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  "tasks/fetchTaskStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getStats();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || "Failed to fetch stats");
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.items = action.payload.data;
        }
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch tasks";
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create task";
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.items.findIndex((t) => t.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update task";
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to delete task";
      });

    // Fetch stats
    builder
      .addCase(fetchTaskStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch stats";
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
