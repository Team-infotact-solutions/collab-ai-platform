import axios from "axios";
import { getToken } from "./authHelper";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const api = {
  // AUTH
  login: (data) => API.post("/auth/login", data),
  signup: (data) => API.post("/auth/register", data),
  getMe: () => API.get("/auth/me"),

  // TASKS
  getTasks: () => API.get("/tasks"),
  getTaskById: (id) => API.get(`/tasks/${id}`),
  createTask: (data) => API.post("/tasks", data),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  deleteTask: (id) => API.delete(`/tasks/${id}`),

  // PROJECTS
  getProjects: () => API.get("/projects"),
  getProjectById: (id) => API.get(`/projects/${id}`),
  createProject: (data) => API.post("/projects", data),

  // COMMENTS
  getComments: (taskId) => API.get(`/comments/task/${taskId}`),
  createComment: (taskId, data) => API.post(`/comments/task/${taskId}`, data),
  deleteComment: (commentId) => API.delete(`/comments/${commentId}`),

  // ADMIN COMMENTS
  getAllCommentsAdmin: () => API.get("/admin/comments"),
  deleteCommentAdmin: (commentId) => API.delete(`/admin/comments/${commentId}`),

  // VERSIONS
  getVersions: (taskId) => API.get(`/versions/${taskId}`),
  addVersion: (taskId, data) => API.post(`/versions/${taskId}`, data),

  // AI
  generateIdea: (topic) => API.post("/ideas", { topic }),

  // ADMIN
  getAllUsers: () => API.get("/admin/users"),
  updateUserRole: (userId, data) => API.patch(`/admin/users/${userId}`, data),
  getAllTasksAdmin: () => API.get("/admin/tasks"),
  deleteTaskAdmin: (taskId) => API.delete(`/admin/tasks/${taskId}`),
  getAllProjectsAdmin: () => API.get("/admin/projects"),
  deleteProjectAdmin: (projectId) => API.delete(`/admin/projects/${projectId}`),
  getAdminStats: () => API.get("/admin/stats"),

  // ANALYTICS
  getAnalyticsSummary: () => API.get("/analytics/summary"),
  getAnalyticsTasks: () => API.get("/analytics/tasks"),
  getAnalyticsProjects: () => API.get("/analytics/projects"),
};

export default api;
