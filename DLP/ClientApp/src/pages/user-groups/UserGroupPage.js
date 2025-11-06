import React, { useState, useEffect, Suspense, useContext } from "react";
import {
  Row,
  Col,
  Skeleton,
  Collapse,
  Checkbox,
  Form,
  Input,
  Spin,
  Select,
  Tooltip,
} from "antd";
import { Button } from "../../components/buttons/buttons";
import { Modal } from "../../components/modals/antd-modals";
import ReactSelect from "react-select/creatable";
import { PageHeader } from "../../components/page-headers/page-headers";
import { Cards } from "../../components/cards/frame/cards-frame";
import FeatherIcon from "feather-icons-react";
import { Main, CardToolbox, BasicFormWrapper } from "../../container/styled";
import { UsercardWrapper } from "../style";
import { Link } from "react-router-dom";
import openNotificationWithIcon from "../../utility/notification";
import Heading from "../../components/heading/heading";
import { useAuthorization } from "../../hooks/useAuthorization";
import {
  UserGroupsApi,
  ModulesApi,
  AccessLevelApi,
  UserFilterType,
  UsersApi,
} from "../../api";
import UserGroupCard from "./UserGroupCard";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "hooks/useDebouncedValue";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { getRole } from "utility/decode-jwt";
import { PredefinedRoles } from "constants/constants";
import { setRefreshToken } from "api/axiosIntercept";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { ProjectSorting } from "pages/localization/email/style";
const { Option } = Select;
const { Panel } = Collapse;

var usersApi = new UsersApi();
const userGroupsApi = new UserGroupsApi();
const modulesApi = new ModulesApi();
const accessLevelApi = new AccessLevelApi();

