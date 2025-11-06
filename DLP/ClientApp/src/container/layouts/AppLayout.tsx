import { Alert, Button, Col, Layout, Row, SiderProps } from "antd";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import MenuItems from "../../components/layout/MenuItems";
import TopMenu from "../../components/layout/TopMenu";
import { Div } from "../../components/layout/style";
import AuthInfo from "../../components/utilities/auth-info/info";
import { useCheckRouteAccess } from "hooks/useCheckRouteAccess";
import isSuperAdmin from "utility/isSuperAdmin";
import { getLogoImage } from "api/common";
import { useTranslation } from "react-i18next";
import { Footer } from "antd/lib/layout/layout";
import { Scrollbars } from "react-custom-scrollbars";

const { Header, Sider, Content } = Layout;

const SideBarStyle: SiderProps["style"] = {
  margin: "63px 0 0 0",
  padding: "15px 15px 55px 15px",
  height: "100vh",
  position: "fixed",
  left: 0,
  zIndex: 998,
};

const footerStyle = {
  padding: '20px 30px 18px',
  color: 'rgba(0, 0, 0, 0.65)',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, .90)',
  width: '100%',
  boxShadow: '0 -5px 10px rgba(146,153,184, 0.05)',
  display: 'flex',
  justifyContent: 'center',  // centers horizontally
  alignItems: 'center',      // centers vertically
};


const topMenu = false;
const rtl = null;
const darkMode = false;

export const AppLayout = () => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [logoSrc, setLogoSrc] = useState("");
  const navigate = useNavigate();
  const isSuperAdministrator = isSuperAdmin();
  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  useCheckRouteAccess();

  useEffect(() => {
    const isLoggedIn: any = localStorage.getItem("user");
    if (JSON.parse(isLoggedIn)?.shouldShowOnboarding) {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      localStorage.removeItem("user");
    }
  }, [navigate]);

  useEffect(() => {
    // const logo = getLogoImage();
    const logo = require("static/img/logo/mvp-logo.jpg")
    setLogoSrc(logo);
  }, []);


  return (
    <Div>
      <Layout className="layout">
        <Header
          style={{
            position: "fixed",
            width: "100%",
            top: 0,
            // left: 0,
            // backgroundColor: " #29AAE3",
            zIndex: 1000,
            [!rtl ? "left" : "right"]: 0,
            // color: "#fff",
          }}
        >
          <Row>
            <Col
              lg={!topMenu ? 4 : 3}
              sm={6}
              xs={12}
              className="align-center-v navbar-brand"
            >
              {!topMenu || window.innerWidth <= 991 ? (
                <Button
                  type="link"
                  className="menu-toggle-btn"
                  onClick={toggleCollapsed}
                >
                  {/* <FeatherIcon icon="menu" /> */}
                  <img src={require(`static/img/icon/${collapsed ? 'right.svg' : 'left.svg'}`)} alt="menu" />
                </Button>
              ) : null}
              <Link
                className={
                  topMenu && window.innerWidth > 991
                    ? "striking-logo top-menu"
                    : "striking-logo"
                }
                to="/"
              >
                <img
                  src={logoSrc}
                  alt="DLP"
                  // style={{
                  //   height: "auto", // adjust as needed
                  //   width: 40,
                  // }}
                />
                {/* <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: "700",
                    color: "rgba(0, 0, 0, 0.85)",
                  }}
                >
                  KGH
                </p> */}
                {/* <img
                  src={
                    !darkMode
                      ? require(`../static/img/Logo_Dark.svg`).default
                      : require(`../static/img/Logo_white.png`).default
                  }
                  alt=""
                /> */}
              </Link>
            </Col>

            <Col lg={!topMenu ? 14 : 15} md={8} sm={0} xs={0}>
              {topMenu && window.innerWidth > 991 ? <TopMenu /> : <></>}
            </Col>

            <Col lg={6} md={10} sm={0} xs={0}>
              <AuthInfo />
            </Col>
            {/* <Col md={0} sm={18} xs={12}>
              <div className="mobile-action">
                <Link className="btn-search" onClick={handleSearchHide} to="#">
                  {searchHide ? (
                    <FeatherIcon icon="search" />
                  ) : (
                    <FeatherIcon icon="x" />
                  )}
                </Link>
                <Link className="btn-auth" onClick={onShowHide} to="#">
                  <FeatherIcon icon="more-vertical" />
                </Link>
              </div>
            </Col> */}
          </Row>
        </Header>
        {/* <Header
          style={{
            position: "fixed",
            width: "100%",
            top: 0,
            left: 0,
          }}
        >
          <Row>
            <Col lg={3} sm={6} xs={12} className="align-center-v navbar-brand">
              {window.innerWidth <= 991 ? (
                <Button type="link" onClick={toggleCollapsed}>
                  <img
                    src={require(`../static/img/icon/${
                      collapsed ? "right.svg" : "left.svg"
                    }`)}
                    alt="menu"
                  />
                </Button>
              ) : null}
              <Link
                className={
                  window.innerWidth > 991
                    ? "striking-logo top-menu"
                    : "striking-logo"
                }
                to="/admin"
              >
                <img
                  src={require(`../static/img/Logo_Dark.svg`).default}
                  alt=""
                />
              </Link>
            </Col>
            <Col lg={6} md={10} sm={0} xs={0}></Col>
          </Row>
        </Header> */}
        <Layout style={{ borderWidth: 1 }}>
          <Sider
            width={280}
            style={SideBarStyle}
            collapsed={collapsed}
            theme={"light"}
          >
             <Scrollbars
                      className="custom-scrollbar"
                      autoHide
                      autoHideTimeout={500}
                      autoHideDuration={200}
                      // renderThumbHorizontal={renderThumbHorizontal}
                      // renderThumbVertical={renderThumbVertical}
                      // renderView={renderView}
                      // renderTrackVertical={renderTrackVertical}
                    >
             <p className="sidebar-nav-title">MAIN MENU</p>
            <MenuItems
              topMenu={topMenu}
              toggleCollapsed={toggleCollapsed}
              darkMode={darkMode}
            />
            </Scrollbars>
          </Sider>
          <Layout className="atbd-main-layout" style={{ minHeight: "90vh" }}>
            <Content>
              {isSuperAdministrator && (
                <Alert
                  showIcon
                  message={
                    <span style={{ color: "red" }}>
                      {" "}
                      <strong>
                        {t(
                          "signIn.Please_do_not_use_this_account_for_anything_related_to_business_logic",
                          {
                            defaultValue:
                              "Please do not use this account for anything related to business logic!",
                          }
                        )}
                      </strong>
                    </span>
                  }
                  description={t(
                    "signIn.SUPER_ADMINISTRATOR_is_strictly_reserved_for_internal_purposes_only.",
                    {
                      defaultValue:
                        "SUPER ADMINISTRATOR is strictly reserved for internal purposes only.",
                    }
                  )}
                  type={"error"}
                />
              )}
              <Outlet />
              <Footer className="admin-footer" style={footerStyle}>
                <Row>
                  <Col >
                    <span className="admin-footer__copyright">Copyright @ 2025 All rights reserved by iVote</span>
                  </Col>
                </Row>
              </Footer>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Div>
  );
};
