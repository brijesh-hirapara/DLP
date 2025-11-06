import Styled from "styled-components";
import { Button, Form, Input, notification } from "antd";
import { AuthApi } from "api/api";
import Heading from "components/heading/heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import { ForgotWrapper } from "./style";

const authApi = new AuthApi();

function ForgotPassword() {
  /**
   * Forms
   */
  const [form] = Form.useForm();

  /**
   * Translation
   */
  const { t } = useTranslation();

  /**
   * React router dom
   */
  const navigate = useNavigate();
  const [state, setState] = useState({ values: null });
  const [loading, setLoading] = useState(false);

  /**
   *
   * @param values any
   */
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await authApi.apiAuthForgotPasswordPost({
        forgotPasswordCommand: form.getFieldsValue(),
      });
      setState({ ...state, values });
      openNotificationWithIcon(
        "success",
        t("forgot-password:notification.success.title", "Instructions sent to your email"),
        t("forgot-password:notification.success.description", "If you don't receive the email within a few minutes, please check your spam folder!")
      );
      navigate("/login");
    } catch (error) {
      notification.destroy();
      openNotificationWithIcon(
        "success",
        t("forgot-password:email.not.found.error", "If the email address provided is correct, you will receive a message in your inbox")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotWrapper>
      <div className="forgot-left" />
      <div className="forgot-right">
        <div className="forgot-card">
          <Form
            name="forgotPass"
            onFinish={handleSubmit}
            layout="vertical"
            form={form}
          >
          <Heading as="h3">
            {t("forgotPassword.title", "Forgot Password?")}
          </Heading>
            {/* <h3>{t("forgotPassword.title", "Forgot Password?")}</h3> */}
            <p className="forgot-text">
              {t(
                "forgotPassword.description",
                "Enter the email address you used when you joined and we’ll send you instructions to reset your password."
              )}
            </p>
            <Form.Item
              label={t("forgotPassword.input.email", "Email Address")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("forgotPassword.error.email", "Please input your email!"),
                  type: "email",
                },
              ]}
            >
              <Input
                placeholder={t("forgotPassword.placeholder.email", "name@example.com")}
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="btn-reset"
                htmlType="submit"
                loading={loading}
                type="primary"
                size="large"
              >
                {t("forgotPassword.button.send", "Send Reset Instructions")}
              </Button>
            </Form.Item>
            <p className="return-text">
              {t("global:return.to", "Return to")}{" "}
              <NavLink to="/signIn">{t("signIn.signIn", "Sign In")}</NavLink>
            </p>
          </Form>
        </div>
      </div>
    </ForgotWrapper>
  );
}

export default ForgotPassword;
