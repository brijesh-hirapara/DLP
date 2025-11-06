import { AxiosInstance, AxiosRequestConfig } from "axios";
import { showServerErrors } from "utility/showServerErrors";
import { AuthApi } from "./clients/auth-api";

const authApi = new AuthApi();

let isRefreshing = false; // Flag to track if refresh token request is in progress
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = []; // Queue to store failed requests while refresh token is pending

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

export const setRefreshToken = async () => {
  const user = JSON.parse(localStorage.getItem("user") as string);
  if (user && user.accessToken) {
    try {
      const refreshResponse = await authApi.apiAuthRefreshTokenPost({
        refreshTokenRequest: {
          accessToken: user.accessToken,
          rememberMe: false,
        },
      });

      const newToken = refreshResponse.data;
      if (newToken) {
        localStorage.setItem("user", JSON.stringify(newToken));
        return newToken.accessToken;
      }
    } catch (refreshError) {
      showServerErrors(refreshError);
      throw refreshError;
    }
  }
};

const axiosIntercept = (axios: AxiosInstance) => {
  axios.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const urlData = config?.url?.split("/");
      const user = JSON.parse(localStorage.getItem("user") as string);

      if (user && user.accessToken && urlData) {
        if (urlData[urlData?.length - 1] !== "refresh-token") {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${user.accessToken}`,
          };
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // if (error.response?.status === 401 && !originalRequest._retry) {
      //   if (isRefreshing) {
      //     // If refresh token request is in progress, queue this request
      //     return new Promise((resolve, reject) => {
      //       failedQueue.push({ resolve, reject });
      //     })
      //       .then((token) => {
      //         // Retry the original request with the new token
      //         originalRequest.headers["Authorization"] = `Bearer ${token}`;
      //         return axios(originalRequest);
      //       })
      //       .catch((err) => Promise.reject(err));
      //   }

      //   originalRequest._retry = true; // Mark the request as retried
      //   isRefreshing = true;

      //   try {
      //     const newToken = await setRefreshToken();
      //     processQueue(null, newToken); // Resolve queued requests with the new token
      //     isRefreshing = false;

      //     // Retry the original request with the new token
      //     originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      //     return axios(originalRequest);
      //   } catch (refreshError) {
      //     processQueue(refreshError, null); // Reject queued requests if refresh failed
      //     isRefreshing = false;
      //     throw refreshError;
      //   }
      // }

      showServerErrors(error);
      return Promise.reject(error);
    }
  );
};

export default axiosIntercept;
