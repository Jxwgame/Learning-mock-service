import { authApi } from "../../modules/auth/auth.api";
import { getAccessToken, setTokens, logoutSession } from "./session.manager";
import type { AxiosInstance } from "axios";

let isRefreshing = false;
let queue: ((token: string) => void)[] = [];

export function setupAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(
    (config) => {
      const token: string | null = getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      // Only attempt refresh if it's a 401 Unauthorized error
      if (
        error.response?.status === 401 &&
        !original._retry &&
        !original.url?.includes("/auth/refresh") &&
        !original.url?.includes("/auth/mfa/verify")
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            queue.push((token: string) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            });
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          // Cookie based refresh - no need to pass token
          const res = await authApi.refresh();
          setTokens(res.accessToken);
          flushQueue(res.accessToken);

          original.headers.Authorization = `Bearer ${res.accessToken}`;
          return client(original);
        } catch (e) {
          logoutSession();
          // Redirect to login only if refresh fails with 401 or 403
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
}

function flushQueue(token: string) {
  queue.forEach((cb) => cb(token));
  queue = [];
}
