import axios from "axios";
import { getAccessToken } from "../../core/api/session.manager";
import { setupAuthInterceptor } from "../../core/api/auth.interceptor";
import { getDeviceId } from "./device.manager";

const client = axios.create({
  baseURL: "/api", // Use Vite Proxy
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  const deviceId = getDeviceId();

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Device-Id"] = deviceId;
  config.headers["X-Request-Id"] = crypto.randomUUID?.() || Math.random().toString(36).substring(2);

  return config;
});

setupAuthInterceptor(client);

client.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object' && 'ok' in response.data && 'data' in response.data) {
    response.data = response.data.data;
  }
  return response;
});

export default client;
