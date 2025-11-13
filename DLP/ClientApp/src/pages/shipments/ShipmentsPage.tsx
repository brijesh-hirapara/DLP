import React, { useEffect, useState } from 'react';
import { Row, Col, Pagination, Button, Popconfirm, Tooltip } from 'antd';
import { useTranslation } from "react-i18next";
import { PageHeader } from '../../components/page-headers/page-headers';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { CardToolbox, Main } from 'container/styled';
import { UsercardWrapper } from 'pages/style';
import { ProjectSorting } from 'pages/localization/email/style';
import { StaticShipments } from './DummyShipments';
//@ts-ignore
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import ViewOrderDetails from 'pages/myOrders/ViewOrderDetails';
import { ListShipmentsDtoPaginatedList } from 'api/models/list-shipments-dto-paginated-list';
import { RequestsApi } from 'api/api';
import { ShipmentsStatus } from 'api/models';

const requestsApi = new RequestsApi;


// const statusColors: Record<string, string> = {
//   "PICKUP CONFIRMED": " #EEF7FF",
//   "TRUCK ASSIGNED": " #EEF7FF",
//   "POD CONFIRMED": " #ECFBF6",
//   "DRIVER BOOKED": " #EEF7FF",
//   "DELIVERY CONFIRMED": " #EEF7FF",
// };

// const statusBorderColors: Record<string, string> = {
//   "PICKUP CONFIRMED": " #9DA4F7",
//   "TRUCK ASSIGNED": " #9DA4F7",    
//   "POD CONFIRMED": " #31846A",      
//   "DRIVER BOOKED": " #9DA4F7",
//   "DELIVERY CONFIRMED": " #9DA4F7",
// };

