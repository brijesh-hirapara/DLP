import { useContext, useEffect, useState } from "react";
import { Form, Input, Spin, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { Button } from "components/buttons/buttons";
import FeatherIcon from "feather-icons-react";
import { BasicFormWrapper } from "container/styled";
import { useTranslation } from "react-i18next";
import { showServerErrors } from "utility/utility";
import openNotificationWithIcon from "utility/notification";
import { UsersApi } from "api";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { hasPermission } from "utility/accessibility/hasPermission";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const { Option } = Select;

const usersApi = new UsersApi();

const EditProfile = ({ render, profileImage, bannerImage }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userMe, setUserMe] = useState();
  const [_municipalityId, setMunicipalityId] = useState(0);
  const [_entityId, setEntityId] = useState(0);
  const [municipalityList, setMunicipalityList] = useState([]);
  const commonData = useContext(CommonDataContext);
  const {
    municipalities,
    cantons,
    stateEntities,
    isLoading: loadingCommonData,
    languages,
  } = commonData;
  const [userAlreadyExists, setUserAlreadyExists] = useState();

  useEffect(() => {
    render && getMe();
  }, [render]);

  useEffect(() => {
    setMunicipalityList(
      municipalities.filter((item) => item.stateEntityId === _entityId)
    );
    onMunicipalityChange(_municipalityId, _entityId);
  }, [municipalities, _entityId]);

  const getMe = async () => {
    const { data } = await usersApi.usersMeGet();
    form.setFieldsValue(data);

    const {
      institutionId,
      municipalityId,
      cantonId,
      stateEntityId,
      profileImage,
    } = data;
    form.setFieldValue("institutionId", institutionId?.toString());
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
    setMunicipalityId(municipalityId);
    setEntityId(stateEntityId);

    setUserMe(data);
  };

  const handleSubmit = async ({
    firstName,
    lastName,
    id,
    institutionId,
    municipalityId,
    phoneNumber,
    languageId,
  }) => {
    try {
      const payload = {
        firstName,
        lastName,
        id,
        email: userMe.email,
        institutionId,
        municipalityId,
        phoneNumber,
        languageId,
        profileImage,
        bannerImage,
      };
      await usersApi.usersMePut({ updateProfileCommand: payload });
      openNotificationWithIcon(
        "success",
        t(
          "profile.success.update",
          " You have successfully edited your profile information"
        )
      );
      getMe();
    } catch (err) {
      showServerErrors(err);
    }
  };
  

  const onMunicipalityChange = (value) => {
    const municipality = municipalities.find((item) => item.id === value);
    if (municipality) {
      form.setFieldsValue({
        cantonId: municipality.cantonId,
        stateEntityId: municipality.stateEntityId,
      });
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    // form.resetFields();
    navigate(-1);
  };

  return (
    <>
      {loadingCommonData ? (
        <div
          style={{
            display: "flex",
            height: 400,
            width: "100%",
            justifyContent: "center",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <BasicFormWrapper
          style={{ width: "50%", maxWidth: 1200, marginTop: -30 }}
        >
          <Form form={form} name="editProfile" onFinish={handleSubmit}
             validateTrigger={["onChange", "onBlur", "onSubmit"]}
            onFinishFailed={({ errorFields }) => {
              form.scrollToField(errorFields[0].name);
            }}
            >
            <Form.Item name="id" style={{ height: 0 }}>
              <Input required style={{ display: "none", height: 0 }} />
            </Form.Item>
            <Form.Item
              required
              name="firstName"
              rules={[
                {
                  required: true,
                  message: t("validations.required-field", {
                    field: t("global:first.name", "First Name"),
                    defaultValue: "{{field}} is required!",
                  }),
                },
                {
                  pattern: /^(?!\s)(?!.*\s$).+/,
                  message: t("validations.no-whitespace", {
                    field: t("global:first.name", "First Name"),
                    defaultValue: "{{field}} cannot be empty or whitespace only."
                  }),
                },
              ]}
              label={t("profile.edit:input.first-name", "First Name")}
            >
              <Input required prefix={<FeatherIcon icon="user" size={14} />} />
            </Form.Item>
            <Form.Item
              required
              name="lastName"
              rules={[
                {
                  required: true,
                  message: t("validations.required-field", {
                    field: t("global:last.name", "Last Name"),
                    defaultValue: "{{field}} is required!",
                  }),
                },
                {
                  pattern: /^(?!\s)(?!.*\s$).+/,
                  message: t("validations.no-whitespace", {
                    field: t("global:last.name", "Last Name"),
                    defaultValue: "{{field}} cannot be empty or whitespace only."
                  }),
                },
              ]}
              label={t("profile.edit:input.last-name", "Last Name")}
            >
              <Input required prefix={<FeatherIcon icon="users" size={14} />} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label={t("global.phone-number", "Phone Number")}
              rules={[
                {
                  required: true,
                  message: t("validations.required-field", {
                    field: t("global:phone-number", "Phone number"),
                    defaultValue: "{{field}} is required!",
                  }),
                },
              ]}
            >
              <PhoneInput
                country="us"
                inputProps={{
                  name: "phone",
                  placeholder: t("global.phone-number", "Phone Number"),
                }}
                onChange={(value) =>
                  form.setFieldsValue({ phoneNumber: value })
                }
                value={form.getFieldValue("phoneNumber")}
                containerStyle={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              required
              name="email"
              label={t("profile.edit:input.email", "Email")}
              rules={[
                {
                  required: true,
                  message: t("validations.required-field", {
                    field: t("global:email", "Email"),
                    defaultValue: "{{field}} is required!",
                  }),
                },
              ]}
            >
              <Input
                required
                disabled
                prefix={<FeatherIcon icon="mail" size={14} />}
              />
            </Form.Item>

            <Form.Item
              required
              name="organizationName"
              label={t("profile:company", "Company")}
              rules={[
                {
                  required: true,
                  message: t("validations.required-field", {
                    field: t("global:company", "Company"),
                    defaultValue: "{{field}} is required!",
                  }),
                },
                {
                  pattern: /^(?!\s)(?!.*\s$).+/,
                  message: t("validations.no-whitespace", {
                    field: t("global:company", "Company"),
                    defaultValue: "{{field}} cannot be empty or whitespace only."
                  }),
                },
              ]}
            >
              <Input prefix={<FeatherIcon icon="server" size={14} />} />
            </Form.Item>

            <Form.Item
              name="languageId"
              required
              label={t("system-languages.default-language", "Default Language")}
              requiredMark
              rules={[
                {
                  required: true,
                  message: t(
                    "validations:language.required",
                    "Please select language"
                  ),
                },
              ]}
            >
              <Select
                className="sDash_fullwidth-select"
                aria-required
                style={{ color: "rgb(90, 95, 125)" }}
              >
                {languages &&
                  languages.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            {hasPermission("profile:edit") && (
              <Form.Item>
                <span style={{ marginRight: "20px" }}>
                  <Button
                    size="default"
                    htmlType="submit"
                    type="primary"
                    key="submit"
                  >
                    {t("profile.form.button", "Update Profile")}
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
            )}
          </Form>
        </BasicFormWrapper>
      )}
    </>
  );
};

export default EditProfile;
