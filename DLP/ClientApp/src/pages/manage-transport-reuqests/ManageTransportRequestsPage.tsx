import { Col, Row, Table } from "antd";
import {
  OrganizationsApi,
  OrganizationsApiApiOrganizationsGetRequest,
  RequestsApi,
} from "api/api";
import { OrganizationDto, UserFilterType } from "api/models";
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
import { ProjectHeader, ProjectSorting, ProjectToolbarWrapper } from "pages/localization/email/style";
import { sortDirections } from "constants/constants";
import { ColumnsType } from "antd/es/table";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";
import moment from "moment";

const requestsApi = new RequestsApi();

interface ExtendedQuery extends OrganizationsApiApiOrganizationsGetRequest {
  filterType?: number;
}

const organizationsApi = new OrganizationsApi();

const intialData = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageIndex: 1,
  totalCount: 0,
  totalPages: 0,
};

type ModalStateType = {
  addModalVisible: boolean;
  editModalVisible: boolean;
  institutionToEdit: OrganizationDto | null;
};

const getRequestStatus = (status: string, record: any) => {
  let color = "deactivate";
  const normalized = status?.toLowerCase?.() || "";

  if (normalized === "active") {
    color = "active";
  } else if (normalized === "in shipment") {
    color = "active";
  } else if (normalized === "completed") {
    color = "completed";
  } else if (normalized === "under evaluation") {
    color = "deactivate";
  } else if (normalized === "canceled") {
    color = "blocked";
  }

  // Helper for rendering bracketed info
  const sublabel = record.timerBadge
    ? (
      <span
        style={{
          fontSize: 11,
          marginLeft: 8,
          color:
            normalized === "active"
              ? " #2374ab" // blue for timer
              : (normalized === "under evaluation" && record.timerBadge.toLowerCase().includes("for your action"))
                ? " #2d2d2d" // black for 'for your action'
                : " #333",
        }}
      >
        ({record.timerBadge})
      </span>
    )
    : null;

  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span className={`ant-tag ${color}`}>{status}</span>
      {sublabel}
    </span>
  );
};



