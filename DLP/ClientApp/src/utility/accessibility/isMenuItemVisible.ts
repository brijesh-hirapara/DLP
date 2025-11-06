import { getCurrentUserModules } from ".";
import { hasPermission } from "./hasPermission";

export const isMenuItemVisible = (menuItem: any) => {
  const { claimName, checkOnlyPermission } = menuItem;
  if (checkOnlyPermission) return hasPermission(menuItem.claimName);

  const currentUserModules = getCurrentUserModules();
  return currentUserModules.includes(claimName);
};
