import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useUserStore } from '../stores/useUserStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 실패한 요청을 임시로 저장할 큐
 */
interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: QueuedRequest[] = [];

/**
 * 현재 access token을 갱신 중인지 나타내는 플래그 객체
 */
export const isTokenRefreshing = {
  value: false,
};

/**
 * localStorage에서 access token을 꺼내오는 함수
 */
export const getAccessTokenFromStorage = (): string | null => {
  const persisted = localStorage.getItem('user-storage');
  return persisted ? JSON.parse(persisted).state?.accessToken : null;
};

/**
 * localStorage의 user-storage 항목에서 access token만 새 값으로 갱신하는 함수
 */
export const updateAccessTokenInStorage = (newToken: string) => {
  const persisted = localStorage.getItem('user-storage');
  if (persisted) {
    const parsed = JSON.parse(persisted);
    const updated = {
      ...parsed,
      state: {
        ...parsed.state,
        accessToken: newToken,
      },
    };
    localStorage.setItem('user-storage', JSON.stringify(updated));
  }
};

/**
 * 서버에 refresh token을 보내서 새로운 access token을 받아오는 함수
 */
export const fetchNewAccessToken = async (): Promise<string> => {
  const res = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return res.data.accessToken;
};

/**
 * access token을 갱신하는 동안 실패한 요청을 큐에 저장하고,
 * 토큰 갱신이 끝나면 다시 시도되도록 연결하는 함수
 */

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const queueRequest = (
  originalRequest: RetryableRequestConfig,
  apiInstance: AxiosInstance,
) => {
  return new Promise(function (resolve, reject) {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiInstance(originalRequest);
  });
};

/**
 * 대기 중이던 요청들에 새 토큰을 전달하거나, 실패한 경우 에러를 전달하는 함수
 */
export const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((queuedRequest) => {
    if (error) queuedRequest.reject(error);
    else queuedRequest.resolve(token);
  });
  failedQueue = [];
};

/**
 * 토큰 갱신에 실패했을 때 로그인 상태를 초기화하고 로그인 페이지로 이동시키는 함수
 */
export const handleRefreshFailure = () => {
  processQueue('Token refresh failed', null);
  useUserStore.getState().reset();
  localStorage.removeItem('user-storage');
  window.location.href = '/login';
};
