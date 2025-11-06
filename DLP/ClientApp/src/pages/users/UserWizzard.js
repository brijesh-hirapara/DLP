import { Button, Card, Col, Form, Input, Row, Select, Upload } from "antd";
import { Link } from 'react-router-dom';
import TextArea from "antd/lib/input/TextArea";
import { OrganizationsApi, UsersApi } from "api/api";
import { AccessLevelType } from "api/models";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import FeatherIcon from "feather-icons-react";
import { useAccessLevel } from "hooks/useAccessLevel";
import { useDebouncedValue } from "hooks/useDebouncedValue";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import Heading from "../../components/heading/heading";
import { Steps } from "../../components/steps/steps";
import { BasicFormWrapper } from "../../container/styled";
import { WizardFour, WizardWrapper } from "../style";
import { PredefinedRoles } from "constants/constants";
import loggedAsCompanyUser from "utility/loggedAsCompanyUser";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import isSuperAdmin from "utility/isSuperAdmin";
import PhoneInput from 'react-phone-input-2';
import { Cards } from "components/cards/frame/cards-frame";
import AuthorBox, { BoxTypes } from "pages/settings/overview/ProfileAuthorBox";
import { Tabs } from "antd";
import { NavLink } from "react-router-dom";
import { Tooltip } from 'antd';


const { TabPane } = Tabs;


const { Option } = Select;

const usersApi = new UsersApi();
const organizationsApi = new OrganizationsApi();

