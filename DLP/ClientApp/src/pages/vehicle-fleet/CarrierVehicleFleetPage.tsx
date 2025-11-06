import { Col, Row, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { RequestsApi } from "api/api";
import {  VehicleFleetRequestStatus } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import OrdinalNumber from "components/common/OrdinalNumber";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import { Main, ProfileTableStyleWrapper, TableWrapper } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { useNavigate } from "react-router-dom";
import { ProjectSorting } from "pages/localization/email/style";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
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

export const CarrierVehicleFleetPage = () => {
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();
  const location = useLocation();
  const isListingVehicleFleetReuqests = location.pathname === "/vehicle-fleet-request";
  const isListingActiveVehicleFleet = location.pathname === "/active-vehicle-fleet";

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
  

const filterKeys = [
  { id: VehicleFleetRequestStatus.ALL, name: t("users:select.all", "All") },
  { id: VehicleFleetRequestStatus.PENDING, name: t("users:select.pending", "Pending") },
  { id: VehicleFleetRequestStatus.CONFIRMED, name: t("users:select.active", "Active") },
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
    status:VehicleFleetRequestStatus; // <- Use the enum type here
  }>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
    listArchived: isListingVehicleFleetReuqests,
    status: VehicleFleetRequestStatus.ALL
  });

  const navigate = useNavigate();
    
      const [request, setRequest] = useState({
        filterType: 1,
        search: "",
        pageNumber: 1,
        pageSize: 10,
      });

  const onFilterChange = (e:any) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
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
      title: t("vehicle-fleet:table.carrier-name", "Carrier Name"),
      dataIndex: "name",
      key: "name",
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
  ];
  
  if (isListingVehicleFleetReuqests) {
    columns.push({
      title: t("vehicle-fleet:table.submission-date", "Submission Date"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections,
      width: 200,
    });
    columns.push({
      title: t("global.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections,
      width: 150,
    });
  }
    

    if (isListingActiveVehicleFleet) {
    columns.push({
      title: t("vehicle-fleet:table.approval-date", "Approval Date"),
      dataIndex: "actionedAt",
      key: "actionedAt",
      sorter: true,
      sortDirections,
      width: 150,
    });
    columns.push({
      title: t("vehicle-fleet:table.number-of-vehicles", "Number of Vehicles"),
      dataIndex: "totalVehicle",
      key: "totalVehicle",
      sorter: true,
      sortDirections,
      width: 150,
    });
    columns.push({
      title: t("vehicle-fleet:table.last-updated", "Last Updated"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      sortDirections,
      width: 150,
    });
  }
 
  columns.push({
  title: t("global.actions", "Action"),
  dataIndex: "action",
  key: "action",
  align: "center",
  width: 100,
  fixed: "right",
});

const tableData = (vehiclesData?.items ?? []).map((item: ListVehicleFleetRequestDto) => {
  const { id, ordinalNumber, status,comments, statusText, createdAt,name,updatedAt,totalVehicle,actionedAt} = item;
  return {
    key: id,
    name,
    ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
    createdAt: formatDate(createdAt),
    comments:comments,
    updatedAt:formatDate(updatedAt),
    totalVehicle,
    actionedAt:formatDate(actionedAt),
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
      {hasPermission("carrier-vehical-fleet-request:view-details") && status !== 2 && (
        <Tooltip title={t("global.view", "View")}>
          <Button
            className="btn-icon"
            type="info"
            shape="circle"
          >
            <Link to={`/vehicle-fleet/${id}`}>
            <FeatherIcon icon="eye" size={25} />
            </Link>
          </Button>
        </Tooltip> )}
      {/* Edit Button */}
      {hasPermission("carrier-vehical-fleet-request:edit")  && status === 2 && (
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
        title={
             isListingActiveVehicleFleet
              ?  t("active-vehicle-fleet.title", "Active Vehicle Fleets") 
            : t("vehicle-fleet-request.title", "Vehicle Fleet Requests")
        }
        subTitle={
          <>
            {vehiclesData?.totalCount}{" "}
            {t("dashboard:total-vehicle-fleet", "Total Vehicle Fleet")}
          </>
        }
        buttons={[
          <ExportButtonPageApiHeader
            key="1"
            callFrom={isListingVehicleFleetReuqests ? "VehicleFleetRequests":"ActiveVehicleFleets"}
            filterType={query.status}
            listArchived={query.listArchived}
            municipalityId={""}
            entityId={""}
            search={query.search}
            typeOfEquipmentId={""}
            from={""}
            to={""}
          />,
        ]}

      />
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                {isListingVehicleFleetReuqests && (
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                    {[...new Set(filterKeys)].map((item) => (
                        <li
                          key={item.id}
                          className={
                            query?.status === item.id
                              ? "active"
                              : "deactivate"
                          }
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
                )}
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
        {/* </CardToolbox> */}

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
