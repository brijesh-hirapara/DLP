import { Col, Input, Popconfirm, Radio, Row, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { RequestsApi } from "api/api";
import { ListRequestDto, ListRequestDtoPaginatedList, RequestStatus, VehicleFleetRequestStatus } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import OrdinalNumber from "components/common/OrdinalNumber";
import { PageHeader } from "components/page-headers/page-headers";
import renderStatusBadge from "components/tags/requestStatusTag";
import { sortDirections } from "constants/constants";
import { CardToolbox, Main, ProfileTableStyleWrapper, TableWrapper } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { ProjectSorting } from "pages/localization/email/style";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import path from "path";
import { UserFilterType } from "api/models";
import { ListVehicleFleetRequestDtoPaginatedList } from "api/models/list-vehicle-fleet-request-dto-paginated-list";
import { ListVehicleFleetRequestDto } from "api/models/list-vehicle-fleet-request-dto";
import { formatDate } from "api/common";

const requestsApi = new RequestsApi();

const initialData = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageIndex: 1,
  totalCount: 0,
  totalPages: 0,
};
type FilterItem = { id: VehicleFleetRequestStatus; name: string };


export const VehicleFleetPage = () => {
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();

  const getUserStatus = (request:any) => {
  const color = request.isPending
    ? "not-confirm"
    : request.isDeleted
      ? "blocked"
      : request.isActive
        ? "active"
        : "deactivate";
  const text = request.isPending
    ? "Not Confirmed"
    : request.isDeleted
      ? "Deleted"
      : request.isActive
        ? "Active"
        : "Disabled";
  return <span className={`ant-tag ${color}`}>{text}</span>;
};


const filterKeys = [
  { id: VehicleFleetRequestStatus.ALL, name: t("users:select.all", "All") },
  { id: VehicleFleetRequestStatus.CONFIRMED, name: t("users:select.active", "Active") },
  { id: VehicleFleetRequestStatus.PENDING, name: t("users:select.pending", "Pending") },
  {
    id: VehicleFleetRequestStatus.OUTDATED,
    name: t("users:select.outdated", "Outdated"),
  },
  { id: VehicleFleetRequestStatus.REJECTED, name: t("users:select.rejected", "Rejected") },
].filter(Boolean);

  const [vehiclesData, setVehiclesData] = useState<ListVehicleFleetRequestDtoPaginatedList>(initialData);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const { onSorterChange, sorting } = useTableSorting();
  const [query, setQuery] = useState<{
    search: string;
    pageNumber: number;
    pageSize: number;
    listArchived: boolean;
    // type: RequestStatus;
    status:VehicleFleetRequestStatus; // <- Use the enum type here
  }>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
    listArchived: true,
    // type: RequestStatus.ALL,
    status:VehicleFleetRequestStatus.ALL
  });

  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const navigate = useNavigate();
    
  const [request, setRequest] = useState({
    filterType: 1,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });


  const getRequestStatus = (request: VehicleFleetRequestStatus, statusDesc: string) => {
    let color = "deactivate";
  
    if (request === VehicleFleetRequestStatus.PENDING) {
      color = "deactivate";
    } else if (request === VehicleFleetRequestStatus.REJECTED) {
      color = "blocked";
    } else if (request === VehicleFleetRequestStatus.CONFIRMED) {
      color = "active";
  } else if (request === VehicleFleetRequestStatus.OUTDATED) {
    color = "not-confirm";
  }
  
    return <span className={`ant-tag ${color}`}>{statusDesc}</span>;
  };
  

  useEffect(() => {
    fetchVehicles();
  }, [query, sorting]);

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  const onPaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const response = await requestsApi.apiVehicleFleetRequestsGet({
        ...query,
        ...sorting,
      });
      setVehiclesData(response.data);
    } catch (err) {
      // handle error if necessary
    } finally {
      setVehiclesLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global:ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
      width: 50,
    },
    {
      title: t("vehicle-fleet:table.date-of-submission", "Date of Submission"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections,
      width: 200,
    },
    {
      title: t("vehicle-fleet:table.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections,
      width: 150,
    },
    {
      title: t("vehicle-fleet:table.comments", "Comments"),
      dataIndex: "comments",
      key: "comments",
      sorter: true,
      sortDirections,
      align: "center",
    render: (text: string) => (
      <div style={{
        whiteSpace: "normal",
        wordBreak: "break-word",
        textAlign: "left",     
      }}>
        {text}
      </div>
    )
    },
    {
      title: t("global.actions", "Action"),
      dataIndex: "action",
      key: "action",
      align: "center",
      width: 100,
    },
  ];

  const tableData = (vehiclesData?.items ?? []).map((item: ListVehicleFleetRequestDto) => {
    const { id, ordinalNumber, status,comments, statusText, createdAt } = item;
    return {
      key: id,
      ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
      createdAt: formatDate(createdAt),
      comments:comments,
      status: (
        <div className="table-status">
          {getRequestStatus(
            status as VehicleFleetRequestStatus,
            t(`vehicle-fleet:status.${status}`, statusText as string)
          )}
        </div>
      ),
      action: (
        <div
          key={id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
        {/* View Button */}  
        {hasPermission("vehical-fleet:view-details") && status !== 2 && (
          <Tooltip title={t("global.view", "View")}>
            <Button
              className="btn-icon"
              type="info"
              shape="circle"
              onClick={() => setSelectedVehicle(item)}
            >
              <Link to={`/vehicle-fleet/${id}`}>
              <FeatherIcon icon="eye" size={25} />
              </Link>
            </Button>
          </Tooltip> )}
        {/* Edit Button */}
        {hasPermission("vehical-fleet:edit")  && status === 2 && (
          <Tooltip title={t("global.edit", "Edit")}>
            <Button className="btn-icon" type="primary" to="#" shape="circle">
              <Link to={`/vehicle-fleet/${id}/edit`}>
                <FeatherIcon icon="edit" size={16} />
              </Link>
            </Button>
          </Tooltip>
          )}
        </div>
      ),
    };
  });

  return (
    <>
      {/* <CardToolbox> */}
      <PageHeader
        ghost
        title={t("vehicle-fleet.title", "Vehicle Fleet")}
        subTitle={
          <>
            {vehiclesData?.totalCount}{" "}
            {t("dashboard:total-vehicle-fleet", "Total Vehicle Fleet")}
          </>
        }
        buttons={[
          <ExportButtonPageApiHeader
          key="1"
          callFrom={"VehicleFleets"}
          filterType={query.status}
          listArchived={query.listArchived}
          municipalityId={""}
          entityId={""}
          search={query.search}
          typeOfEquipmentId={""}
          from={""}
          to={""}
        />,
          hasPermission("vehical-fleet:add") && (
          <Button
            className="btn-add_new"
            size="default"
            type="primary"
            key="btn_2"
            onClick={() => navigate("/vehicle-fleet/create")}
          >
            {t("vehicle-fleet:button.add", "+ Add New Vehicle Fleet")}
          </Button>),
        ]}
      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                    {[...new Set(filterKeys)].map((item) => (
                        <li
                          key={item.id}
                          className={query?.status === item.id ? 'active' : 'deactivate'}
                        >
                          <Link
                            to="#"
                            onClick={() =>
                              setQuery({
                                ...query,
                                status: item.id,
                                pageNumber: 1,
                                pageSize: 10,
                              })
                            }
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
                <div className="project-sort-search">
                  <AutoComplete
                    onSearch={(value) => onSearchChange(value)}
                    patterns
                    placeholder={t(
                  "global.auto-complete-placeholder",
                  "Search..."
                )}
                  />
                </div>
                
              </div>
            </ProjectSorting>
          </Col>
        </Row>

        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={vehiclesLoading}
                      dataSource={tableData}
                      columns={columns}
                      showSorterTooltip={true}
                      rowKey="key"
                      pagination={{
                        pageSize: query.pageSize,
                        current: vehiclesData.pageIndex,
                        total: vehiclesData.totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        onChange: onPaginationChange,
                        onShowSizeChange: onShowSizeChange,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      onChange={(_, __, sorter) => onSorterChange(sorter)}
                    />
                    {/* <Table
                      loading={vehiclesLoading}
                      dataSource={staticTableData}
                      columns={columns}
                      showSorterTooltip={true}
                      rowKey="key"
                      pagination={{
                        pageSize: 10,
                        current: 1,
                        total: 7,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      onChange={(_, __, sorter) => onSorterChange(sorter)}
                    /> */}
                  </TableWrapper>
                </div>
              </ProfileTableStyleWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
};
