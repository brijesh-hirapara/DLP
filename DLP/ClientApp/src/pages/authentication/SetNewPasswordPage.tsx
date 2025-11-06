import { Form, Input, Row, Col } from "antd";
import { Button } from "components/buttons/buttons";
import Heading from "components/heading/heading";
import { AuthWrapper } from "pages/authentication/style";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import { useState } from "react";
import { UsersApi } from "api/api";
import { BasicFormWrapper } from "container/styled";
import { ChangePasswordWrapper } from "pages/settings/overview/style";

const SetNewPasswordPage = (props: any) => {
  const { t } = useTranslation();
  const { isOnBoardingMode = true } = props;
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const usersApi = new UsersApi();

  const handleFormSubmit = async () => {
    setLoading(true);
    const payload = form.getFieldsValue();
    try {
      await usersApi.usersSetNewPasswordPost({
        setNewPasswordRequest: payload,
      });
      openNotificationWithIcon(
        "success",
        t("set-new-password:notification.success.title", "Success"),
        t(
          "set-new-password:notification.success-desc.description",
          "Password has been updated successfully!"
        )
      );
      const loginUser: any = localStorage.getItem("user");
      const updatedUser = JSON.stringify({
        ...JSON.parse(loginUser),
        shouldShowOnboarding: false,
      });
      localStorage.setItem("user", updatedUser);
      navigate("/");
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

    const handleCancel = (e:any) => {
        e.preventDefault();
        // form.resetFields();
        navigate(-1)
      };
  return isOnBoardingMode ? (
    <AuthWrapper>
      <div className="heading-block">
        <div className="mvp-heading">MVP</div>
        <div className="mvp-sub">Digital Logistics Platform</div>
      </div>
      <div className="auth-center">
        <div className="truck-icon-bg">
          {/* <FeatherIcon icon="truck" color="#fff" size={28} /> */}
          <i
            className="fa-solid fa-truck-fast"
            style={{ color: "white", fontSize: "26px" }}
          ></i>
        </div>
        <div className="login-card">
          {/* Only use one form below for both cases */}
          <Form
            form={form}
            name="setNewPassword"
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            {/* Heading for onboarding */}
            <div
              style={{
                fontWeight: "600",
                fontSize: 18,
                textAlign: "center",
                marginBottom: 6,
                color: "white",
              }}
            >
              <Heading as="h3" className="white-text">
                {t("setNewPassword.newPasswordLabel", "New password")}
              </Heading>
            </div>

            <Form.Item
              name="currentPassword"
              // label={t(
              //   "setNewPassword.currentPasswordLabel",
              //   "Current password"
              // )}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.currentPasswordRequired",
                    "Current Password is required"
                  ),
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.currentPasswordPlaceholder",
                  "Current password"
                )}
              />
            </Form.Item>
            {/* Always show these two fields */}
            <Form.Item
              name="password"
              // label={t("setNewPassword.newPasswordLabel", "New password")}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.newPasswordRequired",
                    "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a digit, and a special character."
                  ),
                  min: 8,
                  pattern:
                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.newPasswordPlaceholder",
                  "New password"
                )}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              // label={t(
              //   "setNewPassword.confirmPasswordLabel",
              //   "Confirm password"
              // )}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.confirmPasswordRequired",
                    "Confirm password is required"
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        t(
                          "setNewPassword.confirmPasswordMismatch",
                          "The new password that you entered does not match!"
                        )
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.confirmPasswordPlaceholder",
                  "Confirm password"
                )}
              />
            </Form.Item>
            <Form.Item>
           
              <Button
                // className="custom-btn"
                htmlType="submit"
                type="primary"
                size="large"
                loading={loading}
              >
                {t("setNewPassword.saveButton", "Save")}
              </Button>
            
            </Form.Item>
          </Form>
        </div>
      </div>
    </AuthWrapper>
  ) : (
    <BasicFormWrapper style={{ width: "50%", maxWidth: 1200 }}>
      <div className="profile-settings-container">
        <div className="profile-main w-100">
          {/* <Heading as="h3">
          {t("setNewPassword.changePassword", "Change Password")}
        </Heading> */}
          <Form
            form={form}
            name="setNewPassword"
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Form.Item
              name="currentPassword"
              label={t(
                "setNewPassword.currentPasswordLabel",
                "Current password"
              )}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.currentPasswordRequired",
                    "Current Password is required"
                  ),
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.currentPasswordPlaceholder",
                  "Current password"
                )}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("setNewPassword.newPasswordLabel", "New password")}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.newPasswordRequired",
                    "Must be at least 8 chars, contain uppercase, lowercase, digit, special char."
                  ),
                  min: 8,
                  pattern:
                    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                },
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.newPasswordPlaceholder",
                  "New password"
                )}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={t(
                "setNewPassword.confirmPasswordLabel",
                "Confirm password"
              )}
              rules={[
                {
                  required: true,
                  message: t(
                    "setNewPassword.confirmPasswordRequired",
                    "Confirm password is required"
                  ),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        t(
                          "setNewPassword.confirmPasswordMismatch",
                          "The passwords do not match!"
                        )
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={t(
                  "setNewPassword.confirmPasswordPlaceholder",
                  "Confirm password"
                )}
              />
            </Form.Item>
            <Row style={{gap: "20px"}}>
            <Form.Item>
              <span style={{marginRight: "20px"}}>
              <Button
                // className="set-password-btn"
                htmlType="submit"
                type="primary"
                size="large"
                loading={loading}
                key="submit"
              >
                {t("setNewPassword.changePassword", "Change Password")}
              </Button>
              </span>
              
              <Button
                size="default"
                onClick={handleCancel}
                type="light"
                outlined
              >
                Cancel
              </Button>
              
            </Form.Item>
            </Row>
          </Form>
        </div>
      </div>
    </BasicFormWrapper>
  );
};
export default SetNewPasswordPage;


