import { PredefinedRoles } from "constants/constants";
import { getRole } from "utility/decode-jwt";

const isSuperAdmin = () => {
  const role = getRole();
  
  if(Array.isArray(role)){
    return  role.includes(PredefinedRoles.SUPER_ADMINISTRATOR)
  }
  return  role === PredefinedRoles.SUPER_ADMINISTRATOR;
};

export default isSuperAdmin;
