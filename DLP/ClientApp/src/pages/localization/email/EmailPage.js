import { Col, Form, Input, Row, Select, Spin, Table } from "antd";
import { useEffect, useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  BasicFormWrapper,
  CardToolbox,
  Main,
  TableWrapper,
} from "container/styled";
import { AutoComplete } from "../../../components/autoComplete/autoComplete";
import { useAuthorization } from "hooks/useAuthorization";
import openNotificationWithIcon from "utility/notification";
import { EmailOptionsApi } from "../../../api";
import { Modal } from "../../../components/modals/antd-modals";
import { UserTableStyleWrapper } from "../../style";
import { ProjectHeader, ProjectToolbarWrapper, ProjectSorting } from "./style";
import { useTableSorting } from "hooks/useTableSorting";
import { NavLink, Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import path from "path";
import { sortingProjectByCategory } from "redux/themeLayout/actionCreator";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "../../../components/buttons/buttons";
import { UserFilterType } from "api/models";

const emailOptionsApi = new EmailOptionsApi();
const Grid = lazy(() => import("./Grid"));
const List = lazy(() => import("./List"));

function hasErrors(fieldErrors) {
  let has_errors = false;

  for (let i = 0; i < fieldErrors.length; i++) {
    const error = fieldErrors[i];
    const { errors } = error;

    if (errors.length > 0) {
      has_errors = true;
    }
  }

  return has_errors;
}

const EmailPage = (onCancel) => {
  /**
   * Translation
   */
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

  const [tableColumns] = useState([
    {
      title: t("configure.email.from", "Email (From)"),
      dataIndex: "from",
      key: "from",
    },
    {
      title: t("configure.email.smtpHost", "SMTP Host"),
      dataIndex: "smtpHost",
      key: "smtpHost",
    },
    {
      title: t("configure.email.smtpPass", "SMTP Password"),
      dataIndex: "smtpPass",
      key: "smtpPass",
      border: "1px solid red",
    },
    {
      title: t("configure.email.smtpUser", "SMTP User Account"),
      dataIndex: "smtpUser",
      key: "smtpUser",
      border: "1px solid red",
    },
    {
      title: "",
    },
  ]);

  const [translations, setTranslations] = useState({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });

  const [state, setState] = useState({
    notData: searchData,
    visible: false,
    categoryActive: "all",
  });

  const onSorting = (selectedItems) => {
    dispatch(sortingProjectByCategory(selectedItems));
  };

  const [emailData, setEmailData] = useState([]);
  const emailTableData = [];
  const [form] = Form.useForm();

  const [addEmailConfiguration, setAddEmailConfiguration] = useState({
    isLoading: false,
    modalVisible: false,
    testedConnections: false,
    testConnectionsError: false,
    testConnectionsLoading: false,
  });

  const handleCancel = () => {
    setAddEmailConfiguration((p) => ({ ...p, modalVisible: false }))
  };

  const handleSubmit = async (values) => {
    try {
      if (!addEmailConfiguration.testedConnections) {
        handleTestConnection();
        return;
      }
      setAddEmailConfiguration((p) => ({ ...p, isLoading: true }));
      await emailOptionsApi.emailOptionsPost({
        createNewEmailOptionsCommand: values,
      });
      openNotificationWithIcon(
        "success",
        t(
          "email.options.success.add",
          "Email Configuration was created successfully"
        )
      );
      setAddEmailConfiguration((p) => ({
        ...p,
        isLoading: false,
        modalVisible: false,
      }));
      getEmailOptions();
    } catch (error) {}
  };

  const handleTestConnection = async () => {
    try {
      const errors = form.getFieldsError();
      if (hasErrors(errors)) {
        return;
      }

      setAddEmailConfiguration((p) => ({
        ...p,
        testConnectionsError: false,
        testConnectionsLoading: true,
      }));
      const values = form.getFieldsValue();

      const response = await emailOptionsApi.emailOptionsTestConnectionPost({
        testSmtpConnectionCommand: {
          email: values?.from,
          password: values?.smtpPass,
          port: values?.smtpPort,
          smtpServer: values?.smtpHost,
          username: values?.smtpUser,
        },
      });

      setAddEmailConfiguration((p) => ({
        ...p,
        testedConnections: response.data.success,
        testConnectionsLoading: false,
      }));
    } catch (error) {
      setAddEmailConfiguration((p) => ({
        ...p,
        testConnectionsError: true,
        testConnectionsLoading: false,
      }));
    }
  };

  const getEmailOptions = async () => {
    setAddEmailConfiguration((p) => ({ ...p, isLoading: true }));
    const { data } = await emailOptionsApi.emailOptionsActiveGet();
    setEmailData([data]);
    setAddEmailConfiguration((p) => ({ ...p, isLoading: false }));
  };

  useEffect(() => {
    getEmailOptions();
  }, []);

  const onFilterChange = (e) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };


  emailData?.map((emailObj) => {
    const { from, smtpHost, smtpUser } = emailObj;
    return emailTableData.push({
      from,
      smtpHost,
      smtpPass: "************",
      smtpUser,
    });
  });

  const onSearchChange = (value) => {
    setRequest({ ...request, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  return (
    <>
    <div>
      {/* <CardToolbox style={{marginBottom:"-20px"}}> */}
      <ProjectHeader>
        <PageHeader
          key={"email-page-header"}
          ghost
          title={t("email-options.title", "SMTP Email Configuration")}
          subTitle={<>{emailTableData?.length} {t("configuration:total-emails", "Email")}</>}
          buttons={[
            hasPermission("email-options:add") && (
              <Button
                onClick={() =>
                  setAddEmailConfiguration((p) => ({
                    ...p,
                    modalVisible: true,
                  }))
                }
                className="btn-add_new"
                size="default"
                type="primary"
                key="add-email-config-modal"
              >
                {t("email-configurations.update", "Update Email Configuration")}
              </Button>
            ),
          ]}
        />
        </ProjectHeader>
      {/* </CardToolbox> */}
      
      {/* <div>
        <Switch>
          <Suspense
            fallback={
              <div className="spin">
                <Spin />
              </div>
            }
          >
            <Route path={path} component={Grid} exact />
            <Route path={`${path}/grid`} component={Grid} />
            <Route path={`${path}/list`} component={List} />
          </Suspense>
        </Switch>
      </div> */}
      <Main>
            <Cards headless>
            <UserTableStyleWrapper>
                <TableWrapper className="table-responsive">
            <Table
                  style={{ textAlign: "left" }}
                  loading={addEmailConfiguration.isLoading}
                  dataSource={emailTableData}
                  columns={tableColumns}
                  rowKey={(record) => record.id}
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
              </UserTableStyleWrapper>
            </Cards>
      </Main>

      <Modal
        type="primary"
        title={t("email:title", "Update Email Configuration")}
        footer={null}
        visible={addEmailConfiguration.modalVisible}
        onCancel={() =>
          setAddEmailConfiguration((p) => ({ ...p, modalVisible: false }))
        }
      >
        {addEmailConfiguration.isLoading ? (
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
              id="addEmailConfig"
              form={form}
              name="email"
              onFinish={handleSubmit}
              requiredMark
            >
              <Form.Item
                required
                name="from"
                rules={[
                  {
                    required: true,
                    message: "Send From Email!",
                    type: "email",
                  },
                ]}
              >
                <Input type="email" placeholder="Email" required />
              </Form.Item>
              <Form.Item
                required
                name="smtpHost"
                rules={[{ required: true, message: "SMTP Host is required" }]}
              >
                <Input placeholder="SMTP Host ex: smtp.gmail.com" required />
              </Form.Item>
              <Form.Item
                name="smtpPort"
                required
                rules={[{ required: true, message: "SMTP Port" }]}
              >
                <Input type="number" placeholder="SMTP Port" required />
              </Form.Item>
              <Form.Item
                name="smtpUser"
                required
                rules={[{ required: true, message: "SMTP User" }]}
              >
                <Input placeholder="SMTP Account User" required />
              </Form.Item>
              <Form.Item
                name="smtpPass"
                required
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: "SMTP Password" }]}
              >
                <Input placeholder="SMTP Password" type="password" required />
              </Form.Item>
              <div
                style={{
                  paddingTop: 20,
                  display: "flex",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                }}
              >
                <div style={{ textAlign: "right" }}>
                  {addEmailConfiguration.testedConnections && (
                    <div style={{ color: "#4347d9" }}>
                      {t(
                        "email-options.email-test-connection-success",
                        "Connection was successful!"
                      )}
                    </div>
                  )}
                  {addEmailConfiguration.testConnectionsError && (
                    <div style={{ color: "red" }}>
                      {t(
                        "errors.email-test-connection-failed",
                        "Connection with the server failed, please check your credentials!"
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  {!addEmailConfiguration.testedConnections ? (
                    <Button
                      htmlType="submit"
                      size="default"
                      type="primary"
                      key="test-connection"
                      load={addEmailConfiguration.testConnectionsLoading}
                      disabled={addEmailConfiguration.testConnectionsLoading}
                    >
                      {addEmailConfiguration.testConnectionsLoading && <Spin />}
                      {t("email.test-connection", "Test Connection")}
                    </Button>
                  ) : null}

                  {addEmailConfiguration.testedConnections ? (
                    <Button
                      form="addEmailConfig"
                      htmlType="submit"
                      size="default"
                      type="primary"
                      key="add-email-config"
                    >
                      {t("email.save-as-default", "Save as default")}
                    </Button>
                  ) : null}
                  <Button className="mx-3" size="default" type="white" key="back" outlined onClick={handleCancel}>
                  Cancel
                </Button>
                </div>
              </div>
            </Form>
          </BasicFormWrapper>
        )}
      </Modal>
    </div>
    </>
  );
};

export default EmailPage;