const ShipmentsPage = () => {
  const { t } = useTranslation();

  
  const filterKeys = [
    { id: ShipmentsStatus.ALL, name: t("global.all", "All") },
    { id: ShipmentsStatus.ACTIVE, name: t("shipments.active", "Active") },
    { id: ShipmentsStatus.COMPLETED, name: t("shipments.completed", "Completed") },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeSection, setActiveSection] = useState<"view" | "assignTruck" | "uploadPod">("view");
    const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<ListShipmentsDtoPaginatedList | null>(null);
  const shipmentItems = shipments?.items || [];

    const [request, setRequest] = useState<{
    status : any;   
    search: string;
    pageNumber: number;
    pageSize: number;
  }>({
    status: ShipmentsStatus.ALL,  
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

const onSearchChange = (value: string) => {
  setRequest(prev => ({
    ...prev,
    search: value
  }));
};

// Handler to show modal and pass order data
const handleViewOrder = (order: any) => {
  setSelectedOrder(order);
  setModalVisible(true);
};
 const backgroundColors: Record<string, string> = {
  "POD CONFIRMED": " #ECFBF6",  
  "POD NOT CONFIRMED": " #FFF5F5",
  "DEFAULT": " #EEF7FF"         
};

const borderColors: Record<string, string> = {
  "POD CONFIRMED": "  #31846A",  
  "POD NOT CONFIRMED": " #FF4D4F",
  "DEFAULT":  " #9DA4F7"         
};



// Handler to close modal
const handleCloseModal = () => {
  setModalVisible(false);
  setSelectedOrder(null);
};


useEffect(() => {
  fetchShipments();
}, [request]);

const fetchShipments = async () => {
  try {
    setLoading(true);
    const res = await requestsApi.apiCarrierOrdersListGet({...request});
    // Use res.items for the actual array
    setShipments(res.data);
  } catch (err) {
    // setOrders([]);
    // Optionally handle or log error
  }
  setLoading(false);
};

// Handler function inside MyOrdersPage component
const handleActionClick = (order: any, buttonType: string) => {
  setSelectedOrder(order);
  if (buttonType === "Assign Truck") {
    setActiveSection("assignTruck");
  } else if (buttonType === "Upload POD") {
    setActiveSection("uploadPod");
  } else {
    setActiveSection("view");
  }
  setModalVisible(true);
};

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("shipments.title", "Shipments")}
          subTitle={
            <>
              {StaticShipments?.length}{" "}
              {t("shipments.total-shipments", "Total Shipments")}
            </>
          }
        />
      </CardToolbox>

      {/* <Main>
        <UsercardWrapper>
          <Row gutter={25}>
            {StaticShipments.map((offer) => (
              <Col key={offer.id} xxl={8} md={12} sm={24} xs={24}>
                <div
                  className="shipment-card"
                      style={{
                                background: bgColor,
                                border: `1.5px solid ${borderColor}`,
                                borderRadius: "8px"
                            }}
                > */}

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
                                    request?.status === item.id 
                                      ? "active"
                                      : "completed"
                                  }
                                >
                                  <Link
                                    to="#"
                                    onClick={() =>
                                      setRequest({
                                        ...request,
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
        
        <UsercardWrapper>
          <Row gutter={25}>
            {shipmentItems.map((offer) => {
                  const shipmentCarrierStatus =
                    offer.isPODConfirmed
                      ? "POD CONFIRMED"
                      : offer.isPODUploaded
                        ? "POD NOT CONFIRMED"
                        : offer.shipmentCarrierStatusDesc || "";

                  const bgColor = backgroundColors[shipmentCarrierStatus] || backgroundColors["DEFAULT"];
                  const borderColor = borderColors[shipmentCarrierStatus] || borderColors["DEFAULT"];

              // Helper function to format date/time
            const formatDateTime = (dateStr: string) => {
              if (!dateStr) return "-";
              const d = new Date(dateStr);
              // For example: "05.07.2025, 14:00"
              return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            };

            const formatLocation = (loc?: any) => {
              if (!loc) return "";
              return `${loc.city || ""}, ${loc.postalCode || ""}, ${loc.countryName || ""}`;
            };


            // Render first pickup/delivery (can map to list all if needed)
            const pickupLoc = offer.transportPickup?.[0];
            const deliveryLoc = offer.transportDelivery?.[0];
            const carrier = offer.transportCarrier?.[0];

            const pickupDetail =
              pickupLoc && carrier
                ? `${formatDateTime(carrier.estimatedPickupDateTimeFrom || "")} - ${formatDateTime(carrier.estimatedPickupDateTimeTo || "")}, ${formatLocation(pickupLoc)}`
                : formatLocation(pickupLoc);

            const deliveryDetail =
              deliveryLoc && carrier
                ? `${formatDateTime(carrier.estimatedDeliveryDateTimeFrom || "")} - ${formatDateTime(carrier.estimatedDeliveryDateTimeTo || "")}, ${formatLocation(deliveryLoc)}`
                : formatLocation(deliveryLoc);

                  // Sample "button"
            const mainButton =
              offer.shipmentCarrierStatusDesc === "Offer Booked"
                ? "Assign Truck"
                : !offer.isTruckAssigned
                ? "Assign Truck"
                : !offer.isPickupConfirmed
                ? "Confirm Pickup"
                : !offer.isDeliveryConfirmed
                ? "Confirm Drop-Off"
                : !offer.isPODUploaded
                ? "Upload POD"
                : "";


              return (
                <Col key={offer.id} xxl={8} md={12} sm={24} xs={24}>
                  <div
                    className="shipment-card"
                    style={{
                      background: bgColor,
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: "8px",
                    }}
                  >
                    <div className="card-header-row">
                      <div className="header-left">
                        <span className="request-id">
                          {t("shipments.request-id", "Request ID")} {offer.requestId}
                          {/* <Tooltip title={t("global.view", "View")}>
                            <span
                              style={{ 
                                cursor: "pointer", 
                                marginLeft: "6px", 
                              // display: "inline-block" 
                              }}
                              onClick={() => handleViewOrder(offer)}
                            >
                              <FeatherIcon icon="eye" size={16} />
                            </span>
                          </Tooltip> */}
                          <Tooltip title={t("global.view", "View")}>
                            <Link to={`/shipments/view`}>
                              <span
                                style={{
                                  cursor: "pointer",
                                  marginLeft: "6px",
                                  display: "inline-block"
                                }}
                              >
                                <FeatherIcon icon="eye" size={16} />
                              </span>
                            </Link>
                          </Tooltip>
                          <div className="request-subtext" style={{ fontSize: "12px", color: "#888" }}>
                            {offer.totalDistance} km | {offer.transportGoods?.[0]?.weight || "-"} KG
                          </div>
                        </span>

                        <div className="header-fields">
                          <span className="shipment-label">
                            {t("shipments.purchaser", "Purchaser :")}
                          </span>
                          <span className="shipment-main">{offer.shipperName}</span>
                          <br />
                          <span className="shipment-label">
                            {t("shipments.carrier", "Carrier :")}
                          </span>
                          <span className="shipment-main">{offer.carrierName}</span>
                        </div>
                      </div>
                      <div className="card-price-block">
                        <span className="card-booked-price">
                          {t("shipments.booked-price", "Booked Price")}
                        </span>
                        <div className="card-price-pill">
                          <span className="card-price-value">
                            {offer.transportCarrier?.[0]?.price || "-"}
                          </span>
                          <span className="card-price-curr">
                            {/* {offer.currency} */}EUR
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-divider" />
                    <div className="pickup-block">
                      <div className="detail-label">
                        {t("shipments.pickup-details", "Pickup Details :")}
                      </div>
                      <div className="detail-main">{pickupDetail}</div>
                      <div className="detail-label">
                        {t("shipments.delivery-details", "Delivery Details :")}
                      </div>
                      <div className="detail-main">{deliveryDetail}</div>
                    </div>
                    <div className="card-divider" />
                    <div className="card-bottom-row">
                      <div className="documents-block">
                        <div className="doc-title">
                          {t("shipments.documents", "Documents")}
                        </div>
                        <div className="doc-line">
                          Document 01: Title 01{" "}
                          <span className="download-icon"><FeatherIcon size={16} icon="download" /></span>
                        </div>
                        <div className="doc-line">
                          Document 02: Title 02{" "}
                          <span className="download-icon"><FeatherIcon size={16} icon="download" /></span>
                        </div>
                      </div>
                      <div className="status-actions-block">
                        <div className="status-row">
                          <span className="current-status-label">
                            {t("shipments.current-status", "Current Status")}
                          </span>
                          {/* <span 
                              className="current-status"
                              style={{
                                background: offer.status === "POD NOT CONFIRMED" ? '#FFCCCC' : undefined,
                                color: offer.status === "POD NOT CONFIRMED" ? '#C00' : undefined,
                                borderRadius: 4
                              }}
                          >{offer.status}</span> */}
                        <span className="current-status"
                            style={{
                              background: shipmentCarrierStatus === "POD NOT CONFIRMED" ? '#FFCCCC' : undefined,
                              color: shipmentCarrierStatus === "POD NOT CONFIRMED" ? '#C00' : undefined,
                              borderRadius: 4
                            }}
                        >
                            {shipmentCarrierStatus}
                        </span>
                        </div>
                        {/* <Button className="confirm-btn" type="primary" onClick={() => handleActionClick(offer)}>
                          {offer.button}
                        </Button> */}
                    {/* {(offer.status === "PICKUP CONFIRMED" || offer.status === "TRUCK ASSIGNED") ? (
                      <Popconfirm
                        title={t(
                          "my-orders.confirm the order",
                          "Are you sure confirm this action?"
                        )}
                        okText={t("global.yes", "Yes")}
                        cancelText={t("global.no", "No")}
                        onConfirm={() => {
                        }}
                      >
                        <Button className="confirm-btn" type="primary">
                          {offer.button}
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button className="confirm-btn" type="primary" onClick={() => handleActionClick(offer)}>
                        {offer.button}
                      </Button>
                    )} */}
                      {mainButton && (
                        <Button 
                        className="confirm-btn" 
                        type="primary" 
                        onClick={() => handleActionClick(offer, mainButton)}
                        >
                          {mainButton}
                        </Button>
                        )} 

                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
            <Col xs={24}>
              <div
                className="pagination-container"
                style={{ textAlign: "end" }}
              >
                <Pagination
                  showSizeChanger
                  defaultCurrent={1}
                  total={6}
                  pageSize={6}
                  style={{ marginTop: "20px" }}
                />
              </div>
            </Col>
          </Row>
        </UsercardWrapper>
        <ViewOrderDetails
          visible={modalVisible}
          onCancel={handleCloseModal}
          user={selectedOrder}
          activeSection={activeSection}
          refreshOrders={fetchShipments}
        />
      </Main>
    </>
  );
};

export default ShipmentsPage;
