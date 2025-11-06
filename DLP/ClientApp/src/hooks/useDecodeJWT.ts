import { useState, useEffect } from "react";
import { LocalStorageKeys, useLocalStorage } from "./useLocalStorage";
import jwt_decode from "jwt-decode";

export function useDecodeJWT(): any {
  const [user] = useLocalStorage(LocalStorageKeys.user, null, true);
  return jwt_decode(user.accessToken);
}
