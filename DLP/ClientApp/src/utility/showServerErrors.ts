import { notification } from "antd";
import openNotificationWithIcon from "./notification";

export const showServerErrors = (error: any) => {
  const _error = { ...error };
  notification.destroy();

  if (
    _error.response &&
    (_error.response.status === 400 || _error.response.status === 500)
  ) {
    const serverError = _error.response.data;
    let errorMessages = "";
    if (serverError.errors) {
      Object.keys(serverError.errors).forEach((key) => {
        errorMessages += serverError.errors[key].join("\n");
      });
    } else if (serverError.detail) {
      errorMessages += serverError.detail;
    }

    // if (errorMessages?.trim()) {
    //   openNotificationWithIcon("error", error.title ?? serverError, errorMessages);
    // }
    openNotificationWithIcon("error", error.title ?? serverError, errorMessages);
  } else if (_error.response && _error.response.status === 401) {
    // Unauthorized Request
    // localStorage.removeItem("user");
    window.location.replace("/login");
    localStorage.removeItem("user")
  } else if (_error.response && _error.response.status === 403) {
    // Forbidden Request
    // store.dispatch(forbiddenRequest());
    window.location.replace("/error/403");
  } else if (_error.response && _error.response.status === 404) {
    // Route not found
    // store.dispatch(erroredRequest());
    window.location.replace("/error/404");
  }
};
