import { decodeJWT } from "utility/decode-jwt";

export const getClaims = () => {
  const token: any = decodeJWT();

  if (token) {
    const tempClaims = token?.Permissions || [];
    return Array.isArray(tempClaims) ? tempClaims : [tempClaims];
  }

  return [];
};
