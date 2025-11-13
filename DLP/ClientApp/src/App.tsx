import "antd/dist/antd.less";
import { AppRouter } from "./router/AppRouter";
import "./static/css/style.css";
import "./styles/custom.css";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ConfigProvider } from "antd";
import "antd/dist/antd.less";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import config from "./config/config";
import store from "./redux/store";
import "./static/css/style.css";
import './i18n'
import locale from 'antd/lib/locale/en_US';
import { Suspense, useEffect } from "react";
import { getLogoImage } from "api/common";


const { theme, topMenu, darkMode, rtl } = config;
const App = () => {
  useEffect(() => {
    const favicon = document.getElementById("dynamic-favicon") as HTMLLinkElement;
    const logoPath = getLogoImage();
    // const logoPath = "/static/img/logo/truck.png";

    if (favicon) {
      favicon.href = logoPath;
    } else {
      const link = document.createElement("link");
      link.id = "dynamic-favicon";
      link.rel = "icon";
      link.href = logoPath;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfigProvider direction={"ltr"} locale={locale}>
        <ThemeProvider theme={{ ...theme, rtl, topMenu, darkMode }}>
          <Provider store={store}>
              <AppRouter />
          </Provider>
        </ThemeProvider>
      </ConfigProvider>
    </Suspense>
  );
};

export default App;
