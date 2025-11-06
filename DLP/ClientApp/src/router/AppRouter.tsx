import { Spin } from "antd";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "container/layouts/AppLayout";
import { AuthRoutes, MainRoutes } from "./Routes";
import AuthLayout from "container/layouts/AuthLayout";
import { CommonDataProvider } from "contexts/CommonDataContext/CommonDataProvider";

export const AppRouter = () => {
  const isLoggedIn = localStorage.getItem("user");
 
  if (
    !isLoggedIn && 
    !AuthRoutes.map((x) => x.path).includes(window.location.pathname)
  ) {
    localStorage.removeItem("user");
    window.location.href = "/login";
    localStorage.removeItem("user")
  }
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense
        fallback={
          <div className="spin">
            <Spin />
          </div>
        }
      >
        <Routes>
          <Route element={<AuthLayout />}>
            {AuthRoutes.map((route, index) => (
              <Route key={index} {...route} />
            ))}
          </Route>
          <Route
            element={
              <CommonDataProvider>
                <AppLayout />
              </CommonDataProvider>
            }
          >
            {MainRoutes.map((route, index) => (
              <Route key={index} {...route} />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