function UserWizzard({ user }) {
  const commonData = useContext(CommonDataContext);
  const { userGroups, languages, municipalities, cantons, stateEntities } =
    commonData;
  const onEditMode = user !== null;

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const accessLevel = useAccessLevel();
  const [institutions, setInstitutions] = useState([]);
  const [_municipalityId, setMunicipalityId] = useState(0);
  const [_entityId, setEntityId] = useState(0);
  const [request, setRequest] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAlreadyExists, setUserAlreadyExists] = useState();
  const token = useDecodeJWT();
  const superAdmin = isSuperAdmin()
  const stateEntityID = token?.stateEntityId;
  const emailDebouncedValue = useDebouncedValue({
    delay: 300,
    value: Form.useWatch("email", form),
  });
  const currentUserIsCompany = loggedAsCompanyUser();
  const [municipalityList, setMunicipalityList] = useState();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState();
  const [profileImage, setProfileImage] = useState("");

  // useEffect(() => {
  //   if (token) {
  //     form.setFieldsValue({ organizationId: token.organizationId });
  //   }
  // }, [token]);

  useEffect(() => {
    // if (onEditMode) {
    //   setMunicipalityList(
    //     municipalities.filter((item) => item.stateEntityId === _entityId)
    //   );
    // } else {
    //   setMunicipalityList(
    //    !superAdmin ?  municipalities.filter((item) => item.stateEntityId === stateEntityID) : municipalities
    //   );
    // }
    onMunicipalityChange(_municipalityId, _entityId);
  }, [municipalities, _entityId]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      const {
        data: { items },
      } = await organizationsApi.apiOrganizationsGet({ pageSize: -1 });

      setInstitutions(items.sort((a, b) => a.name.localeCompare(b.name)));
    };

    fetchInstitutions();
  }, []);

  const validateUser = useCallback(async () => {
    try {
      const email = form.getFieldValue("email")?.trim();
      if (!email) return;

      const response = await usersApi.usersAvailableEmailGet({ email });

      if (!response.data) {
        setUserAlreadyExists(true);
        form.setFields([
          {
            name: "email",
            errors: [
              t(
                "validations.user-email-already-exists",
                "User email already exists!"
              ),
            ],
          },
        ]);
        return;
      }

      setUserAlreadyExists(false);
    } catch (err) {
      console.error(err);
    }
  }, [form, setUserAlreadyExists, t]);

  useEffect(() => {
    if (!onEditMode) validateUser();
  }, [onEditMode, emailDebouncedValue]);

  useEffect(() => {
    if (profileImageFile) {
      const previewUrl = URL.createObjectURL(profileImageFile);
      setProfileImage(previewUrl);

      // cleanup to avoid memory leaks
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [profileImageFile]);

  // useEffect(() => {
  //   if (onEditMode) {
  //     form.setFieldsValue(user);
  //     setMunicipalityId(user.municipalityId);
  //     setEntityId(user.stateEntityId);
  //   } else {
  //     // form.setFieldsValue({ userGroups: userGroups?.map((x) => x.name) });
  //   }
  // }, [user, userGroups]);

  const onUserProfileFinish = async (data) => {
    // Your existing onFinish logic here, or call upsertUser with partial data if needed
    setProfileCompleted(true);
    setActiveTab("permissions");
  };

  const handleNavClick = (tabKey) => {
    // Prevent switching to permissions unless profileCompleted is true
    // if (tabKey === "permissions" && !profileCompleted) {
    //   return;
    // }
    setActiveTab(tabKey);
  }


  useEffect(() => {
    if (onEditMode) {
      const patchedUser = { ...user };
      // Set to '1' for US, or your default country code if phone number is missing/empty/invalid
      if (!patchedUser.phoneNumber || !/^\d+$/.test(patchedUser.phoneNumber)) {
        patchedUser.phoneNumber = "1";
      }
      // Remove '+' if present
      if (patchedUser.phoneNumber.startsWith("+")) {
        patchedUser.phoneNumber = patchedUser.phoneNumber.slice(1);
      }
      form.setFieldsValue(patchedUser);
      setMunicipalityId(user.municipalityId);
      setEntityId(user.stateEntityId);
      setProfileImage(user.profileImage);

    }
  }, [onEditMode, user, userGroups]);


  const onFinish = async (data) => {
    if (activeTab === "profile") {
      if (userAlreadyExists) {
        return;
      }

      // setCurrentStep(currentStep + 1);
      handleNavClick("permissions")
      setRequest(data);
      return;
    }

    await upsertUser({ ...request, ...data });
  };

  const upsertUser = async (data) => {
    setIsSaving(true);
    const labels = {
      updated: t("users:user.updated", "User Updated"),
      created: t("users:user.created", "User Created"),
      updatedDescription: t(
        "users:user.updated.description",
        "User's information have been updated"
      ),
      createdDescription: t(
        "users:user.created.description",
        "New user has been successfully created!"
      ),
      updatedFailed: t("users:failed.update.user", "Update Failed!"),
      createdFailed: t("users:failed.create.user", "User Creation Failed"),
      updatedFailedDescription: t(
        "users:failed.update.user.description",
        "User couldn't be updated!"
      ),
      createdFailedDescription: t(
        "users:failed.create.user.description",
        "User couldn't be created!"
      ),
    };
    const dataWithImage = {
      ...data,
      profileImageFile
    }

    try {
      const response = onEditMode
        ? await usersApi.usersIdPut({ id: user.id, updateUserCommand: dataWithImage })
        : await usersApi.usersPost({ createUserCommand: dataWithImage });

      if (response.status === 200) {
        navigate("/users");
        openNotificationWithIcon(
          "success",
          onEditMode ? labels.updated : labels.created,
          onEditMode ? labels.updatedDescription : labels.createdDescription
        );
      }
    } catch (err) {
      openNotificationWithIcon(
        "error",
        onEditMode ? labels.updatedFailed : labels.createdFailed,
        onEditMode
          ? labels.updatedFailedDescription
          : labels.createdFailedDescription
      );
    } finally {
      setIsSaving(false);
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

  const props = {
    // name: 'file',
    // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    // headers: {
    //   authorization: 'authorization-text',
    // },
    multiple: false,
    onChange(info) {
      if (info.file.status === "done" || info.file.status === "uploading") {
        const fileObj = info.file.originFileObj; // real File object
        setProfileImageFile(fileObj);
      }
    },
  };

  return (
    <Cards
      title={
        <div className="card-nav">
          <ul>
            <li>
              <a
                // onClick={() => handleNavClick("profile")}
                className={activeTab === "profile" ? "active" : ""}
              >
                <FeatherIcon icon="user" size={14} style={{ marginRight: 8 }} />
                {t("users:users.userprofile", "User Profile")}
              </a>
            </li>
            <li>
              <a
                // onClick={() => handleNavClick("permissions")}
                className={activeTab === "permissions" ? "active" : ""}
              // style={{
              //   pointerEvents: profileCompleted ? "auto" : "none",  
              //   color: profileCompleted ? undefined : "#8a92a6",    
              //   opacity: profileCompleted ? 1 : 0.7,                 
              //   borderBottom: (activeTab === "permissions") ? "2px solid #5f63f2" : "2px solid transparent"
              // }}
              >
                <FeatherIcon icon="lock" size={14} style={{ marginRight: 8 }} />
                {t("users:users.userpermissions", "Permissions")}
              </a>
            </li>
          </ul>
        </div>
      }
    >
      {activeTab === "profile" && (

        <WizardWrapper>
          <WizardFour>
            {/* <Steps
            key={currentStep}
            isvertical
            isswitch
            current={currentStep}
            direction="horizontal"
            steps={[
              {
                title: t("users:profile", "Profile"),
                content: ( */}
            <BasicFormWrapper className="basic-form-inner">
              <div className="atbd-form-checkout">
                <Row justify="center">
                  <Col xs={24}>
                    <div className="create-account-form">
                      <Heading as="h4">
                        {t("users:user.profile", "User Profile")}
                      </Heading>
                      <figure className="photo-upload align-center" style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>

                        {/* <img src={require('../../static/img/avatar/profileImage.png')} alt="" /> */}

                        <img
                          title={t("users:users.profile-photo-title-size", "120x120")}
                          src={profileImage ?? "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"}
                          alt="Profile Photo"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png";
                          }}
                          />
                       
                          <Upload {...props}   accept=".jpg,.jpeg,.png" showUploadList={false} >
                            <Link className="btn-upload" to="#">
                              <FeatherIcon icon="camera" size={16} />
                            </Link>
                          </Upload>
                        
                        <figcaption style={{ marginBottom : "14px"}}>
                          <div className="info">
                            <Heading as="h6">{t("users:users.profile-photo", "Profile Photo")}</Heading>
                          </div>
                        </figcaption>
                      </figure>
                      <Form
                        form={form}
                        name="account"
                        requiredMark
                        onFinish={onFinish}
                        validateTrigger={["onChange", "onBlur", "onSubmit"]}
                        onFinishFailed={({ errorFields }) => {
                          form.scrollToField(errorFields[0].name);
                        }}
                      >
                        <Form.Item
                          name="email"
                          label={t(
                            "user-view-details.email",
                            "Email Address"
                          )}
                          requiredMark
                          tooltip={t(
                            "users:email.usage.purpose.tooltip",
                            "This email will be used for logging into the app"
                          )}
                          rules={[
                            {
                              required: true,
                              message: t(
                                "users.create:email-validation",
                                "Email is required"
                              ),
                              // pattern:
                              //   /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              // pattern: /^(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            },
                            {
                              // pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              pattern: /^(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: t(
                                "users.create:email-format-validation",
                                "Invalid email format"
                              ),
                            },
                          ]}
                          required
                        >
                          <Input
                            required
                            prefix={<FeatherIcon icon="mail" size={14} />}
                            placeholder={t(
                              "user-view-details.email",
                              "Email Address"
                            )}
                            disabled={user !== null}
                          />
                        </Form.Item>
                        <Form.Item
                          name="firstName"
                          required
                          label={t("global:first.name", "First Name")}
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
                        >
                          <Input
                            placeholder={
                              t("global:first.name", "First Name") + "*"
                            }
                            required
                            disabled={userAlreadyExists}
                            prefix={<FeatherIcon icon="user" size={14} />}
                          />
                        </Form.Item>

                        <Form.Item
                          name="lastName"
                          required
                          label={t("global:last.name", "Last Name")}
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
                        >
                          <Input
                            disabled={userAlreadyExists}
                            placeholder={
                              t("global:last.name", "Last Name") + "*"
                            }
                            prefix={
                              <FeatherIcon icon="users" size={14} />
                            }
                            required
                          />
                        </Form.Item>

                        {/* <Form.Item
                                name="phoneNumber"
                                label={t("global.phone-number	", "Phone Number")}
                              >
                                <Input
                                  disabled={userAlreadyExists}
                                  placeholder={t(
                                    "global.phone-number	",
                                    "Phone Number"
                                  )}
                                  prefix={
                                    <FeatherIcon icon="phone" size={14} />
                                  }
                                />
                              </Form.Item> */}
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
                            // preferredCountries={['us', 'in', 'gb']}
                            inputProps={{
                              name: 'phone',
                              disabled: userAlreadyExists,
                              placeholder: t("global.phone-number", "Phone Number"),
                            }}
                            onChange={(value) => form.setFieldsValue({ phoneNumber: value })}
                            value={form.getFieldValue('phoneNumber')}
                            containerStyle={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                          />
                        </Form.Item>
                        {accessLevel > AccessLevelType.NUMBER_1 && (
                          <Form.Item
                            name="organizationId"
                            required
                            label={t(
                              "global:select.company",
                              "Select Company"
                            )}
                            requiredMark
                            rules={[
                              {
                                required: true,
                                message: t(
                                  "validations:company.required",
                                  "Select Company"
                                ),
                              },
                            ]}
                          >
                            <Select
                              className="sDash_fullwidth-select"
                              aria-required
                              showSearch
                              style={{ color: "rgb(90, 95, 125)" }}
                              placeholder={t(
                                "global:select.company",
                                "Select Company"
                              )}
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                            >
                              {institutions &&
                                institutions.map((item) => (
                                  <Option key={item.id} value={item.id}>
                                    {item.name}
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>
                        )}
                        {/* <Form.Item
                                name="municipalityId"
                                label="Select Municipality"
                                required
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select Municipality",
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  filterOption={(input, option) =>
                                    option.props.children
                                      ?.toLowerCase()
                                      .indexOf(input?.toLowerCase()) >= 0
                                  }
                                  className="sDash_fullwidth-select"
                                  style={{ color: "rgb(90, 95, 125)" }}
                                  aria-required
                                  onChange={onMunicipalityChange}
                                >
                                  {municipalities &&
                                    municipalities.map((item) => (
                                      <Option key={item.id} value={item.id}>
                                        {item.name}
                                      </Option>
                                    ))}
                                </Select>
                              </Form.Item>
                              <Form.Item
                                name="cantonId"
                                required
                                label="Select Canton"
                              >
                                <Select
                                  className="sDash_fullwidth-select"
                                  aria-required
                                  style={{ color: "rgb(90, 95, 125)" }}
                                  disabled
                                >
                                  {cantons &&
                                    cantons.map((item) => (
                                      <Option key={item.id} value={item.id}>
                                        {item.name}
                                      </Option>
                                    ))}
                                </Select>
                              </Form.Item>

                              <Form.Item
                                name="stateEntityId"
                                required
                                label="Select Entity"
                                requiredMark
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select Entity",
                                  },
                                ]}
                              >
                                <Select
                                  className="sDash_fullwidth-select"
                                  aria-required
                                  style={{ color: "rgb(90, 95, 125)" }}
                                  disabled
                                >
                                  {stateEntities &&
                                    stateEntities.map((item) => (
                                      <Option key={item.id} value={item.id}>
                                        {item.name}
                                      </Option>
                                    ))}
                                </Select>
                              </Form.Item> */}

                        <Form.Item
                          name="languageId"
                          required
                          label={t(
                            "system-languages.default-language",
                            "Default Language"
                          )}
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
                            disabled={userAlreadyExists}
                          >
                            {languages &&
                              languages.map((item) => (
                                <Option key={item.id} value={item.id}>
                                  {item.name}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>

                        {/* <Form.Item
                                name="comments"
                                label={t("global:comments", "Comments")}
                              >
                                <TextArea
                                  disabled={userAlreadyExists}
                                  placeholder={t("global:comments", "Comments")}
                                  rows={3}
                                  prefix={
                                    <FeatherIcon
                                      icon="message-circle"
                                      size={14}
                                    />
                                  }
                                />
                              </Form.Item> */}

                        <div className="steps-action">
                          <Button
                            className="btn-next"
                            type="primary"
                            htmlType="submit"
                            disabled={userAlreadyExists}
                            style={{ height: 50, padding: "10px 20px" }}
                          >
                            {t("global:next", "Next")}
                            <FeatherIcon icon="arrow-right" size={16} />
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </BasicFormWrapper>
          </WizardFour>
        </WizardWrapper>
      )}
      {/* ),
              },
              {
                title: t("global:permissions", "Permissions"),
                content: ( */}
      {activeTab === "permissions" && (
        <WizardWrapper>
          <WizardFour>
            <BasicFormWrapper className="basic-form-inner">
              <div className="atbd-form-checkout">
                <Row justify="center">
                  <Col xs={24}>
                    <div className="create-account-form">
                      <Heading as="h4">
                        {t(
                          "global:users.permission",
                          "User's Permissions"
                        )}
                      </Heading>
                      <Form
                        form={form}
                        name="account"
                        requiredMark
                        onFinish={onFinish}
                      >
                        <Form.Item
                          name="userGroups"
                          required
                          label={t(
                            "global:select.user.groups",
                            "Select User Groups"
                          )}
                          rules={[
                            {
                              required: true,
                              message: t(
                                "validations.user.group.required",
                                "Please select at least one group"
                              ),
                            },
                          ]}
                        >
                          <Select
                            mode="multiple"
                            style={{ width: "100%" }}
                            placeholder={t(
                              "global:please.select",
                              "Please select"
                            )}
                            className="basic-multi-select"
                          >
                            {userGroups &&
                              userGroups.map((item) => (
                                <Option
                                  value={item?.name}
                                  key={item?.name}
                                  disabled={
                                    Object.values(
                                      PredefinedRoles
                                    ).includes(item?.name) &&
                                    currentUserIsCompany
                                  }
                                >
                                  {item?.name}
                                </Option>
                              ))}
                          </Select>
                        </Form.Item>

                        <div
                          className="steps-action"
                          style={{ display: "flex", gap: 20 }}
                        >
                          <Button
                            type="default"
                            style={{ height: 50, padding: "10px 20px" }}
                            onClick={() => handleNavClick("profile")}
                          >
                            {t("global:go.back", "Go back")}{" "}
                            <FeatherIcon icon="arrow-left" size={16} />
                          </Button>
                          <Button
                            className="btn-next"
                            type="primary"
                            loading={isSaving}
                            htmlType="submit"
                            style={{ height: 50, padding: "10px 20px" }}
                          >
                            {!onEditMode
                              ? t(
                                "users:complete.registration",
                                "Complete Registration"
                              )
                              : t("users:update.user", "Update User")}
                            <FeatherIcon icon="user-check" size={16} />
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </BasicFormWrapper>
            {/* ),
              },
            ]}
            isfinished
          /> */}
          </WizardFour>
        </WizardWrapper>
      )}
    </Cards>
  );
}

export default UserWizzard;
