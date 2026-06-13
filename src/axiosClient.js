import axios from "axios";

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

    return config;
  },
  (error) => Promise.reject(error)
);

export const csrfCookie = () =>
  axios.get(`${import.meta.env.VITE_APP_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })

export default axiosClient;