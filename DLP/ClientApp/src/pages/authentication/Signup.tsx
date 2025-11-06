import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FacebookOutlined, TwitterOutlined } from "@ant-design/icons";
import { Form, Input, Button } from "antd";
import { AuthWrapper } from "./style";
import { Checkbox } from "components/checkbox/checkbox";
import Heading from "components/heading/heading";
import { useTranslation } from "react-i18next";

function SignUp() {
  const { t } = useTranslation();

  const [state, setState] = useState({
    values: null,
    checked: null,
  });

  const handleFormSubmit = (values: any) => {
    setState({ ...state, values });
  };

  const handleCheckboxChange = (checked: any) => {
    setState({ ...state, checked });
  };

  return (
    <AuthWrapper>
      <p className="auth-notice">
        {t("signUp.alreadyHaveAccount", "Already have an account?")}{" "}
        <NavLink to="/">{t("signUp.signIn", "Sign In")}</NavLink>
      </p>
      <div className="auth-contents">
        <Form name="register" onFinish={handleFormSubmit} layout="vertical">
          <Heading as="h3">
            {t("signUp.title", "Sign Up to")}{" "}
            <span className="color-secondary">Admin</span>
          </Heading>
          <Form.Item
            label={t("signUp.nameLabel", "Name")}
            name="name"
            rules={[
              { required: true, message: t("signUp.nameRequired", "Please input your Full name!") },
            ]}
          >
            <Input placeholder={t("signUp.namePlaceholder", "Full name")} />
          </Form.Item>
          <Form.Item
            name="username"
            label={t("signUp.usernameLabel", "Username")}
            rules={[{ required: true, message: t("signUp.usernameRequired", "Please input your username!") }]}
          >
            <Input placeholder={t("signUp.usernamePlaceholder", "Username")} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("signUp.emailLabel", "Email Address")}
            rules={[
              {
                required: true,
                message: t("signUp.emailRequired", "Please input your email!"),
                type: "email",
              },
            ]}
          >
            <Input placeholder={t("signUp.emailPlaceholder", "name@example.com")} />
          </Form.Item>
          <Form.Item
            label={t("signUp.passwordLabel", "Password")}
            name="password"
            rules={[{ required: true, message: t("signUp.passwordRequired", "Please input your password!") }]}
          >
            <Input.Password placeholder={t("signUp.passwordPlaceholder", "Password")} />
          </Form.Item>
          <div className="auth-form-action">
            <Checkbox onChange={handleCheckboxChange} checked={state.checked}>
              {t("signUp.termsAndPrivacy", "Creating an account means you’re okay with our Terms of Service and Privacy Policy")}
            </Checkbox>
          </div>
          <Form.Item>
            <Button
              className="btn-create"
              htmlType="submit"
              type="primary"
              size="large"
            >
              {t("signUp.createAccount", "Create Account")}
            </Button>
          </Form.Item>
          <p className="form-divider">
            <span>{t("signUp.or", "Or")}</span>
          </p>
          <ul className="social-login signin-social">
            <li>
              <a className="google-signup" href="/">
                <img
                  src={require("static/img/google.png")}
                  alt=""
                />
                <span>{t("signUp.signUpWithGoogle", "Sign up with Google")}</span>
              </a>
            </li>
            <li>
              <a className="facebook-sign" href="/">
                <FacebookOutlined />
              </a>
            </li>
            <li>
              <a className="twitter-sign" href="/">
                <TwitterOutlined />
              </a>
            </li>
          </ul>
        </Form>
      </div>
    </AuthWrapper>
  );
}

export default SignUp;
