
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomRouteProps, MainRoutes } from "router/Routes";
import { getCurrentUserModules } from "utility/accessibility";
import { hasPermission } from "utility/accessibility/hasPermission";

const MainRoutesDictionary: Record<string, CustomRouteProps> = {};

MainRoutes.forEach((route) => {
  MainRoutesDictionary[route.path ?? ""] = route;
});

export const useCheckRouteAccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserModules = getCurrentUserModules();
  

  useEffect(() => {
    const currentRoute = MainRoutesDictionary[location.pathname] ?? null;

    if (!currentRoute) {
      return;
    }

    if (!currentRoute.hasAccess()) {
      hasPermission('dashboard') ?  navigate('/', { replace: true }) :  navigate(`${currentUserModules[0]}`, { replace: true })
    }else{
     
    }
  }, [location, navigate]);
};
