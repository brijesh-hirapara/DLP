import {
  Col,
  Input,
  Row,
  Table,
  Button,
  Tooltip,
  Radio,
  DatePicker,
  Typography,
  Modal,
} from "antd";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuthorization } from "hooks/useAuthorization";
import {
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { UserTableStyleWrapper } from "../style";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { ProjectSorting } from "pages/localization/email/style";
import { Link, useNavigate } from "react-router-dom";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { TransportRequestStatus, UserFilterType, VehicleFleetRequestStatus } from "api/models";
import { OfferCard } from "./OfferCard";
import moment from "moment";
import { RequestsApi } from "api/api";
import openNotificationWithIcon from "utility/notification";
import { sortDirections } from "constants/constants";
import { useTableSorting } from "hooks/useTableSorting";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";

const requestsApi = new RequestsApi();

const ArchivedRequestsPage = (data: any) => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOfferData, setSelectedOfferData] = useState<any>(null);
  const [archivedRows, setArchivedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  //  const { onSorterChange, sorting } = useTableSorting();
   const navigate = useNavigate();

  
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

  const getRequestStatus = (request: TransportRequestStatus, statusDesc: string) => {
    let color = "deactivate";
  
    if (request === TransportRequestStatus.PENDING) {
      color = "deactivate";
    } else if (request === TransportRequestStatus.REJECTED) {
      color = "blocked";
    } else if (request === TransportRequestStatus.ACCEPTED) {
      color = "active";
  } 
  // else if (request === TransportRequestStatus.OUTDATED) {
  //   color = "not-confirm";
  // }
  
    return <span className={`ant-tag ${color}`}>{statusDesc}</span>;
  };
  

  const filterItems = [
  { id: TransportRequestStatus.ALL, name: t("transport-requests-archived.all", "All") },
  { id: TransportRequestStatus.ACCEPTED, name: t("transport-requests-archived.accepted", "Accepted") },
  { id: TransportRequestStatus.PENDING, name: t("transport-requests-archived.pending", "Pending") },
  { id: TransportRequestStatus.REJECTED, name: t("transport-requests-archived.rejected", "Rejected") },
].filter(Boolean);


  const [query, setQuery] = useState<{
  search: string;
  pageNumber: number;
  pageSize: number;
  pickupDate: string;
  deliveryDate: string;
  pickupPostalCode: string;
  deliveryPostalCode: string;
  status: TransportRequestStatus; 
  listArchived: boolean;
  sortingPropertyName?: string;
  sortingIsDescending?: boolean;
  pickupDateRange: [moment.Moment] | null;
  deliveryDateRange: [moment.Moment] | null;
}>({
  search: "",
  pageNumber: 1,
  pageSize: 10,
  pickupDate: "",
  deliveryDate: "",
  pickupPostalCode: "",
  deliveryPostalCode: "",
  status: TransportRequestStatus.ALL,
  listArchived: true,
  sortingPropertyName: undefined,
  sortingIsDescending: undefined,
  pickupDateRange: null,
  deliveryDateRange: null,
});

  const onEyeButtonClick = async (item:any) => {
        if (item.status === TransportRequestStatus.PENDING) {
      // Redirect to Submit Offer page if status is PENDING
      navigate("/active-requests"); 
      return;
    }
  setModalLoading(true);
  try {
    const detailRes = await requestsApi.apiTransportManagementIdGet({ transportRequestId: item.key });
    setSelectedOfferData(detailRes.data);  
  } catch (e) {
    // openNotificationWithIcon("error", "Failed to load details. Please try again.");
      openNotificationWithIcon(
        "error",
        t("archived-requests:failed-error-message", "Failed to load details. Please try again.")
      );
    setSelectedOfferData(null);
  }
  setModalLoading(false);
  setIsModalVisible(true);
};

  const transformArchivedRows = (items: any[]) =>
  items.map((item) => {
    const pickupInfo = item.transportInformation?.[0] || {};
    const pickup = item.transportPickup?.[0] || {};
    const delivery = item.transportDelivery?.[0] || {};
    const goods = item.transportGoods?.[0] || {};
    const carrier = item.transportCarrier?.[0] || {};
    const info = item.transportInformation?.[0] || {};

    const possiblePickup =        
      pickupInfo.pickupDateFrom && pickupInfo.pickupDateTo
        ? `${moment(pickupInfo.pickupDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.pickupDateTo).format("DD.MM.YYYY")}\n` +
          (pickupInfo.pickupTimeFrom || pickupInfo.pickupTimeTo
            ? `${moment(pickupInfo.pickupTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.pickupTimeTo).format("HH:mm") || ''}\n`
            : '') +
          `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`
        : `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`;

    const requestedDelivery =
        pickupInfo.deliveryDateFrom && pickupInfo.deliveryDateTo
          ? `${moment(pickupInfo.deliveryDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.deliveryDateTo).format("DD.MM.YYYY")}\n` +
            (pickupInfo.deliveryTimeFrom || pickupInfo.deliveryTimeTo
              ? `${moment(pickupInfo.deliveryTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.deliveryTimeTo).format("HH:mm") || ''}\n`
              : '') +
            `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`
          : `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`;
    const cargoStr = `Qty: ${goods.quantity || ""}, L:${goods.length || 0} W:${goods.width || 0} H:${goods.height || 0} Kg:${goods.weight || 0}`;

    let status: typeof TransportRequestStatus[keyof typeof TransportRequestStatus] = TransportRequestStatus.PENDING;
    const carrierStatusNum = Number(carrier.status);
    if (carrierStatusNum === TransportRequestStatus.ACCEPTED) status = TransportRequestStatus.ACCEPTED;
    else if (carrierStatusNum === TransportRequestStatus.REJECTED) status = TransportRequestStatus.REJECTED;
    else if (carrierStatusNum === TransportRequestStatus.PENDING) status = TransportRequestStatus.PENDING;

    return {
      key: item.id,
      requestId: item.requestId,
      createdAt: item.createdAt ? moment(item.createdAt).format("DD.MM.YYYY") : "",
      comments: item.comments || "",
      possiblePickup,
      requestedDelivery,
      cargo: cargoStr,
      myPrice: carrier.price != null ? carrier.price : "",
      status,
      statusDesc: carrier.statusDesc || "",
      offerExpired: false,
      raw: item,
    };
  });

  const fetchArchivedRows = async () => {
  setLoading(true);
  try {
    const params = {
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      search: query.search,
      pickupDate: query.pickupDateRange && query.pickupDateRange[0]
        ? query.pickupDateRange[0].format("YYYY-MM-DD")
        : "",
      deliveryDate: query.deliveryDateRange && query.deliveryDateRange[0]
        ? query.deliveryDateRange[0].format("YYYY-MM-DD")
        : "",
      pickupPostalCode: query.pickupPostalCode || "",
      deliveryPostalCode: query.deliveryPostalCode || "",
      type: query.status, 
      listArchived: true,
      sortingPropertyName: query.sortingPropertyName,
      sortingIsDescending: query.sortingIsDescending,
    };
    
    
    const res = await requestsApi.apiTransportManagementCarrierListGet(params);
    const transformed = transformArchivedRows(res.data.items || []);
    setArchivedRows(transformed);
    setTotalCount(res.data.totalCount || 0);
  } catch (e) {
    console.error("Fetch error:", e); 
    setArchivedRows([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchArchivedRows();
  }, [
    query.pageNumber,
    query.pageSize,
    query.search,
    query.pickupDateRange,
    query.deliveryDateRange,
    query.pickupPostalCode,
    query.deliveryPostalCode,
    query.status,
    query.sortingPropertyName, 
    query.sortingIsDescending
  ]);

  const matchesSearch = (item: any, search: string) => {
  if (!search) return true;
  const normalized = search.toLowerCase();

  return (
    item.id.toString().toLowerCase().includes(normalized) ||
    item.possiblePickup.toLowerCase().includes(normalized) ||
    item.requestedDelivery.toLowerCase().includes(normalized) ||
    item.cargo.toLowerCase().includes(normalized) ||
    (item.myPrice !== undefined && item.myPrice.toString().toLowerCase().includes(normalized)) ||
    (item.status !== undefined && item.status.toString().toLowerCase().includes(normalized))
  );
};

  const columns = [
    {
      title: t("requests.requestId", "Request Id"),
      dataIndex: "requestId",
      key: "requestId",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests.possiblePickup", "Possible Pickup"),
      dataIndex: "possiblePickup",
      key: "possiblePickup",
      render: (val: string) => (
        <div style={{ whiteSpace: "pre-line" }}>{val}</div>
      ),
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests.requestedDelivery", "Requested Delivery"),
      dataIndex: "requestedDelivery",
      key: "requestedDelivery",
      render: (val: string) => (
        <div style={{ whiteSpace: "pre-line" }}>{val}</div>
      ),
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests.cargo", "Cargo"),
      dataIndex: "cargo",
      key: "cargo",
      // sorter: true,
      // sortDirections: sortDirections,
    },
    {
      title: t("requests.myPrice", "My Price"),
      dataIndex: "myPrice",
      key: "myPrice",
      // sorter: true,
      // sortDirections: sortDirections,
    },
    {
  title: t("requests.status", "Status"),
  dataIndex: "status",
  key: "status",
  align: "center" as "center",
  // sorter: true,
  // sortDirections: sortDirections,
   render: (status: any, record: any) => (
    <>
      {getRequestStatus(status, record.statusDesc)}
      {record.isExpired && (
        <Tooltip title={t("offerCard.expiredTooltip", "Offer expired before evaluation")}>
          <FeatherIcon icon="alert-circle" color="red" size={16} style={{ marginLeft: 8 }} />
        </Tooltip>
      )}
    </>
  ),
},
    {
      title: t("requests.actions", "Actions"),
      key: "actions",
      render: (_: any, row: any) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tooltip title={t("global.view", "View")}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: 8,
              }}
              onClick={() => onEyeButtonClick(row)}
            >
              <FeatherIcon icon="eye" size={16} color="#C0C6DD" />
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  
const handleTableChange = (pagination: any, filters: any, sorter: any) => {
  // Update page number and page size from pagination
  setQuery((prev) => ({
    ...prev,
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    // Update sorting info only if valid sorter is present
    sortingPropertyName: !Array.isArray(sorter) && sorter.field ? sorter.field : prev.sortingPropertyName,
    sortingIsDescending: !Array.isArray(sorter) && sorter.order === "descend",
  }));
};


// const onSearchChange = (value: any) => {
//   setQuery({
//     ...query,
//     search: value,
//     pageNumber: 1,
//   });
// };

const onSearchChange = useCallback((value: any) => {
  setQuery((prev) => ({
    ...prev,
    search: value,
    pageNumber: 1,
  }));
}, []); 



  const onPaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

    const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };


const goodsArray = selectedOfferData?.transportGoods?.[0];
const carriersArray = selectedOfferData?.transportCarrier?.[0];

const length = goodsArray?.length ?? 0;
const width = goodsArray?.width ?? 0;
const height = goodsArray?.height ?? 0;

const ldmValue = length && width && height ? (length * width * height).toFixed(2) : "0";
  const { RangePicker } = DatePicker;

const getAccessibilityDescription = (accessibility: number | undefined) => {
  switch (accessibility) {
    case 1:
      return "Commercial with ramp but with lift";
    case 2:
      return "Commercial without ramp but with forklift";
    case 3:
      return "Commercial without forklift or ramp";
    default:
      return "No Access Info";
  }
};


  return (
    <>
      <PageHeader
        ghost
        title={t("requests.archivedRequests", "Archived Requests")}
        subTitle={
          <>
            {totalCount}{" "}
            {t("archived-requests:total-archived-requests", "Total Archived Requests")}
          </>
        }
        buttons={[
          <ExportButtonPageApiHeader
            key="1"
            callFrom={"ArchivedRequests"}
            filterType={0}
            municipalityId={""}
            entityId={""}
            search={query.search}
            typeOfEquipmentId={""}
            from={query.pickupDateRange ? query.pickupDateRange[0].format("YYYY-MM-DD") : ""}
            to={query.deliveryDateRange ? query.deliveryDateRange[0].format("YYYY-MM-DD") : ""}

          />,
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
                      {filterItems.map((item) => (
                        <li
                          key={item.id}
                          className={
                            query.status === item.id ? "active" : "deactivate"
                          }
                        >
                          <Link
                            to="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuery((prev) => ({
                                ...prev,
                                status: item.id,
                                pageNumber: 1,
                                pageSize: 10,
                              }));
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
                    patterns
                    placeholder={t(
                      "global.auto-complete-placeholder",
                      "Search..."
                    )}
                  />
                </div>
              </div>
            </ProjectSorting>
            <Cards headless>
              <Row gutter={[15, 0]} justify="center" align="middle">
                <Col flex="70px">
                  <Typography.Text strong>
                    {t("requests.filters", "Filters :")}
                  </Typography.Text>
                </Col>
                <Col flex="1 1 0">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    placeholder={t("requests.pickupDate", "Pickup Date")}
                    onChange={(date) =>
                      setQuery((prev) => ({
                        ...prev,
                        pickupDateRange: date ? [date] : null,
                        pageNumber: 1,
                      }))
                    }
                  />
                  {/* <RangePicker
                    format="DD.MM.YYYY"
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      setQuery((prev) => ({
                        ...prev,
                        pickupDate: date,
                        pageNumber: 1,
                      }))
                    }
                  /> */}
                </Col>
                <Col flex="1 1 0">
                  <Input
                    style={{ width: "100%" }}
                    placeholder={t(
                      "requests.pickupPostalCode",
                      "Pickup Postal Code"
                    )}
                    onChange={(e) =>
                      setQuery((prev) => ({
                        ...prev,
                        pickupPostalCode: e.target.value,
                        pageNumber: 1,
                      }))
                    }
                    allowClear
                  />
                </Col>
                <Col flex="1 1 0">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD.MM.YYYY"
                    placeholder={t("requests.delivery-Date", "Delivery Date")}
                    onChange={(date) =>
                      setQuery((prev) => ({
                        ...prev,
                        deliveryDateRange: date ? [date] : null,
                        pageNumber: 1,
                      }))
                    }
                  />
                  {/* <RangePicker
                    format="DD.MM.YYYY"
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      setQuery((prev) => ({
                        ...prev,
                        deliveryDate: date,
                        pageNumber: 1,
                      }))
                    }
                  /> */}
                </Col>
                <Col flex="1 1 0">
                  <Input
                    style={{ width: "100%" }}
                    placeholder={t(
                      "requests.delivery-PostalCode",
                      "Delivery Postal Code"
                    )}
                    onChange={(e) =>
                      setQuery((prev) => ({
                        ...prev,
                        deliveryPostalCode: e.target.value,
                        pageNumber: 1,
                      }))
                    }
                    allowClear
                  />
                </Col>
              </Row>
            </Cards>
          </Col>
        </Row>
        <Row gutter={15}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={loading}
                      dataSource={archivedRows}
                      columns={columns}
                      showSorterTooltip={true}
                      rowKey="key"
                      // pagination={{
                      //   total: totalCount,
                      //   current: query.pageNumber,
                      //   pageSize: query.pageSize,
                      //   showSizeChanger: true,
                      //   pageSizeOptions: ["10", "50", "100"],

                      //   onChange: onPaginationChange,
                      //   onShowSizeChange: onShowSizeChange,
                      //   showTotal: (total, range) =>
                      //     `${range[0]}-${range[1]} of ${total} items`,
                      // }}
                      pagination={{
                        total: totalCount,
                        current: query.pageNumber,
                        pageSize: query.pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "50", "100"],
                        onChange: onPaginationChange,
                        onShowSizeChange: onShowSizeChange,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      // onChange={(_, __, sorter) => onSorterChange(sorter)}
                      onChange={handleTableChange}
                    />
                  </TableWrapper>
                </div>
              </ProfileTableStyleWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
      <Modal
        className="offer-modal"
        title={t("Offer Details", "Offer Details")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOfferData && (
          <OfferCard
            trailertypeOptions={[]}
            isViewOnly={true}
            showDeadline={false}
            ordinalNumber={selectedOfferData.requestId}
            routeInfo={{
              pickup: selectedOfferData.transportPickup?.[0]
                ? `${selectedOfferData.transportPickup[0].city}, ${selectedOfferData.transportPickup[0].postalCode}, ${selectedOfferData.transportPickup[0].countryName}`
                : "N/A",
              delivery: selectedOfferData.transportDelivery?.[0]
                ? `${selectedOfferData.transportDelivery[0].city}, ${selectedOfferData.transportDelivery[0].postalCode}, ${selectedOfferData.transportDelivery[0].countryName}`
                : "N/A",
              distance: selectedOfferData.totalDistance?.toString() || "0",
              // access:
              //   selectedOfferData.accessibility === 0
              //     ? "No Access Info"
              //     : "Has Access",
              access: getAccessibilityDescription(
                selectedOfferData.accessibility
              ),
            }}
            goodsInfo={{
              type:
                selectedOfferData.transportGoods?.[0]?.typeOfGoodsName || "N/A",
              quantity:
                selectedOfferData.transportGoods?.[0]?.quantity?.toString() ||
                "N/A",
              dims: selectedOfferData.transportGoods?.[0]
                ? `Length: ${selectedOfferData.transportGoods[0].length} Width: ${selectedOfferData.transportGoods[0].width} Height: ${selectedOfferData.transportGoods[0].height} Weight: ${selectedOfferData.transportGoods[0].weight ?? 0}kg`
                : "N/A",
              ldm: `${ldmValue} m³`,
              special: [
                selectedOfferData.transportGoods?.[0]?.isIncludesAdrGoods
                  ? "ADR Included"
                  : "",
                selectedOfferData.transportGoods?.[0]?.isCargoNotStackable
                  ? "Cargo items are not stackable"
                  : "",
              ]
                .filter(Boolean)
                .join(", "),
            }}
            additionalInfo={{
              pickupRange: selectedOfferData.transportInformation?.[0]
                ?.pickupDateFrom
                ? moment(
                    selectedOfferData.transportInformation[0].pickupDateFrom
                  ).format("DD.MM.YYYY") +
                  (selectedOfferData.transportInformation[0].pickupDateTo
                    ? " - " +
                      moment(
                        selectedOfferData.transportInformation[0].pickupDateTo
                      ).format("DD.MM.YYYY")
                    : "") +
                  (selectedOfferData.transportInformation[0].pickupTimeFrom ||
                  selectedOfferData.transportInformation[0].pickupTimeTo
                    ? "," +
                      (selectedOfferData.transportInformation[0].pickupTimeFrom
                        ? moment(
                            selectedOfferData.transportInformation[0]
                              .pickupTimeFrom,
                            "HH:mm"
                          ).format("HH:mm")
                        : "") +
                      (selectedOfferData.transportInformation[0].pickupTimeTo
                        ? " - " +
                          moment(
                            selectedOfferData.transportInformation[0]
                              .pickupTimeTo,
                            "HH:mm"
                          ).format("HH:mm")
                        : "")
                    : "")
                : "N/A",
              deliveryRange: selectedOfferData.transportInformation?.[0]
                ?.deliveryDateFrom
                ? moment(
                    selectedOfferData.transportInformation[0].deliveryDateFrom
                  ).format("DD.MM.YYYY") +
                  (selectedOfferData.transportInformation[0].deliveryDateTo
                    ? " - " +
                      moment(
                        selectedOfferData.transportInformation[0].deliveryDateTo
                      ).format("DD.MM.YYYY")
                    : "") +
                  (selectedOfferData.transportInformation[0].deliveryTimeFrom ||
                  selectedOfferData.transportInformation[0].deliveryTimeTo
                    ? "," +
                      (selectedOfferData.transportInformation[0]
                        .deliveryTimeFrom
                        ? moment(
                            selectedOfferData.transportInformation[0]
                              .deliveryTimeFrom,
                            "HH:mm"
                          ).format("HH:mm")
                        : "") +
                      (selectedOfferData.transportInformation[0].deliveryTimeTo
                        ? " - " +
                          moment(
                            selectedOfferData.transportInformation[0]
                              .deliveryTimeTo,
                            "HH:mm"
                          ).format("HH:mm")
                        : "")
                    : "")
                : "N/A",
              currency:
                selectedOfferData.transportInformation?.[0]?.currencyName ||
                "EUR",
              requestDateTime: selectedOfferData.transportInformation?.[0]
                ?.pickupDateFrom
                ? moment(
                    selectedOfferData.transportInformation[0].pickupDateFrom
                  )
                : moment(),
            }}
            form={{
              netPrice: carriersArray?.price || "",
              validity: carriersArray?.offerValidityDate || "",
              truckType: carriersArray?.truckTypeName || "",
              pickupDateTimeRange: carriersArray?.estimatedPickupDateTimeFrom && carriersArray?.estimatedPickupDateTimeTo
                ? [
                    moment(carriersArray.estimatedPickupDateTimeFrom),
                    moment(carriersArray.estimatedPickupDateTimeTo),
                  ]
                : null,
              deliveryDateTimeRange: carriersArray?.estimatedDeliveryDateTimeFrom && carriersArray?.estimatedDeliveryDateTimeTo
                ? [
                    moment(carriersArray.estimatedDeliveryDateTimeFrom),
                    moment(carriersArray?.estimatedDeliveryDateTimeTo),
                  ]
                : null,
            }}

            errors={{}}
            handleInputChange={() => {}}
            handleSubmit={() => {}}
            truckTypeList={[]}
            inputWidth={220}
          />
        )}
      </Modal>
    </>
  );
};

export default ArchivedRequestsPage;

