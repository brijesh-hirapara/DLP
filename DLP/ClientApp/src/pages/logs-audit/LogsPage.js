import { Col, Input, Row, Table, Tooltip, Select } from "antd";
import FeatherIcon from "feather-icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ActivityLogsApi } from "../../api";
/**
 * Hooks and Constants
 */
import { sortDirections } from "constants/constants";
import { useAuthorization } from "hooks/useAuthorization";

/**
 * Styles
 */
import {
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  TableWrapper,
} from "container/styled";
import { UserTableStyleWrapper } from "../style";

/**
 * Components
 */
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { Modal } from "components/modals/antd-modals";
import { PageHeader } from "components/page-headers/page-headers";
import { useTableSorting } from "hooks/useTableSorting";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import OrdinalNumber from "components/common/OrdinalNumber";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { NavLink } from "react-router-dom";
import path from "path";
import { ProjectHeader, ProjectSorting } from "pages/localization/email/style";

const logsApi = new ActivityLogsApi();
const { Option } = Select;

const LogsPage = () => {
  /**
   * Translation
   */
  const { t } = useTranslation();

  /**
   * Authorization
   */
  const { hasPermission } = useAuthorization();

  /**
   * States
   */
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [logs, setLogs] = useState({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });
  const { onSorterChange, sorting } = useTableSorting();
  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    fullName: "",
    ip: "",
    logType: 0,
    activity: "",
  });

  const logTypes = [
    { value: 0, label: t("logs.ALL", "ALL") },
    { value: 1, label: t("logs.INFO", "INFO") },
    { value: 2, label: t("logs.ERROR", "ERROR") },
    { value: 3, label: t("logs.EXCEPTION", "EXCEPTION") },
  ];

  const sortingOptions = [
    { label: t("users:sort.newest", "Newest"), value: "createdAt_desc" },
    { label: t("users:sort.oldest", "Oldest"), value: "createdAt_asc" },
    { label: t("users:sort.name-asc", "Name A-Z"), value: "name_asc" },
    { label: t("users:sort.name-desc", "Name Z-A"), value: "name_desc" },
  ];

  const [request, setRequest] = useState({
    filterType: 1,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const columns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("global.User", "User"),
      dataIndex: "user",
      key: "user",
      sorter: true,
      sortDirections,
    },
    {
      title: t("logs.ip-address", "IP Address"),
      dataIndex: "ip",
      key: "ip",
      sorter: true,
      sortDirections,
    },
    {
      title: t("logs.date-time", "Date and Time"),
      dataIndex: "date",
      key: "date",
      sorter: true,
      sortDirections,
    },
    {
      title: t("logs.log-type", "Log Type"),
      dataIndex: "logType",
      key: "logType",
      sorter: true,
      sortDirections,
    },
    {
      title: t("logs.activity", "Activity"),
      dataIndex: "activity",
      key: "activity",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "70px",
    },
  ];

  /**
   * Generate table data
   */
  const generateTableData = () => {
    return logs?.items?.map((record) => {
      const {
        id,
        ordinalNumber,
        user,
        ip,
        date,
        logType,
        activity,
        description,
      } = record;

      return {
        key: id,
        ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
        user,
        ip,
        date,
        logType: (
          <span style={{ color: logType === "INFO" ? "#3ac569" : "#f5222d" }}>
            {logType}
          </span>

        ),
        activity: hasPermission("logs:view-details") && (
          <span style={{ marginRight: "5px" }}>{activity}</span>
        ),
        action: (
          <div
            key={id}
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {hasPermission("logs:view-details") && (
              <>
                <Tooltip title={t("global.view", "View")}>
                  <Button
                    className="btn-icon"
                    type="primary"
                    to="#"
                    shape="circle"
                  >
                    <Link
                      onClick={() => {
                        setDetailsModalVisible(true);
                        setSelectedLog(record);
                      }}
                      to="#"
                    >
                      <FeatherIcon icon="eye" size={16} />
                    </Link>
                  </Button>
                </Tooltip>

              </>
            )}
          </div>
        ),
      };
    });
  };

  /**
   * Get logs
   */
  const getLogs = async () => {
    const { data } = await logsApi.activitiesGet({ ...query, ...sorting });
    setLogs(data);
    setLoading(false);
  };
  /**
   * Use Effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      getLogs();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, sorting]);

  /**
   * Tables Event
   */
  const handlePaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const handleShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("logs.title", "Logs")}
          subTitle={<>{logs?.totalCount} {t("dashboard:total-logs", "Total Logs")}</>}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"Logs"}
              filterType={0}
              municipalityId={""}
              entityId={""}
              search={""}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>

              <div className="form-card-wrapper">
                <Input
                  className="round-input"
                  style={{ height: "38px", width: '100%' }}

                  placeholder={t("logs.by-user-first-last", "User (First Name or Last Name)")}
                  onChange={(e) => {
                    setQuery({
                      ...query,
                      fullName: e.target.value,
                      pageNumber: 1,
                    });
                  }}
                />
                <Input
                  className="round-input"
                  style={{ height: "38px", width: '100%' }}
                  placeholder={t("logs.ip-address", "IP Address")}
                  onChange={(e) => {
                    setQuery({ ...query, ip: e.target.value, pageNumber: 1 });
                  }}
                />
                <div >

                  <Select
                    placeholder={t("logs.log-type", "Log Type")}
                    style={{ width: "100%" }}
                    value={query.logType}
                    onChange={(value) => {
                      setQuery({
                        ...query,
                        logType: value,
                        pageNumber: 1,
                      });
                    }}
                  >
                    {logTypes.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>

                </div>
                <Input
                  className="round-input"
                  style={{ height: "38px" }}
                  placeholder={t("logs.activity", "Activity")}
                  onChange={(e) => {
                    setQuery({
                      ...query,
                      activity: e.target.value,
                      pageNumber: 1,
                    });
                  }}
                />
              </div>

            </ProjectSorting>
          </Col>
        </Row>

        <Row gutter={15}>
          <Col md={24}>
            <UserTableStyleWrapper>
              <Cards headless>
                <TableWrapper>
                  <Table
                    loading={isLoading}
                    dataSource={generateTableData()}
                    columns={columns}
                    showSorterTooltip={false}
                    pagination={{
                      position: ["bottomCenter"],
                      pageSize: query.pageSize,
                      total: logs.totalCount,
                      current: logs.pageIndex,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 50, 100, 1000],
                      showTotal: (total) =>
                        `${t("logs.total", "Total")} ${total} ${t(
                          "logs.log",
                          "Log(s)"
                        )}`,
                      onChange: handlePaginationChange,
                      onShowSizeChange: handleShowSizeChange,
                    }}
                    onChange={(_, __, sorter) => onSorterChange(sorter)}
                  />
                </TableWrapper>
              </Cards>
            </UserTableStyleWrapper>
          </Col>
        </Row>
        <Modal
          type="primary"
          visible={isDetailsModalVisible}
          footer={null}
          onCancel={() => setDetailsModalVisible(false)}
          width="80%"
        >
          <div>
            <table cellPadding={5} style={{ marginBottom: "3%" }}>
              <tr>
                <th>User</th>
                <th>{selectedLog.user}</th>
              </tr>
              <tr>
                <th>Ip Address</th>
                <th>{selectedLog.ip}</th>
              </tr>
              <tr>
                <th>Date Time</th>
                <th>{selectedLog.date}</th>
              </tr>
              <tr>
                <th>Log Type</th>
                <th>{selectedLog.logType}</th>
              </tr>
              <tr>
                <th>Activity</th>
                <th>{selectedLog?.activity}</th>
              </tr>
            </table>
            {selectedLog.description !== "" && (
              <div>{selectedLog.description}</div>
            )}
          </div>
        </Modal>
      </Main>
    </>
  );
};

export default LogsPage;