const UserGroupPage = (onCancel) => {
  const { refreshCommonData } = useContext(CommonDataContext);
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [form] = Form.useForm();
  const [isUserGroupsLoading, setIsUserGroupsLoading] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showFunctionalities, setShowFunctionalities] = useState(false);
  const [userGroupAlreadyExists, setUserGroupAlreadyExists] = useState(false);
  const [request, setRequest] = useState({
    search: "",
  });
  const [addUserGroupState, setAddUserGroupState] = useState({
    modulesWithFunctionalities: [],
    assignedUsers: [],
    isLoading: false,
    modalVisible: false,
    areFunctionalitiesLoading: false,
    errors: {},
  });

  const [deleteUserGroupState, setDeleteUserGroupState] = useState({
    itemSelected: null,
    isLoading: false,
  });

  const [accessLevels, setAccessLevels] = useState([]);

  const nameValue = useDebouncedValue({
    delay: 300,
    value: Form.useWatch("name", form),
  });

  useEffect(() => {
    const validateUser = async () => {
      try {
        const name = form.getFieldValue("name")?.trim();
        if (!name) {
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
      } catch (err) {}
    };

    validateUser();
  }, [nameValue]);

  useEffect(() => {
    callApis();
  }, []);


  const callApis = async () => {
    await Promise.all([
      loadUserGroups(),
      getAllUsers(),
      getFunctionalities(),
      getAccessLevels(),
    ]);
  };

  const onSearchChange = (value) => {
    setRequest({ search: value });
  };

  useEffect(() => {
    if (request) loadUserGroups();
  }, [request]);

  const getAccessLevels = async () => {
    const { data } = await accessLevelApi.accessLevelsGet();
    setAccessLevels(data);
    form.setFieldsValue({
      accessLevel: data[0]?.id,
    });
  };

  const loadUserGroups = async () => {
    setIsUserGroupsLoading(true);
    try {
      const { data } = await userGroupsApi.userGroupsGet({ ...request });
      setUserGroups(data);
    } catch (ex) {
    } finally {
      setIsUserGroupsLoading(false);
    }
  };

  const getFunctionalities = async () => {
    try {
      setAddUserGroupState((p) => ({ ...p, areFunctionalitiesLoading: true }));
      const { data } = await modulesApi.modulesGet();
      setAddUserGroupState((p) => ({ ...p, modulesWithFunctionalities: data }));
    } catch (error) {
    } finally {
      setAddUserGroupState((p) => ({ ...p, areFunctionalitiesLoading: true }));
    }
  };

  const getAllUsers = async () => {
    const {
      data: { items },
    } = await usersApi.usersListGet({
      pageSize: -1,
      filterType: UserFilterType.ACTIVE,
      sortingPropertyName: "user",
      sortingIsDescending: false,
    });
    setAllUsers(
      items.map((item) => ({
        value: item.id,
        label: `${item.firstName} ${item.lastName} (${item.email})`,
      }))
    );
  };

  const handleAddUserGroup = async (values) => {
    if (userGroupAlreadyExists) {
      return;
    }

      const trimmedName = values.name?.trim();

  if (!trimmedName) {
    // Show validation error and prevent submission
    form.setFields([{
      name: "name",
      errors: [t("user-groups:validations.whitespace-not-allowed", "Name cannot be empty or whitespace only.")]
    }]);
    return; 
  }

    const { assignedUsers, modulesWithFunctionalities } = addUserGroupState;
    let permissions = [];

    modulesWithFunctionalities.forEach((module) => {
      module.functionalities.forEach((fun) => {
        permissions.push(fun);
      });
    });

    if (!permissions.filter((x) => x?.checked)?.length >= 1) {
      setAddUserGroupState((p) => ({
        ...p,
        errors: {
          ...p.errors,
          functionalities: t(
            "user-groups:validations.select.functionality",
            "Select at least one functionality!"
          ),
        },
      }));
      return;
    }

    try {
      setAddUserGroupState((p) => ({ ...p, isLoading: true }));
      const tokenRoles = getRole();
      const normalizedRoles = Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles];
     
      const existedGroup = normalizedRoles.some(role => role.includes(values.name));
      const payload = {
        // name: values.name,
        name: trimmedName,
        permissions: permissions.map((x) => ({
          name: x.name,
          checked: x?.checked,
        })),
        users: assignedUsers.map((x) => ({ id: x.value })),
        accessLevel: values.accessLevel,
      };

      await userGroupsApi.userGroupsPost({ addUserGroupCommand: payload });
      await existedGroup && setRefreshToken();
      form.resetFields();

      setAddUserGroupState((p) => ({
        ...p,
        modulesWithFunctionalities: p.modulesWithFunctionalities.map(
          (module) => ({
            ...module,
            checked: false,
            functionalities: module.functionalities.map((fun) => ({
              ...fun,
              checked: false,
            })),
          })
        ),
        assignedUsers: [],
        modalVisible: false,
      }));
      loadUserGroups();
      openNotificationWithIcon(
        "success",
        t("user-groups:successfully.added", "Group successfully added!")
      );
  
      refreshCommonData();
    } catch (error) {
    } finally {
      setAddUserGroupState((p) => ({ ...p, isLoading: false }));
    }
  };

  const onChangeAssignedUsers = (assignedUsers) => {
    setAddUserGroupState((p) => ({
      ...p,
      assignedUsers,
      errors: { ...p.errors, assignedUsers: null },
    }));
  };

  const onClickGroupToDelete = (itemSelected) => {
    setDeleteUserGroupState((p) => ({ ...p, itemSelected }));
  };

  const handleDeleteUserGroup = async () => {
    try {
      const tokenRoles = getRole();
      const normalizedRoles = Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles];
     
      const existedGroup = normalizedRoles.some(role => role.includes(deleteUserGroupState.itemSelected?.name));
      setDeleteUserGroupState((p) => ({ ...p, isLoading: true }));
      await userGroupsApi.userGroupsNameDelete({
        name: deleteUserGroupState.itemSelected?.name,
      });
      await existedGroup && setRefreshToken()
      setUserGroups((p) =>
        p.filter((x) => x.name !== deleteUserGroupState.itemSelected?.name)
      );
      onClickGroupToDelete(null);
      openNotificationWithIcon(
        "success",
        t("user-groups:deleted", "Group has been deleted!")
      );
    } catch (err) {
    } finally {
      setDeleteUserGroupState((p) => ({ ...p, isLoading: false }));
    }
  };

  const onFunctionalityStateChange = (e, moduleId, name) =>
  {
    e.stopPropagation();

    setAddUserGroupState((p) =>
    {
      const modules = p.modulesWithFunctionalities;

      return {
        ...p,
        errors: { ...p.errors, functionalities: null },
        modulesWithFunctionalities: modules.map((x) =>
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
        ),
      };
    });
  };
  const onModuleStateChanged = (e, id) =>
  {
    e.stopPropagation();

    setAddUserGroupState((p) =>
    {
      const modules = p.modulesWithFunctionalities;

      return {
        ...p,
        errors: { ...p.errors, functionalities: null },
        modulesWithFunctionalities: modules.map((module) =>
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
        ),
      };
    });
  };




  const onUserGroupUpdate = (index, updatedGroup) => {
    const updatedUserGroups = [...userGroups];
    updatedUserGroups[index] = updatedGroup;
    setUserGroups(updatedUserGroups);
  };

  const renderUserGroups = () => {
    return userGroups.map((item, index) => (
      <Col key={item?.id} xxl={6} xl={8} sm={12} xs={24}>
        <Suspense
          fallback={
            <Cards headless>
              <Skeleton avatar active />
            </Cards>
          }
        >
          <UserGroupCard
            allUsers={allUsers}
            onClickForDelete={() => onClickGroupToDelete(item)}
            userGroup={item}
            onUpdate={(updatedGroup) => onUserGroupUpdate(index, updatedGroup)}
          />
        </Suspense>
      </Col>
    ));
  };

  const { errors, modulesWithFunctionalities } = addUserGroupState;
  return (
    <div>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("user-groups:title", "User Groups")}
          
          buttons={[
            hasPermission("user-groups:add") && (
              <Button
                onClick={() =>
                  setAddUserGroupState((p) => ({ ...p, modalVisible: true }))
                }
                className="btn-add_new"
                size="default"
                type="primary"
                key="1"
              >
                <Link to="#">
                  + {t("user-groups:add.new.user.group", "Add New User Group")}
                </Link>
              </Button>
            ),
          ]}
          subTitle={
            // <div>
            //   <Input
            //     style={{ height: "38px" }}
            //     onChange={(param) => {
            //       onSearchChange(param.target.value);
            //     }}
            //     placeholder={t("", "Search by name")}
            //     width="100%"
            //   />
            // </div>
            
            <>
            {userGroups?.length} {t("user-groups:total-user-groups", "Total User Groups")}
            <ProjectSorting>
            <div className="project-sort-bar">
            {/* <div className="project-sort-search" style={{marginTop: "15px"}}>
              <AutoComplete placeholder="Search projects" patterns />
            </div> */}
                  <div className="project-sort-search" style={{marginTop: "25px"}}>
                    <AutoComplete
                      onSearch={(value) => onSearchChange(value)}
                      onChange={(param) => {
                        onSearchChange(param.target.value);
                      }}
                      
                      // width="100%"
                      patterns
                      placeholder={t(
                  "global.auto-complete-placeholder",
                  "Search..."
                )}
                    />
                  </div>
            </div>
            </ProjectSorting>
            </>
          }
        />
      </CardToolbox>

      <Main>
        <UsercardWrapper>
          {isUserGroupsLoading ? (
            <div className="spin" style={{ marginTop: -100 }}>
              {" "}
              <Spin />{" "}
            </div>
          ) : null}
          <Row gutter={25}>{renderUserGroups()}</Row>
        </UsercardWrapper>
      </Main>

      <Modal
        type="primary"
        title={t("user-groups:deactivate", "Deactivate user group")}
        visible={deleteUserGroupState.itemSelected}
        footer={
          <div>
             <Tooltip title={t("global.delete", "Delete")}>
            <Button
              disabled={deleteUserGroupState.isLoading}
              onClick={handleDeleteUserGroup}
              size="small"
              type="danger"
            >
               {/* <Link to="#" title={t("global.delete", "Delete")} > */}
                      <FeatherIcon icon="trash-2" size={14} style={{ color: "#fff" }} />
                    {/* </Link> */}
              <span style={{marginTop: "4px"}}>{t("user-groups:delete", "Delete")}</span>
            </Button>
            </Tooltip>
          </div>
        }
        width={400}
        onCancel={() => onClickGroupToDelete(null)}
      >
        {deleteUserGroupState.isLoading ? (
          <div
            style={{
              height: 140,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <div style={{ height: 140 }}>
            <Heading
              style={{ textAlign: "center" }}
              className="info-single__title"
              as="h3"
            >
              {t(
                "user-groups:delete.confirmation.message",
                "Are you sure you want to delete this group?"
              )}
            </Heading>
            <p>
            
              {t("user-groups:has", "it has")}
              {" "}{deleteUserGroupState.itemSelected?.totalMembers}{" "}
              {t("user-groups:members", "members")}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        type="primary"
        title={t("user-groups:add", "Add new user group")}
        visible={addUserGroupState.modalVisible}
        footer={
          <div>
            {!addUserGroupState.isLoading && (
              <Button
                form="addUserGroup"
                htmlType="submit"
                size="default"
                type="primary"
                key="submit"
              >
                {t("global:add", "Add")}
              </Button>
            )}
            <Button className="mx-3" size="default" type="white" key="back" outlined onClick={() =>
          setAddUserGroupState((p) => ({ ...p, modalVisible: false }))
        }>
              {t("users:users.cancel", "Cancel")}
            </Button>
          </div>
        }
        onCancel={() =>
          setAddUserGroupState((p) => ({ ...p, modalVisible: false }))
        }
      >
        {addUserGroupState.isLoading ? (
          <Spin
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: 320,
            }}
          />
        ) : (
          <BasicFormWrapper>
            <Form
              id="addUserGroup"
              form={form}
              name="Functionalities"
              onFinish={handleAddUserGroup}
            >
              <Form.Item
                label={t(
                      "user-groups:name.name",
                      "Name"
                    )}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      "user-groups:validations.write-group-name",
                      "Please write Name!"
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                      "user-groups:name.placeholder",
                      "Name"
                    )}
                  // onBlur={onBlurNameInput}
                />
              </Form.Item>

              {accessLevels.length > 0 && (
                <Form.Item
                  name="accessLevel"
                  required
                  label={t(
                      "user-groups:access.select-access-level",
                      "Select Access Level"
                    )}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "user-groups:validations.select-access-level",
                        "Please select access level"
                      ),
                    },
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
              )}

              <p style={{ margin: 0 }}>
                {t("user-groups:assigned-users", "Assigned users")}:{" "}
              </p>
              <ReactSelect
                isMulti
                value={addUserGroupState.assignedUsers}
                onChange={onChangeAssignedUsers}
                name="selectedUsers"
                // styles={{
                //   control: (base) => ({
                //     ...base,
                //     height: "48px",
                //   }),
                // }}
                options={allUsers}
                isDisabled={userGroupAlreadyExists}
                className="basic-multi-select"
              />
              {/* {errors?.assignedUsers && (
                <div role="alert" style={{ color: "#f5222d" }}>
                  {errors.assignedUsers}
                </div>
              )} */}

              {!userGroupAlreadyExists && (
                <li
                  style={{
                    cursor: "pointer",
                    marginTop: 10,
                    fontSize: 16,
                    marginBottom: 0,
                    textDecorationStyle: "solid",
                  }}
                  onClick={() => setShowFunctionalities((p) => !p)}
                >
                  {showFunctionalities
                    ? t(
                        "user-groups:collapse.functionalities",
                        "Collapse functionalities"
                      )
                    : t(
                        "user-groups:expand.functionalities",
                        "Expand functionalities"
                      )}
                  <FeatherIcon
                    icon={`chevron-${showFunctionalities ? "up" : "down"}`}
                    size={16}
                  />
                </li>
              )}

              {showFunctionalities && (
                <div style={{ marginTop: 20, marginBottom: 20 }}>
                  {modulesWithFunctionalities.map((module) => (
                    <Collapse
                      style={{
                        background: "white !important",
                        borderRadius: 2,
                        marginBottom: 20,
                      }}
                    >
                      <Panel
                        header={
                          <Checkbox
                            disabled={userGroupAlreadyExists}
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
                        style={{
                          background: "white !important",
                          borderRadius: 2,
                        }}
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
                              disabled={userGroupAlreadyExists}
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
              {errors?.functionalities && (
                <div
                  className="babaktu"
                  role="alert"
                  style={{ color: "#f5222d", marginBottom: 20 }}
                >
                  {errors.functionalities}
                </div>
              )}
            </Form>
          </BasicFormWrapper>
        )}
      </Modal>
    </div>
  );
};

export default UserGroupPage;
