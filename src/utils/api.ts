import axios from 'axios';
import {
  getAccessTokenFromStorage,
  updateAccessTokenInStorage,
  fetchNewAccessToken,
  queueRequest,
  processQueue,
  handleRefreshFailure,
  isTokenRefreshing,
} from './tokenHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터: 요청을 보내기 전에 access token을 자동으로 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 응답이 실패했을 때 토큰 갱신 처리
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isTokenRefreshing.value) {
        return queueRequest(originalRequest, api);
      }

      isTokenRefreshing.value = true;

      try {
        const newToken = await fetchNewAccessToken();
        updateAccessTokenInStorage(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        handleRefreshFailure();
        return Promise.reject(err);
      } finally {
        isTokenRefreshing.value = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
