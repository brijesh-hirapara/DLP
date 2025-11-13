import { Col, Row, Table } from "antd";
import {
  RequestsApi,
} from "api/api";
import { UserFilterType } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  Main,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { useTableSorting } from "hooks/useTableSorting";
import { ProjectHeader, ProjectSorting } from "pages/localization/email/style";
import { sortDirections } from "constants/constants";
import { ColumnsType } from "antd/es/table";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";
import moment from "moment";
import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";
import { hasPermission } from "utility/accessibility/hasPermission";
import startConnection from "pages/requests/RequestSignalRService";
import { HubConnection } from "@microsoft/signalr";

const requestsApi = new RequestsApi();

const intialData = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageIndex: 1,
  totalCount: 0,
  totalPages: 0,
};

export const ManageTransportRequestsPage = () => {
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();
  const [requestsData, setRequestsData] =
    useState<ListTransportManagementDtoPaginatedList>(intialData);
  const { onSorterChange, sorting } = useTableSorting();
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const filterKeys = [
    { id: UserFilterType.ALL, name: t("requests:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("requests:select.active", "Active") },
    {
      id: UserFilterType.PENDING,
      name: t("requests:select.under-evaluation", "Under Evaluation"),
    },
    {
      id: UserFilterType.DISABLED,
      name: t("requests:select.completed", "Completed"),
    },
    { id: UserFilterType.DELETED, name: t("requests:select.canceled", "Canceled") },
  ];

  const [request, setRequest] = useState<{
    status: any;
    search: string;
    pageNumber: number;
    pageSize: number;
  }>({
    status: UserFilterType.ALL,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  // When request.filterType changes, fetch data
  useEffect(() => {
    fetchRequests();
  }, [request, sorting]);

   // Signal R code Start

   useEffect(() => {
    initializeSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const initializeSignalR = async () => {
    const connection: any = await startConnection(onReceiveBid);
    setConnection(connection);
  };

  const onReceiveBid = async (id: any, price: any) => {
    // Handle the received bid data
    await fetchRequests();
  };

  // Signal R code End

  const getRequestStatus = (status: any, record: any, item: any) => {
    const normalized = status?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, "") || "";

    const isActive = normalized.includes("active") || normalized.includes("inshipment");
    const isCompleted = normalized.includes("completed");
    const isUnderEvaluation = normalized.includes("underevaluation");
    const isCanceled = normalized.includes("cancel");
    const isForYourAction = item.isForYourAction;

    const color = isActive
      ? "#1890ff" // blue
      : isCompleted
        ? "#52c41a" // green
        : isUnderEvaluation
          ? "#fa8c16" // orange
          : isCanceled
            ? "#f5222d" // red
            : "#d9d9d9"; // grey

    return (
      <>
        <span
          className={`ant-tag ${color}`}
          style={{
            backgroundColor: color,
            color: "white",
            border: "none"
          }}
        >
          {status}
        </span>
        {(isActive) && (
          <span style={{ color: color }}>{<CountdownTimer startTime={record} duration={24} />}</span>
        )}
        {(isUnderEvaluation) && (
          <span style={{ color: color }}>{<CountdownTimer startTime={record} duration={48} />}</span>
        )}
        {(isForYourAction && isUnderEvaluation) && (
          <span
            style={{
              fontSize: 11,
              marginLeft: 8,
              color: "#2d2d2d"
            }}
          >
            ({t("manage-transport-request:for-your-action", "For Your Action")})
          </span>
        )}
      </>
    );
  };

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setRequest({ ...request, pageNumber: 1, search: value });
    }, 300);
  };

  const onPaginationChange = (pageNumber: number) => {
    setRequest((prevRequest) => ({ ...prevRequest, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevRequest) => ({ ...prevRequest, pageNumber, pageSize }));
  };

  const fetchRequests = async () => {
    try {

      setRequestsLoading(true);
      const response = await requestsApi.apiTransportManagementAdminListGet({ ...request, ...sorting });

      setRequestsData(response.data);
    } catch (err) {
    } finally {
      setRequestsLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: t("requests:table.title.request-id", "Request ID"),
      dataIndex: "requestId",
      key: "requestId",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("global.purchaser-name", "Purchaser Name"),
      dataIndex: "shipperName",
      key: "shipperName",
    },
    {
      title: t(
        "manage-transport-requests:table.title.estimated-pickup",
        "Estimated Pick-Up"
      ),
      dataIndex: "posiblePickup",
      key: "posiblePickup",
      sorter: true,
      sortDirections: sortDirections,
      render: (text) => (
        <>
          {text.split("\n").map((line: any, index: any) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </>
      ),
    },
    {
      title: t("manage-transport-requests:table.title.delivery", "Delivery"),
      dataIndex: "requestedDelivery",
      key: "requestedDelivery",
      sorter: true,
      sortDirections: sortDirections,
      render: (text) => (
        <>
          {text.split("\n").map((line: any, index: any) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </>
      ),
    },

    {
      title: t("requests:table.title.total-distance", "Total Distance"),
      dataIndex: "totalDistance",
      key: "totalDistance",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.goods", "Goods"),
      dataIndex: "goods",
      key: "goods",
      render: (text) => (
        <>
          {text.split("\n").map((line: any, index: any) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </>
      ),
    },
    {
      title: t("requests:table.title.status", "Status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t(
        "manage-transport-requests:table.title.invited-carriers",
        "Invited Carriers"
      ),
      dataIndex: "carrierCount",
      key: "carrierCount",
      render: (count: number, record: any) => {
        const canNavigate = hasPermission("invited-carriers:list");

        return canNavigate ? (
          <Link
            to={`/manage-transport-requests/invited-carriers/${record.transportRequestId}`}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {count}
          </Link>
        ) : (
          <span>{count}</span>
        );
      }
    },
    {
      title: t("requests:table.title.offers", "Offers"),
      dataIndex: "adminOfferCount",
      key: "adminOfferCount",
      sorter: true,
      sortDirections: sortDirections,
      render: (count: number, record: any) => {
        if (!count) {
          //  If value is null, undefined, or 0 → show plain text
          return <span style={{ color: "#999" }}>{count ?? 0}</span>;
        }

        //  When count > 0 → show clickable link
        return (
          <Link
            to={`/manage-transport-requests/manage-transport-offers/${record.transportRequestId}`}
            style={{
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {count}
          </Link>
        );
      },
    },
    {
      title: t("global.actions", "Actions"),
      key: "actions",
      dataIndex: "action",
      fixed: "right",
      width: 120,
    },
  ];

  const tableData = (requestsData?.items ?? []).map(item => {
    const pickupInfo = item.transportInformation?.[0] || {};
    const goods = item.transportGoods?.[0] || {};
    const pickup = item.transportPickup?.[0] || {};
    const delivery = item.transportDelivery?.[0] || {};

    const estimatedPickup =
      pickupInfo.pickupDateFrom && pickupInfo.pickupDateTo
        ? `${moment(pickupInfo.pickupDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.pickupDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.pickupTimeFrom || pickupInfo.pickupTimeTo
          ? `${moment(pickupInfo.pickupTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.pickupTimeTo).format("HH:mm") || ''}\n`
          : '') +
        `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`
        : `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`;

    const estimatedDelivery =
      pickupInfo.deliveryDateFrom && pickupInfo.deliveryDateTo
        ? `${moment(pickupInfo.deliveryDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.deliveryDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.deliveryTimeFrom || pickupInfo.deliveryTimeTo
          ? `${moment(pickupInfo.deliveryTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.deliveryTimeTo).format("HH:mm") || ''}\n`
          : '') +
        `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`
        : `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`;
    const length = (goods.length || 0);
    const width = (goods.width || 0);
    const height = (goods.height || 0);

    const ldmValue = length && width && height ? (length * width * height) : 0;

    const sideLength = Math.cbrt(ldmValue);

    const sideText = ` ${sideLength.toFixed(2)} m`;


    const goodsStr = `LDM ${sideText || 0} \nWeight ${goods.weight || 0} kg`;

    return {
      key: item.id,
      transportRequestId: item.id,
      requestId: item.requestId,
      shipperName: item.shipperName || "",
      posiblePickup: estimatedPickup,
      requestedDelivery: estimatedDelivery,
      totalDistance: item.totalDistance ? `${item.totalDistance} km` : '',
      goods: goodsStr,
      status: getRequestStatus(item.statusDesc || "", item.createdAt, item),
      lowestPrice: item.transportCarrier?.[0]?.price || "-",
      carrierCount: item.carrierCount,
      adminOfferCount: item.adminOfferCount,
      action: (
        <div
          className="table-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {(item.isForYourAction && item.statusDesc === "UnderEvaluation") && (
            <>
              <Button className="btn-icon" type="primary" to="#" shape="circle">
                <Link to={`/manage-transport-requests/manage-transport-offers/${item.id}`}>
                  {t("manage-transport-request:view-evaluation", "View Evaluation")}
                </Link>
              </Button>
            </>
          )}
          <Button className="btn-icon" type="primary" to="#" shape="circle">
            <Link to={`/manage-transport-requests/${item.id}`}>
              {t("archived-requests:details", "Details")}
            </Link>
          </Button>
        </div>
      ),
    };
  });

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t(
            "manage-transport-requests.title",
            "Manage Transport Requests"
          )}
          subTitle={
            <>
              {requestsData?.totalCount}{" "}
              {t(
                "manage-transport-requests:total-transport-requests",
                "Total Transport Requests"
              )}
            </>
          }
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"ManageTransportRequests"}
              filterType={request?.status}
              municipalityId={""}
              entityId={""}
              search={request.search}
              from={""}
              to={""}
              typeOfEquipmentId={""}
            />,
          ]}
        />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                      {filterKeys.map((item) => (
                        <li
                          key={item.id}
                          className={
                            request?.status === item.id ? "active" : 'deactivate'
                          }
                        >
                          <Link
                            to="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setRequest({
                                ...request,
                                status: item.id,
                                pageNumber: 1,
                                pageSize: 10,
                              });
                            }}
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
          </Col>
        </Row>

        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                {/* <UserTableStyleWrapper> */}
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={requestsLoading}
                      dataSource={tableData}
                      columns={columns}
                      showSorterTooltip={false}
                      rowKey="key"
                      pagination={{
                        pageSize: request.pageSize,
                        current: requestsData.pageIndex,
                        total: requestsData.totalCount,
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
