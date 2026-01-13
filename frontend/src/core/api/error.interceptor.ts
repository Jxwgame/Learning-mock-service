import type { AxiosInstance } from "axios";

export function setupErrorInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      return Promise.reject(err);
    }
  );
}
