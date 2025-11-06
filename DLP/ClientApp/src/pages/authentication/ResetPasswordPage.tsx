import { Form, Input, Button } from "antd";
import Heading from "components/heading/heading";
import { AuthWrapper } from "pages/authentication/style";
import { AuthApi } from "api/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import { useEffect, useState } from "react";

const ResetPasswordPage = () => {
  /**
   * Translation
   */
  const { t } = useTranslation();

  /**
   * Forms
   */
  const [form] = Form.useForm();
  const authApi = new AuthApi();

  /**
   * React router dom
   */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      email:searchParams.get("email")
    }) 
  }, []);

  /**
   * Handle
   */
  const handleSubmit = async () => {
    setLoading(true);
    const payload = form.getFieldsValue();
    payload.code = searchParams.get("code");

    try {
      const res: any = await authApi.apiAuthResetPasswordPost({ resetPasswordCommand: payload });
      if (res?.data?.value == "Email address does not exist in the system." || res?.data?.value == "Something went wrong while reseting your password") {
       
        openNotificationWithIcon(
          "error",
          // t("reset-password:notification.error.title", "Error"),
          res?.data?.value
        );
      }
      else {
        openNotificationWithIcon(
          "success",
          t("reset-password:notification.success.title", "Success"),
          t("reset-password:notification.success.description", "Reset password updated successfully")
        );
        navigate("/");
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    // <AuthWrapper>
    //   <div className="auth-contents">
    //     <Form
    //       name="resetPassword"
    //       form={form}
    //       onFinish={handleSubmit}
    //       layout="vertical"
    //     >
    //       <Heading as="h3">
    //         {t("reset-password.title", "Reset password")}
    //       </Heading>
    //       <p style={{ marginBottom: 50 }}>
    //         {t(
    //           "reset-passsword.description",
    //           "You have requested to reset your password."
    //         )}
    //       </p>
    //       <Form.Item
    //         name="email"
    //         rules={[
    //           {
    //             required: true,
    //             message: t(
    //               "reset-password.email-required",
    //               "Email is required"
    //             ),
    //           },
    //         ]}
    //         label={t("reset-password.email-label", "Email")}
    //         style={{ marginBottom: 50 }}
    //       >
    //         <Input
    //           placeholder={t(
    //             "reset-password.email-placeholder",
    //             "example@email.com"
    //           )}
    //         />
    //       </Form.Item>
    //       <Form.Item
    //         name="password"
    //         rules={[
    //           {
    //             required: true,
    //             message: t(
    //               "reset-password.password-required",
    //               "The password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a digit, and a special character."
    //             ),
    //             min: 8,
    //             pattern:
    //               /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    //           },
    //         ]}
    //         label={t("reset-password.new-password-label", "New password")}
    //       >
    //         <Input.Password
    //           placeholder={t(
    //             "reset-password.new-password-placeholder",
    //             "New password"
    //           )}
    //         />
    //       </Form.Item>
    //       <Form.Item
    //         name="confirmPassword"
    //         label={t(
    //           "reset-password.confirm-password-label",
    //           "Confirm password"
    //         )}
    //         rules={[
    //           {
    //             required: true,
    //             message: t(
    //               "reset-password.confirm-password-required",
    //               "Confirm password is required"
    //             ),
    //           },
    //           ({ getFieldValue }) => ({
    //             validator(_, value) {
    //               if (!value || getFieldValue("password") === value) {
    //                 return Promise.resolve();
    //               }
    //               return Promise.reject(
    //                 new Error(
    //                   t(
    //                     "reset-password.confirm-password-mismatch",
    //                     "The new password that you entered do not match!"
    //                   )
    //                 )
    //               );
    //             },
    //           }),
    //         ]}
    //       >
    //         <Input.Password
    //           placeholder={t(
    //             "reset-password.confirm-password-placeholder",
    //             "Confirm password"
    //           )}
    //         />
    //       </Form.Item>
    //       <Form.Item style={{ marginTop: 50 }}>
    //         <Button
    //           className="btn-signin"
    //           htmlType="submit"
    //           type="primary"
    //           loading={loading}
    //           size="large"
    //         >
    //           {t("global.save", "Save")}
    //         </Button>
    //       </Form.Item>
    //     </Form>
    //   </div>
    // </AuthWrapper>
    <AuthWrapper>
      <div className="auth-center">
        <div className="truck-icon-bg">
          <i
            className="fa-solid fa-truck-fast"
            style={{ color: "white", fontSize: "26px" }}
          ></i>
        </div>
        <div className="login-card">
          {/* Only use one form below for both cases */}
          <Form
            form={form}
            name="resetPassword"
            layout="vertical"
            onFinish={handleSubmit}
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
                {t("reset-password.title", "Reset password")}
              </Heading>
              <p >
                {t(
                  "reset-passsword.description",
                  "You have requested to reset your password."
                )}
              </p>
            </div>

            <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: t(
                  "reset-password.email-required",
                  "Email is required"
                ),
              },
            ]}
            // label={t("reset-password.email-label", "Email")}
            // label={<span style={{ color: 'white' }}>{t("reset-password.email-label", "Email")}</span>}
          >
            <Input
              placeholder={t(
                "reset-password.email-placeholder",
                "example@email.com"
              )}
            />
          </Form.Item>
            <Form.Item
              name="password"
              // label={t("setNewPassword.newPasswordLabel", "New password")}
              // label={<span style={{ color: 'white' }}>{t("setNewPassword.newPasswordLabel", "New password")}</span>}
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
              //  label={<span style={{ color: 'white' }}>{t("setNewPassword.confirmPasswordLabel","Confirm password")}</span>}
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
  );
};

export default ResetPasswordPage;
