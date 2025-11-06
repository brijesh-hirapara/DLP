import { Button, Checkbox, Dropdown, Form, Input, Modal, Collapse } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthWrapper, LanguageWrapper } from "./style";
import { AuthApi, LanguagesApi } from "api";
import guideLineData from "./guideline.json";


//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { decodeJWT } from "utility/decode-jwt";
import { NavAuth } from "components/utilities/auth-info/auth-info-style";
import { theme } from "config/theme/themeVariables";
import PrivacyPolicy from "./PrivacyPolicy";
import Faq from "./Faq";
import LegislationModal from "./Legislation";
import { getLogoImage } from "api/common";

import styled from "styled-components";

const authApi = new AuthApi();
const { Panel } = Collapse;
const localURL = process.env.REACT_APP_API_URL as string;
const basePath = window.location.hostname === 'localhost' ? localURL : "/";
const customPanelStyle = {
  background: " #F8F9FB",
  borderRadius: 3,
  marginBottom: 20,
  border: 0,
  overflow: "hidden",
};

// Add button styles for menu toggle
const ButtonWrapper = styled.div`
  .menu-toggle-btn {
    background:rgb(255, 255, 255) !important;
    color: #fff !important;
    border: none !important;
    box-shadow: none !important;
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 22px;
    transition: background 0.15s;
  }

  .menu-toggle-btn:hover,
  .menu-toggle-btn:focus {
    background:rgb(255, 255, 255) !important;
    color: #fff !important;
  }

  .menu-toggle-btn svg {
    color: #fff !important;
    stroke: #fff !important;
  }
`;

