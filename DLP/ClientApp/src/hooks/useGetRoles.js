import { useEffect, useState } from 'react';
import { useDecodeJWT } from './useDecodeJWT';

export const useGetRoles = () => {
  const [roles, setRoles] = useState("");
  const token = useDecodeJWT();

  useEffect(() => {
    if (token) {
      setRoles(token.role || "");
    }
  }, [token]);

  return roles;
};
