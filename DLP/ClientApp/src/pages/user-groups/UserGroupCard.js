import React, { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
import { Col, Row, Collapse, Checkbox, Spin, Form, Input, Select, Tooltip } from "antd";
import { UserCard } from "../style";
import Heading from "../../components/heading/heading";
import { Cards } from "../../components/cards/frame/cards-frame";
import { Button } from "components/buttons/buttons";
import { Modal } from "../../components/modals/antd-modals";
import ReactSelect from "react-select/creatable";
import openNotificationWithIcon from "../../utility/notification";
import { useAuthorization } from "../../hooks/useAuthorization";
import { UserGroupsApi, AccessLevelApi } from "../../api";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "hooks/useDebouncedValue";
import { BasicFormWrapper } from "container/styled";
import isSuperAdmin from "utility/isSuperAdmin";
import { setRefreshToken } from "api/axiosIntercept";
import { getRole } from "utility/decode-jwt";

const { Panel } = Collapse;
const { Option } = Select;
const userGroupsApi = new UserGroupsApi();
const accessLevelApi = new AccessLevelApi();

const UserGroupCard = ({ userGroup, allUsers, onClickForDelete, onUpdate, handleAddUserGroup }) => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [form] = Form.useForm();
  const superAdmin = isSuperAdmin();
  const [userGroupDetails, setUserGroupDetails] = useState(userGroup);
  const [showModal, setShowModal] = useState(false);
  const [userGroupAlreadyExists, setUserGroupAlreadyExists] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [modulesWithFunctionalities, setModulesWithFunctionalities] = useState([]);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [loadingUserGroupDetails, setLoadingUserGroupsDetails] = useState(false);
  const [showFunctionalities, setShowFunctionalities] = useState(false);
  const [checkedFunctionalitiesCount, setCheckedFunctionalitiesCount] = useState(0);
  const [accessLevels, setAccessLevels] = useState([]);

  useEffect(() => {
    setUserGroupDetails(userGroup);
  }, [userGroup]);

  const getUserGroupDetails = async () => {
    try {
      setLoadingUserGroupsDetails(true);
      const {
        data: { users, moduleFunctionalities, accessLevel, accessLevelDesc },
      } = await userGroupsApi.userGroupsNameGet({
        name: userGroupDetails?.name,
      });
      setSelectedUsers(
        users.map((item) => ({
          value: item.id,
          label: `${item.fullName}`,
        }))
      );
      setModulesWithFunctionalities(moduleFunctionalities);

      const checkedCount = moduleFunctionalities
        .flatMap((module) => module.functionalities)
        .reduce(
          (count, functionality) => count + (functionality.checked ? 1 : 0),
          0
        );
      setCheckedFunctionalitiesCount(checkedCount);

      form.setFieldsValue({ name: userGroupDetails?.name, accessLevel });
    } catch (error) {
    } finally {
      setLoadingUserGroupsDetails(false);
    }
  };

  const handleEditUserGroup = () => {
    getUserGroupDetails();
    getAccessLevels();
    setShowModal(true);
  };

  const nameValue = useDebouncedValue({
    delay: 300,
    value: Form.useWatch("name", form),
  });

  const getAccessLevels = async () => {
    const { data } = await accessLevelApi.accessLevelsGet();
    const updatedData = data.map(item => {
      return {
        ...item,
        name: t(`global:access-level-${item.id}`, item.name)
      };
    });

    setAccessLevels(updatedData);
  };

  useEffect(() => {
    const validateUser = async () => {
      try {
        const name = form.getFieldValue("name")?.trim();
        if (!name || name === userGroupDetails.name) {
          return;
        }

        const response = await userGroupsApi.userGroupsAvailableNameGet({
          name,
        });

        if (!response.data) {
          setUserGroupAlreadyExists(true);
          form.setFields([
            {
              name: "name",
              errors: [
                t(
                  "user-groups:validations.user-group-already-exists",
                  "User group already exists!"
                ),
              ],
            },
          ]);
          return;
        }

        form.setFields([
          {
            name: "name",
            errors: [],
          },
        ]);
        setUserGroupAlreadyExists(false);
      } catch (err) { }
    };

    validateUser();
  }, [nameValue]);

  const customPanelStyle = {
    background: "#F8F9FB",
    borderRadius: 3,
    marginBottom: 20,
    border: 0,
    overflow: "hidden",
  };


  const submitEdit = async () => {
    if (userGroupAlreadyExists) {
      return;
    }

    
  const trimmedName = form.getFieldValue("name")?.trim();

  // Block save if name is empty or whitespace only
  if (!trimmedName) {
    // set form error to show user feedback
    form.setFields([{
      name: "name",
      errors: [t("user-groups:validations.whitespace-not-allowed", "Name cannot be empty or whitespace only.")]
    }]);
    return; 
  }

    let permissions = [];

    modulesWithFunctionalities.forEach((module) => {
      module.functionalities.forEach((fun) => {
        fun.checked && permissions.push(fun);
      });
    });

    try {
      setIsEditLoading(true);
      const payload = {
        name: userGroupDetails.name,
        // newName: form.getFieldValue("name"),
        newName: trimmedName,
        accessLevel: form.getFieldValue("accessLevel"),
        permissions,
        users: selectedUsers.map((x) => ({ id: x.value })),
      };
      const { data } = await userGroupsApi.userGroupsPut({
        editUserGroupCommand: payload,
      });

      const tokenRoles = getRole();
      const normalizedRoles = Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles];
     
      const existedGroup = normalizedRoles.some(role => role.includes(userGroupDetails.name));



      if(existedGroup){
        setRefreshToken()
      }

      setUserGroupDetails(data);
      onUpdate({ ...data });
      setShowModal(false);
      openNotificationWithIcon(
        "success",
        t("user-groups:edited.successfully", "User group edited successfully!")
      );
    } catch (err) {
    } finally {
      setIsEditLoading(false);
    }
  };

  const onFunctionalityStateChange = (e, moduleId, name) => {
    e.stopPropagation();
    setModulesWithFunctionalities((m) =>
      m.map((x) =>
        x.id === moduleId
          ? {
            ...x,
            functionalities: x.functionalities.map((functionality) =>
              functionality.name === name
                ? { ...functionality, checked: e.target.checked }
                : functionality
            ),
            checked:
              x.functionalities
                .filter((y) => y.name !== name)
                .every((f) => f.checked) && e.target.checked,
          }
          : x
      )
    );
  };

  const onModuleStateChanged = (e, id) => {
    e.stopPropagation();
    setModulesWithFunctionalities((modules) =>
      modules.map((module) =>
        module.id === id
          ? {
            ...module,
            functionalities: module.functionalities.map((f) => ({
              ...f,
              checked: !module?.checked,
            })),
            checked: !module?.checked,
          }
          : module
      )
    );
  };

  return (
    <UserCard>
      <div className="card user-card" style={{ marginBottom: 20 }}>
        <Cards headless>
          <figure>
            {/* <img src={require(`../../../${img}`)} alt="" /> */}
          </figure>
          <figcaption>
            <div className="card__content">
              <Heading className="card__name" as="h3">
                <Link to="#">{userGroupDetails?.name}</Link>
              </Heading>
            </div>

            <div className="card__actions usergroup_card_actions" style={{ margin: "50px 0" }}>
              {hasPermission("user-groups:edit") &&
                (
                  <Tooltip title={t("global:edit", "Edit")}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleEditUserGroup}
                    className="usergroup_Button"
                    title={userGroupDetails.isEditable ? t("user-groups:edit", "Edit") : t("user-groups:view", "View")}
                  >
                    <FeatherIcon icon="edit" size={14} />
                    {userGroupDetails.isEditable ? t("user-groups:edit", "Edit") : t("user-groups:view", "View")}
                  </Button>
                  </Tooltip>
                )}
              {hasPermission("user-groups:deactivate") &&
                userGroupDetails.isEditable && (
                  <Button
                    onClick={onClickForDelete}
                    style={{ marginLeft: 20 }}
                    size="small"
                    outlined
                    type="danger"
                    className="usergroup_Button"
                    title={t("global.delete", "Delete")}
                  >
                    <FeatherIcon icon="trash" size={14} />
                    <span style={{marginTop: "4px"}}>{t("user-groups:delete", "Delete")}</span>
                  </Button>
                )}
            </div>
            <div className="card__info">
              <Row gutter={15}>
                <Col xs={12}>
                  <div className="info-single">
                    <Heading className="info-single__title" as="h2">
                      {userGroupDetails?.totalMembers}
                    </Heading>
                    <p>{t("user-groups:members", "Members")}</p>
                  </div>
                </Col>
                {/* <Col xs={8}>
                  <div className="info-single">
                    <Heading className="info-single__title" as="h2">
                      {userGroupDetails?.totalActiveMembers}
                    </Heading>
                    <p>{t("global:active", "Active")}</p>
                  </div>
                </Col> */}
                <Col xs={12}>
                  <div className="info-single">
                    <Heading className="info-single__title" as="h2">
                      {userGroupDetails?.totalPermissions}
                    </Heading>
                    <p>{t("user-groups:permission", "Permissions")}</p>
                  </div>
                </Col>
              </Row>
            </div>
          </figcaption>
        </Cards>
      </div>

      <Modal
        type="primary"
        title={userGroupDetails?.name}
        visible={showModal}
        footer=
        {
          (userGroupDetails.isEditable || superAdmin) ? <div>
            <Button size="small" type="primary" onClick={submitEdit}>
              {t("global:save", "Save")}
            </Button>
          </div> : <></>
        }
        onCancel={() => setShowModal(!showModal)}
      >
        {isEditLoading || loadingUserGroupDetails ? (
          <Spin
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        ) : (
          <>
            <BasicFormWrapper>
              <Form
                id="addUserGroup"
                form={form}
                name="Functionalities"
                // onFinish={() => { }}
                onFinish={handleAddUserGroup}
              >
                <Form.Item
                  label={t("global:name", "Name")}
                  name="name"
                  rules={[{ required: true, message: t("user-groups:validations.write-group-name", "Please write Name!") }]}
                >
                  <Input
                    placeholder="Name"
                  />
                </Form.Item>
                  {/* <Form.Item
                    label={t("global:name", "Name")}
                    name="name"
                    rules={[
                      { required: true, message: t("user-groups:validations.write-group-name", "Please write Name!") },
                      {
                        validator: (_, value) =>
                          value && value.trim() !== ""
                            ? Promise.resolve()
                            : Promise.reject(new Error(t("user-groups:validations.whitespace-not-allowed", "Name cannot be empty or whitespace only."))),
                      },
                    ]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item> */}
                <Form.Item
                  label={t("global:access-level", "Access Level")}
                  name="accessLevel"
                  required
                  rules={[
                    { required: true, message: t("user-groups:validations.select-access-level", "Please select access level") },
                  ]}
                >
                  <Select
                    disabled={userGroupAlreadyExists}
                    className="sDash_fullwidth-select"
                    aria-required
                    style={{ color: "rgb(90, 95, 125)" }}
                  >
                    {accessLevels.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </BasicFormWrapper>
            <p style={{ margin: '1rem 0 0 0' }}>
              {t("user-groups:assigned-users", "Assigned users")}:{" "}
            </p>
            <ReactSelect
              isMulti
              value={selectedUsers}
              onChange={setSelectedUsers}
              name="selectedStreets"
              options={allUsers}
              disabled={userGroupAlreadyExists}
              className="basic-multi-select"
            />
            <div style={{ marginTop: 20 }}>
              <p
                style={{
                  cursor: "pointer",
                  marginBottom: 0,
                  fontSize: 16,
                  textDecorationLine: "none",
                }}
                onClick={() => setShowFunctionalities((p) => !p)}
              >
                {showFunctionalities
                  ? t("global:collapse", "Collapse")
                  : t("global:expand", "Expand")}{" "}
                {checkedFunctionalitiesCount}{" "}
                {t("global:functionalities", "Functionalities")}
                <FeatherIcon
                  icon={`chevron-${showFunctionalities ? "up" : "down"}`}
                  size={16}
                />
              </p>
              {showFunctionalities && !userGroupAlreadyExists && (
                <div>
                  {modulesWithFunctionalities.map((module) => (
                    <Collapse bordered={false}>
                      <Panel
                        header={
                          <Checkbox
                            className={`bookItem__checkbox `}
                            checked={module.checked}
                            indeterminate={module.functionalities.some(f => f.checked) && !module.functionalities.every(f => f.checked)}
                            onChange={(value) =>
                              onModuleStateChanged(value, module.id)
                            }
                          >
                            <strong>{module.name}</strong>
                          </Checkbox>
                        }
                        key="1"
                        style={customPanelStyle}
                        forceRender
                      >
                        {module.functionalities.map((x) => (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              marginTop: 10,
                            }}
                          >
                            <Checkbox
                              className={`bookItem__checkbox `}
                              checked={x.checked}
                              onChange={(value) =>
                                onFunctionalityStateChange(
                                  value,
                                  module.id,
                                  x.name
                                )
                              }
                            >
                              <strong>{x.description}</strong>
                            </Checkbox>
                          </div>
                        ))}
                      </Panel>
                    </Collapse>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </UserCard>
  );
};

// UserGroupCard.propTypes = {
//   user: PropTypes.object,
// };

export default UserGroupCard;
