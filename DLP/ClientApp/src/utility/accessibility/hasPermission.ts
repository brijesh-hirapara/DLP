import { getClaims } from "utility/getClaims";

export const hasPermission = (claimKey: string) => {
  const claims = getClaims();  
  return claims.some((claim) => claim === claimKey);
};
