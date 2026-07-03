import axios from "axios";

const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<{ access_token: string }>("/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post<{ access_token: string }>("/auth/login", { email, password }),

  me: () => api.get<{ id: number; name: string; email: string }>("/auth/me"),
};