export const ManageTransportRequestsPage = () => {
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();
  const [requestsData, setRequestsData] =
    useState<ListTransportManagementDtoPaginatedList>(intialData);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  const { sorting, onSorterChange } = useTableSorting();
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalStateType>({
    addModalVisible: false,
    editModalVisible: false,
    institutionToEdit: null,
  });

  // const filterKeys = [
  //   { id: "ALL", name: t("global.all", "All") },
  //   { id: "ACTIVE", name: t("manage-transport-requests.active", "Active") },
  //   { id: "UNDEREVALUATIONS", name: t("manage-transport-requests.under-evaluation", "Under Evaluation") },
  //   { id: "INSHIPMENT", name: t("manage-transport-requests.in-shipment", "In Shipment") },
  //   { id: "CANCELED", name: t("manage-transport-requests.canceled", "Canceled") },
  // ];

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

  // const [request, setRequest] = useState({
  //   filterType: filterKeys,
  //   search: "",
  //   pageNumber: 1,
  //   pageSize: 10,
  // });

  const [request, setRequest] = useState<{
  status : any;   
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
}, [request]);


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
      const response = await requestsApi.apiTransportManagementAdminListGet(request);

      setRequestsData(response.data);
    } catch (err) {
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleCreateInstitutionClick = () => {
    setModalState((prev) => ({
      ...prev,
      addModalVisible: true,
      editModalVisible: false,
    }));
  };

  const onChangeQuery = (Request: OrganizationsApiApiOrganizationsGetRequest) => {
    setRequest((prevRequest) => ({ ...prevRequest, ...request }));
  };

  const onFilterChange = (e: any) => {
    setRequest({
      ...request,
      status: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const handleManageOffers = (record: any) => {
    // TODO: Open modal, fetch offer data, etc.
    console.log("Manage Offers clicked for", record);
  };

  const handleManageCarriers = (record: any) => {
    // TODO: Open carrier management modal
    console.log("Manage Invited Carriers clicked for", record);
  };

  const handleViewEvaluation = (record: any) => {
    // TODO: Open evaluation modal
    console.log("View Evaluation clicked for", record);
  };

  const handleShowDetails = (record: any) => {
    // TODO: Open details modal or drawer
    console.log("Details clicked for", record);
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
      title: t("global.shipperName", "Shipper Name"),
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
      title: t("requests:table.title.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: false,
      // render: (status: string, record: any) => getRequestStatus(status, record),
      sortDirections: sortDirections,
    },
    {
      title: t(
        "manage-transport-requests:table.title.invited-carriers",
        "Invited Carriers"
      ),
      dataIndex: "carrierCount",
      key: "carrierCount",
      sorter: true,
      sortDirections: sortDirections,
      render: (count: number, record: any) => (
        <Link
          to={`/manage-transport-requests/invited-carriers/${record.transportRequestId}`}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {count}
        </Link>
      ),
    },
    {
      title: t("requests:table.title.offers", "Offers"),
      dataIndex: "adminOfferCount",
      key: "adminOfferCount",
      sorter: true,
      sortDirections: sortDirections,
      render: (count: number,record: any) => {
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
      render: (text: any, record: any) => {
        return (
          <div
            className="table-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            {record.status === "Under Evaluation" && (
              <>
                <Button
                  className="btn-icon"
                  type="primary"
                  to="#"
                  shape="circle"
                  onClick={() => handleViewEvaluation(record)}
                >
                  View Evaluation
                </Button>
              </>
            )}
            <Button className="btn-icon" type="primary" to="#" shape="circle">
              <Link to={`/requests/${record.key}`}>
                {t("archived-requests:details", "Details")}
              </Link>
            </Button>
          </div>
        );
      },
      fixed: "right",
      width: 120,
    },
  ];

  const tableData = (requestsData?.items ?? []).map(item => {
    const pickupInfo = item.transportInformation?.[0] || {};
    const goods = item.transportGoods?.[0] || {};
    const pickup = item.transportPickup?.[0] || {};
    const delivery = item.transportDelivery?.[0] || {};
    const deliveryInfo = pickupInfo;

    const estimatedPickup =
      pickupInfo.pickupDateFrom && pickupInfo.pickupDateTo
        ? `${moment(pickupInfo.pickupDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.pickupDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.pickupTimeFrom || pickupInfo.pickupTimeTo
          ? `${pickupInfo.pickupTimeFrom || ''} - ${pickupInfo.pickupTimeTo || ''}\n`
          : '') +
        `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`
        : "N/A";

    const estimatedDelivery =
      pickupInfo.deliveryDateFrom && pickupInfo.deliveryDateTo
        ? `${moment(pickupInfo.deliveryDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.deliveryDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.deliveryTimeFrom || pickupInfo.deliveryTimeTo
          ? `${pickupInfo.deliveryTimeFrom || ''} - ${pickupInfo.deliveryTimeTo || ''}\n`
          : '') +
        `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`
        : "N/A";
    const length = (goods.length || 0);
    const width = (goods.width || 0);
    const height = (goods.height || 0);

    const ldmValue = length && width && height ? (length * width * height) : 0;

    const sideLength = Math.cbrt(ldmValue);

    const ldmText = ` ${ldmValue.toFixed(2)} m³`;
    const sideText = ` ${sideLength.toFixed(2)} m`; // Cube root as string with two decimals


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
    status: getRequestStatus(item.statusDesc || "",""),
    lowestPrice: item.transportCarrier?.[0]?.price || "-",
    carrierCount:item.carrierCount,
    adminOfferCount:item.adminOfferCount,
    action: (
      <div
        key={item.id}
        className="table-actions"
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {/* {status === 1 && (
          <>
            <Button type="primary" onClick={() => handleManageOffers(item)}>
              {t("manage-transport-requests.manage-offers", "Manage Offers")}
            </Button>
            <Button onClick={() => handleManageCarriers(item)}>
              {t("manage-transport-requests.manage-invited-carriers", "Manage Invited Carriers")}
            </Button>
          </>
        )}

        {status === 2 && (
          <>
            <Button type="primary" onClick={() => handleViewEvaluation(item)}>
              {t("manage-transport-requests.view-evalution", "View Evalution")}
            </Button>

            <Button className="btn-icon" type="primary" to="#" shape="circle">
              <Link to={`/requests/${id}`}>
                {t("manage-transport-requests.details", "Details")}
              </Link>
            </Button>
          </>
        )} */}
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
              callFrom={"TransportRequests"}
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
                      loading={institutionsLoading}
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
