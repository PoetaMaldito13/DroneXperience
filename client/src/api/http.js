import axios from "axios";
export const http = axios.create({
  baseURL: "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});
http.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const failure = new Error(
      error.response?.data?.message ||
        "No fue posible conectar con la API. Comprueba que el servidor esté disponible.",
    );
    failure.details = error.response?.data?.details;
    failure.status = error.response?.status;
    return Promise.reject(failure);
  },
);
