import {
  Checkbox,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Table,
  Tooltip
} from "antd";
import { AutoComplete } from "../../../components/autoComplete/autoComplete";
import { UserFilterType } from "api/models";
import { useTableSorting } from "hooks/useTableSorting";
import { ProjectHeader, ProjectSorting } from "../email/style";
import { Link, NavLink } from "react-router-dom";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { Modal } from "components/modals/antd-modals";
import { PageHeader } from "components/page-headers/page-headers";
import { theme } from "config/theme/themeVariables";
import {
  AddProfile,
  BasicFormWrapper,
  CardToolbox,
  Main,
  ProfilePageHeaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import FeatherIcon from "feather-icons-react";
import { useAuthorization } from "hooks/useAuthorization";
import React, { useEffect, useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
import { LanguagesApi } from "../../../api";
import path from "path";
import { useSelector, useDispatch } from "react-redux";
import { ProjectToolbarWrapper } from "../email/style";
import { sortingProjectByCategory } from "redux/themeLayout/actionCreator";
import { SearchOutlined } from "@ant-design/icons";
// import { Checkbox } from "components/checkbox/checkbox";

const languagesApi = new LanguagesApi();
const Grid = lazy(() => import("../email/Grid"));
const List = lazy(() => import("../email/List"));

const initialFormValues = {
  id: 0,
  country: "",
  isDefault: false,
  i18nCodeId: 0,
};

const SystemLanguages = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.headerSearchData);
  const { hasPermission } = useAuthorization();

  const filterKeys = [
    { id: UserFilterType.ALL, name: t("users:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("users:select.active", "Active") },
    {
      id: UserFilterType.PENDING,
      name: t("users:select.not-confirmed", "Not Confirmed"),
    },
    hasPermission("users:list-deactivated") && {
      id: UserFilterType.DISABLED,
      name: t("users:select.disabled", "Disabled"),
    },
    { id: UserFilterType.DELETED, name: t("users:select.deleted", "Deleted") },
  ].filter(Boolean);

  const [usersData, setUsersData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { sorting, onSorterChange } = useTableSorting({
    field: 'name',
    order: 'asc',
  });

  const [request, setRequest] = useState({
    filterType: UserFilterType.ACTIVE,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const sortingOptions = [
    { label: t("users:sort.newest", "Newest"), value: "createdAt_desc" },
    { label: t("users:sort.oldest", "Oldest"), value: "createdAt_asc" },
    { label: t("users:sort.name-asc", "Name A-Z"), value: "name_asc" },
    { label: t("users:sort.name-desc", "Name Z-A"), value: "name_desc" },
  ];

  const onFilterChange = (e) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const onSearchChange = (value) => {
    setRequest({ ...request, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const [state, setState] = useState({
    visible: false,
    editVisible: false,
    modalType: "primary",
    record: {
      key: "",
    },
  });

  const onSorting = (selectedItems) => {
    dispatch(sortingProjectByCategory(selectedItems));
  };

  const [languages, setLanguages] = useState([]);
  const [languageCodes, setLanguageCodes] = useState([]);
  const [languageSubmitLoading, setLanguageSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const [translations, setTranslations] = useState({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });

  const fetchData = async () => {
    setState({ loading: true });
    await getLanguages();
    await getLanguageCodes();
    setState({ loading: false });
  };

  const getLanguages = async () => {
    const { data } = await languagesApi.apiLanguagesGet();
    setLanguages(data);
  };

  const getLanguageCodes = async () => {
    const { data } = await languagesApi.apiLanguagesI18nCodesGet();
    setLanguageCodes(data);
  };

  const onCancel = () => {
    setState({
      ...state,
      visible: false,
      editVisible: false,
    });
  };

  const handleSubmit = async (values) => {
    values.position = parseInt(values.position);
    try {
      setLanguageSubmitLoading(true);
      const response = await languagesApi.apiLanguagesPost({
        addLanguageCommand: values,
      });
      if (response.status === 200) {
        openNotificationWithIcon(
          "success",
          t("system-languages.success.add", "Language was created successfully")
        );
        fetchData();
      }
    } catch (error) {
    } finally {
      setLanguageSubmitLoading(false);
      onCancel();
    }
  };

  const renderLanguagesInDropDown = () => {
    // console.log(languageCodes);
    return languageCodes.map((language) => {
      // console.log(language.code)
      const flags = require.context("./flags", false, /\.svg$/);
      const flagSrc = flags(`./${language.code.toLowerCase()}.svg`);

      return <Select.Option key={language.id} value={language.id}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {t(`global.language.${language.name}`, language.name)}
        <img
          src={flagSrc}
          alt={`${language.name} Flag`}
          style={{
            width: "1.5em",
            height: "1.5em",
            borderRadius: "50%",
            objectFit: "cover",
            maxWidth: 20,
          }}
        />
        </div>
      </Select.Option>
  });
  };

  const handleEditSubmit = async (values) => {
    values.position = parseInt(values.position);
    try {
      setLanguageSubmitLoading(true);

      await languagesApi.apiLanguagesIdPut({
        id: values?.id,
        updateLanguageCommand: values,
      });

      openNotificationWithIcon(
        "success",
        t("system-languages.success.edit", "Language was updated successfully")
      );
      onCancel();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
    } finally {
      setLanguageSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const onDeleteConfirm = async (id) => {
    try {
      await languagesApi.apiLanguagesIdDelete({ id });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) { }
  };

  const showModal = () => {
    setState({
      ...state,
      visible: true,
    });

    form.resetFields();
  };

  const showEditModal = (language) => {
    setState({
      ...state,
      editVisible: true,
      language,
    });
    form.setFieldsValue(responseToFormModel(language));
  };

  const responseToFormModel = (model) => {
    return {
      id: model.id,
      position: model.position,
      country: model.i18nCode.name,
      i18nCodeId: model.i18nCodeId,
      isDefault: model.isDefault,
    };
  };

  const languagesTableData = languages.map((language) => {
    const { id, position, i18nCode, hasTranslations, isDefault } = language;

    return {
      key: id,
      position,
      country: t(`global.language.${i18nCode.name}`, i18nCode.name),
      isDefault: isDefault ? (
        <div
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <FeatherIcon size={20} icon="check" color={theme["primary-color"]} />
        </div>
      ) : null,
      action: (
        <div
          key={id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Tooltip title={t("global:edit", "Edit")}>
          <Button className="btn-icon" type="primary" to="#" shape="circle">
            <Link onClick={() => showEditModal(language)} to="#" title={t("global:edit", "Edit")}>
              <FeatherIcon icon="edit" size={16} />
            </Link>
          </Button>
          </Tooltip>
          {hasPermission("languages:delete") ? (
            <>
              {/* {!hasTranslations && ( */}
              <Popconfirm
                title={t(
                  "system-languages.delete-language-confirmation",
                  "Are you sure delete this Language?"
                )}
                onConfirm={() => onDeleteConfirm(id)}
                okText="Yes"
                cancelText="No"
              >
              <Tooltip title={t("global.delete", "Delete")}>
                <Button
                  className="btn-icon"
                  type="danger"
                  to="#"
                  shape="circle"
                >
                   <Link to="#" title={t("global.delete", "Delete")} >
                      <FeatherIcon icon="trash-2" size={16} />
                    </Link>
                </Button>
                </Tooltip>
              </Popconfirm>
            </>
          ) : null}
        </div>
      )
    };
  });

  const columns = [
    {
      title: t("global.position", "Position"),
      dataIndex: "position",
      key: "position",
    },
    {
      title: t("global.country", "Country"),
      dataIndex: "country",
      key: "country",
    },
    {
      title: t("global.default", "Default"),
      key: "isDefault",
      dataIndex: "isDefault",
      width: "50px",
    },
    {
      title: ''
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  return (
    <>
      {/* <CardToolbox style={{marginBottom:"-20px"}}> */}
        <ProjectHeader>
          <PageHeader
            ghost
            title={t("system-languages.title", "Languages")}
            subTitle={<>{languagesTableData?.length} {t("configuration:total-languages", "Languages")}</>}
            buttons={[
              hasPermission("languages:add") && (
                <Button
                  onClick={showModal}
                  className="btn-add_new"
                  size="default"
                  type="primary"
                  key="add-language"
                >
                  {t("system-languages.add", "Add New Language")}
                </Button>
              ),
            ]}
          />
        </ProjectHeader>
      {/* </CardToolbox> */}

      <Main>
            <Cards headless>
              <ProfileTableStyleWrapper>
                  <TableWrapper className="table-responsive">
                    <Table
                      style={{ textAlign: "left" }}
                      loading={state.loading}
                      dataSource={languagesTableData}
                      columns={columns}
                      rowKey="key"
                      pagination={{
                        defaultPageSize: 10,
                        total: translations.totalCount,
                        defaultCurrent: translations.pageIndex,
                        current: translations.pageIndex,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} ${t(
                            "global.of",
                            "of"
                          )} ${total} ${t("global.items", "items")}`,
                        onChange: onPaginationChange,
                      }}
                    />
                  </TableWrapper>
              </ProfileTableStyleWrapper>
            </Cards>
        <Modal
          type={state.modalType}
          title={t("system-languages.modal.title", "Add New Language")}
          visible={state.visible}
          footer={null}
          onCancel={handleCancel}
        >
          <div className="project-modal">
            <AddProfile>
              <BasicFormWrapper>
                <Form form={form} name="language" onFinish={handleSubmit}>
                  <Form.Item label="Id" name="id" hidden>
                    <Input placeholder="Id" />
                  </Form.Item>

                  <Form.Item
                    label={t("global.position", "Position")}
                    name="position"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.position", {
                          field: t("global.position", "Position"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.position", "Position")}
                      type="number"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Choose language to install"
                    name="i18nCodeId"
                  >
                    <Select
                      showSearch
                      placeholder="Choose a new language to install"
                      filterOption={(input, option) =>
                        option.props.children
                          ?.toLowerCase()
                          .indexOf(input?.toLowerCase()) >= 0
                      }
                    >
                      {renderLanguagesInDropDown()}
                    </Select>
                  </Form.Item>

                  <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>
                      {t(
                        "system-languages.default-language",
                        "Default Language"
                      )}
                    </Checkbox>
                  </Form.Item>
                  <Button
                    disabled={languageSubmitLoading}
                    htmlType="submit"
                    size="default"
                    loading={languageSubmitLoading}
                    type="primary"
                    key="submit"
                  >
                    {t("system-languages.modal.add", "Add New Language")}
                  </Button>
                   <Button className="mx-3" size="default" type="white" key="back" outlined onClick={handleCancel}>
                  Cancel
                </Button>
                </Form>
              </BasicFormWrapper>
            </AddProfile>
          </div>
        </Modal>
        <Modal
          type={state.modalType}
          title={t("system-languages.editmodal.title", "Edit Language")}
          visible={state.editVisible}
          footer={null}
          onCancel={handleCancel}
        >
          <div className="project-modal">
            <AddProfile>
              <BasicFormWrapper>
                <Form
                  form={form}
                  name="languageEdit"
                  onFinish={handleEditSubmit}
                >
                  <Form.Item label="Id" name="id" hidden>
                    <Input placeholder="Id" />
                  </Form.Item>

                  <Form.Item label="i18nCodeId" name="i18nCodeId" hidden>
                    <Input placeholder="i18nCodeId" />
                  </Form.Item>

                  <Form.Item
                    label={t("global.position", "Position")}
                    name="position"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.position", {
                          field: t("global.position", "Position"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                    ]}
                  >
                    <Input placeholder="Position" type="number" />
                  </Form.Item>

                  <Form.Item
                    label={t("global.country", "Counry")}
                    name="country"
                  >
                    <Select
                      disabled
                      value={form.getFieldValue("i18nCodeId")}
                      placeholder="Name"
                    >
                      {renderLanguagesInDropDown()}
                    </Select>
                  </Form.Item>

                  <Form.Item name="isDefault" valuePropName="checked">
                    <Checkbox>
                      {t(
                        "system-languages.default-language",
                        "Default Language"
                      )}
                    </Checkbox>
                  </Form.Item>

                  <Button
                    htmlType="submit"
                    size="default"
                    type="primary"
                    disabled={languageSubmitLoading}
                    loading={languageSubmitLoading}
                    key="submit"
                  >
                    {t("system-languages.editmodal.edit", "Edit Language")}
                  </Button>
                  <Button className="mx-3" size="default" type="white" key="back" outlined onClick={handleCancel}>
                   Cancel
                </Button>
                </Form>
              </BasicFormWrapper>
            </AddProfile>
          </div>
        </Modal>
      </Main>
    </>
  );
};
export default SystemLanguages;