function SignIn() {
  const { t, i18n } = useTranslation();

  // Your original states and logic
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [faqModal, setfaqModal] = useState(false);
  const [lesgnationModal, setLesgnationModal] = useState(false);
  const [languages, setLanguages] = useState<{ i18nCode: { code: string; name: string }, isDefault: boolean }[]>([]);
  const [instanceName, setInstanceName] = useState("MVTEO");
  const [logoSrc, setLogoSrc] = useState("");

  const languagesApi = new LanguagesApi();
  // NEW: Local state for menu toggle button collapsed state
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  useEffect(() => {
    const logo = getLogoImage();
    setLogoSrc(logo);
  }, []);

  useEffect(() => {
    localStorage.removeItem("user");
    const instance = localStorage.getItem("Instance") || "MVTEO";
    setInstanceName(instance);
    getLanguages();
  }, []);

  useEffect(() => {
    const isLoggedIn: any = localStorage.getItem("user");
    if (isLoggedIn && !(JSON.parse(isLoggedIn)?.shouldShowOnboarding)) {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const getLanguages = async () => {
    const { data }: any = await languagesApi.apiLanguagesGet();
    const lng = localStorage.getItem("i18nextLng");
    setLanguages(data);

    if (lng === "en-US") {
      // eslint-disable-next-line array-callback-return
      data?.map((res: any) => {
        if (res.isDefault) {
          i18n.changeLanguage(res.i18nCode.code);
        }
      });
    }
  };

  const menuItems = languages.map((language: any) => {
    const isDefaultLanguage = language?.i18nCode?.code === i18n?.language;
    return {
      key: language?.i18nCode?.code,
      label: (
        <Link
          onClick={() => onFlagChangeHandle(language?.i18nCode?.code)}
          to="#"
          style={{
            backgroundColor: isDefaultLanguage ? theme["linkActive"] : "",
          }}
        >
          <span className={isDefaultLanguage ? "ant-menu-item-selected" : ""}>
            {language?.i18nCode?.name}
          </span>
        </Link>
      ),
    };
  });

  const country = { items: menuItems };

  const onFlagChangeHandle = (value: any) => {
    try {
      i18n.changeLanguage(value);
      const languageObj =
        languages.find((x) => x?.i18nCode?.code === value) || null;


      if (!languageObj) return;


    } catch (err) { }
  };


  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = form.getFieldsValue();
      const { data } = await authApi.apiAuthLoginPost({
        loginCommand: { ...payload, rememberMe },
      });

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("profileImage", data?.profileImage ?? "");
      const token: any = decodeJWT();
      if (token) {
        const languagecode = token?.language;
        i18n.changeLanguage(languagecode);
      }

      let navigateTo = "/";
      if (data.shouldShowOnboarding) navigateTo = "/set-new-password";
      navigate(navigateTo, { replace: true });
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthWrapper>
      <LanguageWrapper>
        <div className="nav-author"
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            flexDirection: "row",
          }}>
          <Dropdown placement="bottomCenter" menu={country}>
            <Link
              to="#"
              className="head-example"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <FeatherIcon icon="globe" />
              <p style={{ fontWeight: 500, margin: 0, paddingLeft: 5 }}>
                {localStorage.getItem("i18nextLng")?.toUpperCase() || ''}
              </p>
            </Link>
          </Dropdown>
        </div>
      </LanguageWrapper>
      {/* Original heading block */}
      <div className="heading-block">
        <div className="mvp-heading">MVP</div>
        <div className="mvp-sub">Digital Logistics Platform</div>
      </div>

      <div className="auth-center">
        <div className="truck-icon-bg">
          {/* <FeatherIcon icon="truck" color="#fff" size={28} /> */}
          <i className="fa-solid fa-truck-fast" style={{ color: 'white', fontSize: '26px' }}></i>

        </div>
        <div className="login-card">
          <Form
            name="signIn"
            form={form}
            className="login-form"
            style={{ paddingTop: 0 }}
            onFinish={handleFormSubmit}
            layout="vertical"
          >
            {/* <div style={{ fontWeight: "bold", fontSize: 40 }}>{t("signIn.companyName", { defaultValue: "KGH" })}</div>
          <div style={{textAlign:"center"}}>
            <img
              src={logoSrc}
              alt="Company Logo"
              style={{ height: "auto", width: "80px" }}
            />
          </div>
          <div
            style={{ fontWeight: "bold", fontSize: 30, paddingBottom: 10 }}
            className="color-secondary text-center"
          >
            {t("signIn.WebPlatform", { defaultValue: "Web Platform" })}
          </div> */}
            <Form.Item
              name="email"
              rules={[
                {
                  message: t("signIn.emailRequired", {
                    defaultValue: "Please input your Email!",
                  }),
                  required: true,
                },
              ]}
            >
              <Input
                placeholder={t("signIn.emailPlaceholder", {
                  defaultValue: "Email",
                })}
                prefix={<FeatherIcon icon="user" color="#101010" size={14} />}
              />
            </Form.Item>
            <Form.Item name="password"
              rules={[
                {
                  message: t("signIn.passwordRequired", {
                    defaultValue: "Please input your Password!",
                  }),
                  required: true,
                },
              ]}>
              <Input.Password
                placeholder={t("signIn.passwordPlaceholder", {
                  defaultValue: "Password",
                })}
                prefix={<FeatherIcon icon="lock" color="#101010" size={14} />}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                className="custom-btn"
                htmlType="submit"
                type="primary"
                size="large"
                disabled={isLoading}
                loading={isLoading}
                style={{ backgroundColor: "#27b2ea", width: "100%" }}
              >
                {isLoading
                  ? t("signIn.loading", { defaultValue: "Loading..." })
                  : t("signIn.signIn", { defaultValue: "Log In" })}
              </Button>
            </Form.Item>
            <div className="auth-form-action">
              <Checkbox
                className="remember"
                onChange={() => setRememberMe(!rememberMe)}
                checked={rememberMe}
              >
                {t("signIn.remember-me", {
                  defaultValue: "Remember me",
                })}
              </Checkbox>

              <NavLink className="forgot-pass-link" to="/forgot-password">
                {t("signIn.forgotPassword", { defaultValue: "Forgot password?" })}
              </NavLink>
            </div>
          </Form>
        </div>
        <p className="or-divider" >
          <span>{t("signIn.or-read", { defaultValue: "or read" })}</span>
        </p>
        <ul className="green-bottom-bar">
          <li>
            <Link className="green-link" to="#" onClick={() => setfaqModal(true)}>
              <span>{t("signIn.FAQ", { defaultValue: "FAQ" })}</span>
            </Link>
          </li>
          <li>
            <Link className="green-link" to="#" onClick={() => setShowModal(true)}>
              <span>{t("signIn.Guidelines", { defaultValue: "Guidelines" })}</span>
            </Link>
          </li>
          <li>
            <Link className="green-link" to="#" onClick={() => setLesgnationModal(true)}>
              <span>{t("signIn.Lesgnation", { defaultValue: "Lesgnation" })}</span>
            </Link>
          </li>
          <li>
            <Link className="green-link" to="#" onClick={() => setPrivacyModal(true)}>
              <span>{t("signIn.Privacy Policy", { defaultValue: "Privacy Policy" })}</span>
            </Link>
          </li>
        </ul>
      </div>
      {/* Modals */}
      <Modal
        title={t("signIn.Guidelines", { defaultValue: "Guidelines" })}
        visible={showModal}
        width={1000}
        className="guildlines-modal"
        footer={false}
        onCancel={() => setShowModal(!showModal)}
      >
        <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>

        </div>
      </Modal>
      <PrivacyPolicy showModal={privacyModal} setShowModal={setPrivacyModal} />
      <Faq faqModal={faqModal} setfaqModal={setfaqModal} />
      <LegislationModal
        showModal={lesgnationModal}
        setShowModal={setLesgnationModal}
        instance={instanceName}
      />
    </AuthWrapper>
  );
}

export default SignIn;
