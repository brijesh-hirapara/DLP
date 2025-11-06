import { LocalStorageKeys } from "hooks/useLocalStorage";
import jwt_decode from "jwt-decode";

export const decodeJWT = () => {
  const user = localStorage.getItem(LocalStorageKeys.user);
  if (user) {
    const parsedUser = JSON.parse(user);
    return parsedUser ? jwt_decode(parsedUser?.accessToken) : null;
  }
  return null;
};

export const getRole = () => {
  const token = decodeJWT();
  return token ? token?.role : "";
};

export const isInstitution = () => {
  const token = decodeJWT();
  return token?.isInstitution === "True";
}
