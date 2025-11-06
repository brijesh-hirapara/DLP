import { hasPermission } from "utility/accessibility/hasPermission";
import { useGetRoles } from "./useGetRoles";

export function useAuthorization() {
  const roles = useGetRoles();

  return { hasPermission, roles };
}
