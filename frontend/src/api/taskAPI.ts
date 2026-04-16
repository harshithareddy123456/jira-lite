export interface TaskFilters {
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Task {
  id: number;
  taskId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  storyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationResponse;
  count?: number;
  error?: string;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const taskAPI = {
  getAllTasks: async (filters: TaskFilters = {}): Promise<ApiResponse<Task[]>> => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  },

  getTask: async (id: number): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }
    return response.json();
  },

  createTask: async (taskData: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    return response.json();
  },

  updateTask: async (
    id: number,
    taskData: Partial<Task>
  ): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  },

  deleteTask: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    return response.json();
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }
    return response.json();
  },
};
