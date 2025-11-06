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
import { useState, useMemo, useEffect } from "react";
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
import { OfferCard } from './OfferSubmitPage';
import moment from "moment";
import { RequestsApi } from "api/api";
import openNotificationWithIcon from "utility/notification";
import { sortDirections } from "constants/constants";
import { useTableSorting } from "hooks/useTableSorting";

const requestsApi = new RequestsApi();


const ArchivedRequestsPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOfferData, setSelectedOfferData] = useState<any>(null);
  const [archivedRows, setArchivedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
   const { onSorterChange, sorting } = useTableSorting();
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
  pickupDate: any;
  dropOffDate: any;
  pickupPostalCode: string;
  dropOffPostalCode: string;
  status: TransportRequestStatus; 
  listArchived: boolean;
  sortingPropertyName?: string;
  sortingIsDescending?: boolean;
}>({
  search: "",
  pageNumber: 1,
  pageSize: 10,
  pickupDate: null,
  dropOffDate: null,
  pickupPostalCode: "",
  dropOffPostalCode: "",
  status: TransportRequestStatus.ALL,
  listArchived: true,
  sortingPropertyName: undefined,
  sortingIsDescending: undefined,
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
    openNotificationWithIcon("error", "Failed to load details. Please try again.");
    setSelectedOfferData(null);
  }
  setModalLoading(false);
  setIsModalVisible(true);
};

  const transformArchivedRows = (items: any[]) =>
  items.map((item) => {
    const pickup = item.transportPickup?.[0] || {};
    const delivery = item.transportDelivery?.[0] || {};
    const goods = item.transportGoods?.[0] || {};
    const carrier = item.transportCarrier?.[0] || {};
    const info = item.transportInformation?.[0] || {};

    const possiblePickup = `${pickup.city || ""}, ${pickup.postalCode || ""}, ${pickup.countryName || ""}`;
    const requestedDelivery = `${delivery.city || ""}, ${delivery.postalCode || ""}, ${delivery.countryName || ""}`;
    const cargoStr = `Qty: ${goods.quantity || ""}, L:${goods.length || 0} W:${goods.width || 0} H:${goods.height || 0} Kg:${goods.weight || 0}`;

    // Map carrier.status number to TransportRequestStatus enum
    // Your enum values are: PENDING=1, ACCEPTED=2, REJECTED=3, ALL=0
    let status: typeof TransportRequestStatus[keyof typeof TransportRequestStatus] = TransportRequestStatus.PENDING;
    const carrierStatusNum = Number(carrier.status);
    if (carrierStatusNum === TransportRequestStatus.ACCEPTED) status = TransportRequestStatus.ACCEPTED;
    else if (carrierStatusNum === TransportRequestStatus.REJECTED) status = TransportRequestStatus.REJECTED;
    else if (carrierStatusNum === TransportRequestStatus.PENDING) status = TransportRequestStatus.PENDING;

    return {
      key: item.id,
      id: item.requestId, // for display as Request Id
      // ordinalNumber: item.ordinalNumber, // use direct number or render component as needed
      createdAt: item.createdAt ? moment(item.createdAt).format("DD.MM.YYYY") : "",
      comments: item.comments || "",
      possiblePickup,
      requestedDelivery,
      cargo: cargoStr,
      myPrice: carrier.price != null ? carrier.price : "",
      // Pass status enum and status description string which you can localize
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
      pickupDate: query.pickupDate ? query.pickupDate.format("YYYY-MM-DD") : undefined,
      dropOffDate: query.dropOffDate ? query.dropOffDate.format("YYYY-MM-DD") : undefined,
      pickupPostalCode: query.pickupPostalCode || undefined,
      dropOffPostalCode: query.dropOffPostalCode || undefined,
      type: query.status, 
      listArchived:true,
      sortingPropertyName: query.sortingPropertyName,
      sortingIsDescending: query.sortingIsDescending,
    };
    const res = await requestsApi.apiTransportManagementCarrierListGet(params);
    const transformed = transformArchivedRows(res.data.items || []);
    setArchivedRows(transformed);
    setTotalCount(res.data.totalCount || 0);
  } catch (e) {
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
    query.pickupDate,
    query.dropOffDate,
    query.pickupPostalCode,
    query.dropOffPostalCode,
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


  const filteredData = useMemo(() => {
    return archivedRows.filter((item) => {
      if (
        query.status !== TransportRequestStatus.ALL &&
        item.status !== query.status
      ) return false;

      if (!matchesSearch(item, query.search)) return false;

      if (
        query.pickupPostalCode &&
        !item.possiblePickup.toLowerCase().includes(query.pickupPostalCode.toLowerCase())
      ) return false;

      if (
        query.dropOffPostalCode &&
        !item.requestedDelivery.toLowerCase().includes(query.dropOffPostalCode.toLowerCase())
      ) return false;

      // Pickup Date match (substring from composed string)
      if (query.pickupDate) {
        const dtStr = query.pickupDate.format("DD.MM.YYYY");
        const match = item.raw?.transportInformation?.[0]?.pickupDateFrom
          ? moment(item.raw.transportInformation[0].pickupDateFrom).format("DD.MM.YYYY")
          : "";
        if (match !== dtStr) return false;
      }
      // Dropoff Date match
      if (query.dropOffDate) {
        const dtStr = query.dropOffDate.format("DD.MM.YYYY");
        const match = item.raw?.transportInformation?.[0]?.deliveryDateFrom
          ? moment(item.raw.transportInformation[0].deliveryDateFrom).format("DD.MM.YYYY")
          : "";
        if (match !== dtStr) return false;
      }
      return true;
    });
  }, [archivedRows, query, query.search]);

  const columns = [
    {
      title: t("requests.requestId", "Request Id"),
      dataIndex: "id",
      key: "id",
      // sorter: true,
      // sortDirections: sortDirections,
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
  render: (status: any, record : any) =>
    getRequestStatus(status, record.statusDesc),
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

  const onFilterChange = (e: any) => {
    setQuery((prev) => ({
      ...prev,
      statusFilter: e.target.value as TransportRequestStatus,
      pageNumber: 1,
    }));
  };

  
const handleTableChange = (_ : any, __ : any, sorter : any) => {
  if (!sorter || Array.isArray(sorter)) return;
  setQuery(prev => ({
    ...prev,
    sortingPropertyName: sorter.field,
    sortingIsDescending: sorter.order === 'descend',
    pageNumber: 1, // reset page
  }));
};

const onSearchChange = (value: any) => {
  setQuery({
    ...query,
    search: value,
    pageNumber: 1,
  });
};

// Inside your ArchivedRequestsPage component body (before return):

const goodsArray = selectedOfferData?.transportGoods?.[0];
const carriersArray = selectedOfferData?.transportCarrier?.[0];

const length = goodsArray?.length ?? 0;
const width = goodsArray?.width ?? 0;
const height = goodsArray?.height ?? 0;

const ldmValue = length && width && height ? (length * width * height).toFixed(2) : "0";

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
        buttons={[
          <ExportButtonPageApiHeader
            key="1"
            callFrom={"ArchivedRequests"}
            filterType={0}
            municipalityId={""}
            entityId={""}
            search={query.search}
            typeOfEquipmentId={""}
            from={query.pickupDate ? query.pickupDate.format("YYYY-MM-DD") : ""}
            to={query.dropOffDate ? query.dropOffDate.format("YYYY-MM-DD") : ""}
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
                          className={query.status === item.id ? "active" : "deactivate"}
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
                        pickupDate: date,
                        pageNumber: 1,
                      }))
                    }
                  />
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
                    placeholder={t("requests.dropOffDate", "Drop-off Date")}
                    onChange={(date) =>
                      setQuery((prev) => ({
                        ...prev,
                        dropOffDate: date,
                        pageNumber: 1,
                      }))
                    }
                  />
                </Col>
                <Col flex="1 1 0">
                  <Input
                    style={{ width: "100%" }}
                    placeholder={t(
                      "requests.dropOffPostalCode",
                      "Drop-off Postal Code"
                    )}
                    onChange={(e) =>
                      setQuery((prev) => ({
                        ...prev,
                        dropOffPostalCode: e.target.value,
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
                      dataSource={filteredData}
                      columns={columns}
                      rowKey="key"
                      pagination={{
                        total: totalCount,
                        current: query.pageNumber,
                        pageSize: query.pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "50", "100"],
                        onChange: (page, pageSize) =>
                          setQuery((prev) => ({
                            ...prev,
                            pageNumber: page,
                            pageSize: pageSize,
                          })),
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
            showDeadline = {false}
            ordinalNumber={selectedOfferData.requestId}
            routeInfo={{
              pickup: selectedOfferData.transportPickup?.[0]
                ? `${selectedOfferData.transportPickup[0].city}, ${selectedOfferData.transportPickup[0].postalCode}, ${selectedOfferData.transportPickup[0].countryName}`
                : "N/A",
              dropoff: selectedOfferData.transportDelivery?.[0]
                ? `${selectedOfferData.transportDelivery[0].city}, ${selectedOfferData.transportDelivery[0].postalCode}, ${selectedOfferData.transportDelivery[0].countryName}`
                : "N/A",
              distance: selectedOfferData.totalDistance?.toString() || "0",
              // access:
              //   selectedOfferData.accessibility === 0
              //     ? "No Access Info"
              //     : "Has Access",
              access: getAccessibilityDescription(selectedOfferData.accessibility),
            }}
            goodsInfo={{
              type:
                selectedOfferData.transportGoods?.[0]?.typeOfGoodsName || "N/A",
              quantity:
                selectedOfferData.transportGoods?.[0]?.quantity?.toString() ||
                "N/A",
              dims: selectedOfferData.transportGoods?.[0]
                ? `L:${selectedOfferData.transportGoods[0].length} W:${selectedOfferData.transportGoods[0].width} H:${selectedOfferData.transportGoods[0].height}`
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
                    ? "<br/>" +
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
              dropoffRange: selectedOfferData.transportInformation?.[0]
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
                    ? "<br/>" +
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
                "N/A",
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
              pickupDateTime: carriersArray?.estimatedPickupDateTime ? moment(carriersArray.estimatedPickupDateTime) : null,
              dropoffDateTime: carriersArray?.estimatedDeliveryDateTime ? moment(carriersArray.estimatedDeliveryDateTime) : null,
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

