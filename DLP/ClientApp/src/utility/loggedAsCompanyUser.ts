import { PredefinedRoles } from "constants/constants";
import { getRole } from "utility/decode-jwt";

const loggedAsCompanyUser = () => {
  const roles = getRole();
  return Object.values(PredefinedRoles)
    .filter(role => role !== PredefinedRoles.SUPER_ADMINISTRATOR)
    .some(role => roles.includes(role));
};

export default loggedAsCompanyUser;
