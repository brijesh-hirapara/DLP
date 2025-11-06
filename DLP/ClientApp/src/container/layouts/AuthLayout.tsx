import { Col, Row } from "antd";
import Heading from "components/heading/heading";
import {  AuthWrapper } from "pages/authentication/style";
import { Outlet, useLocation } from "react-router-dom";


const AuthLayout = () => {
  const location = useLocation();

  // Disable overlay for forgot-password path
  const noOverlay = location.pathname === "/forgot-password";

  return (
    <AuthWrapper noOverlay={true}>
      {/* <Col xxl={8} xl={9} lg={12} md={8} xs={24}>
        <Aside>
          <div className="auth-side-content">
            <img
              src={require("static/img/auth/topShape.png")}
              alt=""
              className="topShape"
            />
            <img
              src={require("static/img/auth/bottomShape.png")}
              alt=""
              className="bottomShape"
            />
            <Content>
              
              <img
                className="auth-content-figure"
                src={require("static/img/auth/signin.png")}
                alt=""
                style={{marginTop: 150}}
                width={'100%'}
              />
            </Content>
          </div>
        </Aside>
      </Col> */}

      <div  className="auth-contents">
        <Outlet />
      </div>
    </AuthWrapper>
  );
};

export default AuthLayout;
