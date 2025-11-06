import { useDecodeJWT } from './useDecodeJWT';

export const useAccessLevel = () => {
  const token = useDecodeJWT();
  return parseInt(token?.accessLevel);
};
