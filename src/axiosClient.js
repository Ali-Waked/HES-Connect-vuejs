import axios from "axios";

let workspaceIdProvider = null;

export function setWorkspaceIdProvider(fn) {
  workspaceIdProvider = fn;
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const lang = localStorage.getItem("lang") || "en";
    config.headers["Accept-Language"] = lang;

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (workspaceIdProvider) {
      const wsId = workspaceIdProvider();
      if (wsId) {
        config.headers["X-Workspace-Id"] = wsId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const csrfCookie = () =>
  axios.get(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })

export default axiosClient;
