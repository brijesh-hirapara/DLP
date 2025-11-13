import React, { useEffect, useState } from 'react';
import { Row, Col, Pagination, Button, Tooltip, Popconfirm } from 'antd';
import { useTranslation } from "react-i18next";
import { PageHeader } from '../../components/page-headers/page-headers';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { CardToolbox, Main } from 'container/styled';
import { UsercardWrapper } from 'pages/style';
import { ProjectSorting } from 'pages/localization/email/style';
import { StaticShipments } from './DummyOrders';
//@ts-ignore
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import ViewOrderDetails from './ViewOrderDetails';
import { RequestsApi } from 'api/api';
import { ListTransportManagementDtoPaginatedList } from 'api/models/list-transport-management-dto-paginated-list';
import { ShipmentsStatus } from 'api/models';
import { useTableSorting } from 'hooks/useTableSorting';
import { ListShipmentsDtoPaginatedList } from 'api/models/list-shipments-dto-paginated-list';
import openNotificationWithIcon from 'utility/notification';

const requestsApi = new RequestsApi;

type PODFile = {
  id: string;
  contentType: string;
  fileContents: string;
  fileName: string;
};

type DocumentListProps = {
  files: PODFile[];
};



const MyOrdersPage = () => {
  const { t } = useTranslation();

    const [orders, setOrders] = useState<ListShipmentsDtoPaginatedList | null>(null);
  const [loading, setLoading] = useState(true);
const orderItems = orders?.items || [];
    const { onSorterChange, sorting } = useTableSorting();
  
  const filterKeys = [
    { id: ShipmentsStatus.ALL, name: t("global.all", "All") },
    { id: ShipmentsStatus.ACTIVE, name: t("shipments.active", "Active") },
    { id: ShipmentsStatus.COMPLETED, name: t("shipments.completed", "Completed") },
  ];
  
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

const [modalVisible, setModalVisible] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);
const [activeSection, setActiveSection] = useState<"view" | "assignTruck" | "uploadPod">("view");

useEffect(() => {
  fetchMyOrders();
}, [request]);

const fetchMyOrders = async () => {
  try {
    setLoading(true);
    const res = await requestsApi.apiCarrierOrdersListGet({...request});
    setOrders(res.data);
  } catch (err) {
    // setOrders([]);
  }
  setLoading(false);
};


// Handler to show modal and pass order data
const handleViewOrder = (order: any) => {
  setSelectedOrder(order);
  setModalVisible(true);
};

// Handler to close modal
const handleCloseModal = () => {
  setModalVisible(false);
  setSelectedOrder(null);
};

// Handler function inside MyOrdersPage component
const handleActionClick = (order: any, buttonType: string) => {
  setSelectedOrder(order);
  if (buttonType === "Assign Truck") {
    setActiveSection("assignTruck");
  } else if (buttonType === "Upload POD") {
    setActiveSection("uploadPod");
  } else {
    // setActiveSection("view");
  }
  setModalVisible(true);
};


const confirmPickup = async (shipmentId: string) => {
  try {
    await requestsApi.apiShipmentsIdConfirmPickupDeliveryPut({ shipmentId }); 
    openNotificationWithIcon("success", t("my-oders.pickup-success", "Pickup confirmed successfull"));
    fetchMyOrders(); 
  } catch (error) {
    openNotificationWithIcon("error", t("my-oders.pickup-error", "Pickup confirmation failed"));
  }
};

const confirmDelivery = async (shipmentId: string) => {
  try {
    await requestsApi.apiShipmentsIdConfirmPickupDeliveryPut({ shipmentId }); 
            openNotificationWithIcon(
              "success",
              t("my-oders.delivery-success", "Delivery confirmed successfully")
            );
    fetchMyOrders();
  } catch (error) {
    openNotificationWithIcon("error", t("my-oders.delivery-error", "Delivery confirmation failed"));
  }
};



const PodDocumentsDownload: React.FC<DocumentListProps> = ({ files }) => {

  // Helper to convert base64 to Blob URL for download
  const base64ToBlobUrl = (base64Data: string, contentType: string) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return URL.createObjectURL(blob);
  };

  return (
    <>
      {files.length > 0 ? (
        files.map((doc) => {
          const downloadUrl = base64ToBlobUrl(doc.fileContents, doc.contentType);
          return (
            <div className="doc-line" key={doc.id}>
              {doc.fileName}
              <a
                href={downloadUrl}
                download={doc.fileName}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 8 }}
              >
                <FeatherIcon size={16} icon="download" />
              </a>
            </div>
          );
        })
      ) : (
        <div className="doc-line">{t("shipments.no-documents", "No documents available")}</div>
      )}
    </>
  );
};


  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("my-orders.title", "My Orders")}
          subTitle={
            <>
              {StaticShipments?.length}{" "}
              {t("my-orders.total-orders", "Total Orders")}
            </>
          }
        />
      </CardToolbox>

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
            {orderItems.map((offer) => {
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
                            <Link to={`/my-orders/view/${offer.id}`}>
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

                          {/* <Tooltip title={t("global.view", "View")}>
                            <Button
                              className="btn-icon"
                              type="ghost"
                              shape="circle"
                            >
                              <FeatherIcon icon="eye" size={16} />
                            </Button>
                          </Tooltip>  */}


                        </span>
                      </div>
                      <div className="card-price-block">
                        <span className="card-booked-price">
                          {t("shipments.booked-price", "Booked Price")}
                        </span>
                        <div className="card-price-pill">
                          <span className="card-price-value">
                            {offer.transportCarrier?.[0]?.adminApprovedPrice || "-"}
                          </span>
                          <span className="card-price-curr">
                            {offer.currencyName || "EUR"}
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
                    <div className="card-bottom-row" style={{ display: 'flex', justifyContent:"flex-end", alignItems: 'center', gap: 8 }}>
                      {["POD CONFIRMED", "POD NOT CONFIRMED"].includes(shipmentCarrierStatus) && (
                      <div className="documents-block">
                        <div className="doc-title">{t("shipments.documents", "Documents")}</div>
                        <PodDocumentsDownload files={offer.uploadPODFiles as PODFile[]} />
                      </div>
                    )}



                      <div className="status-actions-block">
                        <div className="status-row">
                          <span className="current-status-label">
                            {t("shipments.current-status", "Current Status")}
                          </span>
                        
                         <span className="current-status"
                            style={{
                              background: shipmentCarrierStatus === "POD NOT CONFIRMED" ? '#FFCCCC' : undefined,
                              color: shipmentCarrierStatus === "POD NOT CONFIRMED" ? '#C00' : undefined,
                              borderRadius: 4
                            }}
                          >{shipmentCarrierStatus}
                        </span>
                          </div>
                      {/* {mainButton && (
                        <Button 
                        className="confirm-btn" 
                        type="primary" 
                        onClick={() => handleActionClick(offer, mainButton)}
                        >
                          {mainButton}
                        </Button>
                       )}  */}
                       {mainButton === "Confirm Pickup" ? (
                        <Popconfirm
                        className="confirm-btn"
                          title={t("shippers:alert-toggle-confirm-pickup", "Are you sure you want to Confirm Pickup?")}
                          onConfirm={() => offer.id && confirmPickup(offer.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="primary">{mainButton}</Button>
                        </Popconfirm>
                      ) : mainButton === "Confirm Drop-Off" ? (
                        <Popconfirm
                        className="confirm-btn"
                          title={t("shippers:alert-toggle-confirm-delivery", "Are you sure you want to Confirm Delivery?")}
                          onConfirm={() => offer.id && confirmDelivery(offer.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button className="confirm-btn"  type="primary">{mainButton}</Button>
                        </Popconfirm>
                      ) : (
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
          refreshOrders={fetchMyOrders}
        />

      </Main>
    </>
  );
};

export default MyOrdersPage;









// import {
//   Col,
//   Input,
//   Row,
//   Table,
//   Button,
//   Tooltip,
//   Radio,
//   DatePicker,
//   Typography,
// } from "antd";
// //@ts-ignore
// import FeatherIcon from "feather-icons-react";
// import { useState, useMemo, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { useAuthorization } from "hooks/useAuthorization";
// import {
//   CardToolbox,
//   Main,
//   ProfilePageheaderStyle,
//   ProfileTableStyleWrapper,
//   TableWrapper,
// } from "container/styled";
// import { UserTableStyleWrapper } from "../style";
// import { Cards } from "components/cards/frame/cards-frame";
// import { PageHeader } from "components/page-headers/page-headers";
// import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
// import { ProjectSorting } from "pages/localization/email/style";
// import { Link } from "react-router-dom";
// import { AutoComplete } from "components/autoComplete/autoComplete";
// import { UserFilterType } from "api/models";
// import { DummyOrders } from "./DummyOrders";
// import ViewOrderDetails from "./ViewOrderDetails";


// type Order = {
//   key: number;
//   id: string;
//   bookedPrice: string;
//   estimatedPickup: string;
//   estimatedDropoff: string;
//   documents: string;
//   status: string;
// };


// export enum RequestStatusType {
//   ALL = "All",
//   OFFERBOOKED = "Offer Booked",
//   PODUPLOADED = "POD Uploaded",
//   PODCONFIRMED = "POD Confirmed",
// }


// const matchesSearch = (item: any, search: string) => {
//   if (!search) return true;
//   const normalized = search.toLowerCase();
//   return (
//     item.id.toLowerCase().includes(normalized) ||
//     item.estimatedPickup.toLowerCase().includes(normalized) ||
//     item.estimatedDropoff.toLowerCase().includes(normalized) ||
//     item.documents.toLowerCase().includes(normalized) ||
//     item.bookedPrice.toLowerCase().includes(normalized) ||
//     item.status.toLowerCase().includes(normalized)
//   );
// };

// const statusOptions = [
//   { label: "All", value: RequestStatusType.ALL },
//   { label: "Offer Booked", value: RequestStatusType.OFFERBOOKED },
//   { label: "POD Uploaded", value: RequestStatusType.PODUPLOADED },
//   { label: "POD Confirmed", value: RequestStatusType.PODCONFIRMED },
// ];

// const MyOrdersPage = () => {
//   const { t } = useTranslation();
//   const { hasPermission } = useAuthorization();
//   // const [request, setRequest] = useState({ search: "" });
//   const [orders, setOrders] = useState<Order[]>([]);
//   //  const [selectedOrders, setSelectedOrders] = useState(null);

  

//   // SINGLE DatePicker for pickup and dropoff date filtering
//   const [query, setQuery] = useState({
//     pageNumber: 1,
//     pageSize: 10,
//     pickupDate: null as any,
//     dropOffDate: null as any,
//     pickupPostalCode: "",
//     dropOffPostalCode: "",
//     statusFilter: RequestStatusType.ALL,
//   });

//   const [ordersData, setOrdersData] = useState({
//   hasNextPage: false,
//   hasPreviousPage: false,
//   items: [],
//   pageIndex: 1,
//   totalCount: 7,
//   totalPages: 1,
// });

//       const filterItems = [
//   { id: 1, name: "All" },
//   { id: 2, name: "Offer Booked" },
//   { id: 3, name: "POD Uploaded" },
//   { id: 4, name: "POD Confirmed" },
// ];


//       const [request, setRequest] = useState({
//         filterType: UserFilterType.ACTIVE,
//         search: "",
//         pageNumber: 1,
//         pageSize: 10,
//       });

//       const HIGHLIGHT_STYLE = { color: " #4B937B", fontWeight: 600 };

//       function highlightCity(text:any) {
//   // Try to match city string like "Skopje, 1000, MKD" or "Berlin, 542, DE"
//   // Assumes always at the last line after the last \n
//   const lines = text.split('\n');
//   if (lines.length < 2) return text;
//   const [before, cityLine] = [lines.slice(0, -1).join('\n'), lines[lines.length - 1]];
//   return (
//     <>
//       {before}
//       <br />
//       <span style={HIGHLIGHT_STYLE}>{cityLine}</span>
//     </>
//   );
// }
//   // const [selectedOrders, setSelectedOrders] = useState<any>(null);
//   const [selectedOrders, setSelectedOrders] = useState<{row: any, section: "view" | "assignTruck" | "uploadPod"} | null>(null);

//   const columns = [
//     {
//       title: t("remy-ordersuests.requestId", "Request Id"),
//       dataIndex: "id",
//       key: "id",
//       sorter: true,
//       sortDirections: ["ascend", "descend"] as any,
//     },
//     {
//       title: t("my-orders.bookedPrice", "Booked Price"),
//       dataIndex: "bookedPrice",
//       key: "bookedPrice",
//     },
//     {
//       title: t("my-orders.possiblePick-up", "Possible Pick-up"),
//       dataIndex: "estimatedPickup",
//       key: "estimatedPickup",
//       render: (val: string) => (
//         <div style={{ whiteSpace: "pre-line" }}>{highlightCity(val)}</div>
//       ),
//       sorter: true,
//       sortDirections: ["ascend", "descend"] as any,
//     },
//     {
//       title: t("my-orders.requestedDelivery", "Requested Delivery"),
//       dataIndex: "estimatedDropoff",
//       key: "estimatedDropoff",
//       render: (val: string) => (
//         <div style={{ whiteSpace: "pre-line" }}>{highlightCity(val)}</div>
//       ),
//       sorter: true,
//       sortDirections: ["ascend", "descend"] as any,
//     },
//     // {
//     //   title: t("my-orders.documents", "Documents"),
//     //   dataIndex: "documents",
//     //   key: "documents",
//     //   sorter: true,
//     //   sortDirections: ["ascend", "descend"] as any,
//     // },
//     {
//       title: t("my-orders.documents", "Documents"),
//       dataIndex: "documents",
//       key: "documents",
//       sorter: true,
//       sortDirections: ["ascend", "descend"] as any,
//       render: (document: string, row: any) =>
//         document && row.documentUrl ? (
//           <a
//             href={row.documentUrl}
//             download
//             style={{ color: "#3E60D5", textDecoration: "underline" }}
//           >
//             {document}
//           </a>
//         ) : (
//           document
//         ),
//     },

//     {
//       title: t("my-orders.status", "Status"),
//       dataIndex: "status",
//       key: "status",
//       align: "center" as "center",
//       render: (_: string, row: any) => (
//         <div>
//           <div>{row.status}
//           {row.statusNote && (
//             <div
//               style={{ fontSize: "8px", color: "#727272", fontWeight: 600 }}
//             >
//             {row.statusNote} 
//             </div>
//           )}</div> 
//             
//         </div>
//       ),
//     },

//     // {
//     //   title: t("requests.actions", "Actions"),
//     //   key: "actions",
//     //   render: (_: any, row: any) => (
//     //     <Tooltip title={t("global.view", "View")}>
                 
//     //                     {/* <Button
//     //                       className="btn-icon"
//     //                       type="text"
//     //                       shape="circle"
//     //                       onClick={() => setSelectedOrders(row)}
//     //                       title={t("global.view", "View")}
//     //                     >
//     //                       <FeatherIcon icon="eye" size={16} color=" #C0C6DD" />
//     //                     </Button> */}
                    
//     //       <span
//     //         style={{
//     //           display: "inline-flex",
//     //           alignItems: "center",
//     //           cursor: "pointer",
//     //         }}
//     //         onClick={() => setSelectedOrders(row)}
//     //       >
//     //         <FeatherIcon icon="eye" size={16} color=" #C0C6DD" />
//     //       </span>
//     //     </Tooltip>
//     //   ),
//     // },
//     {
//   title: t("requests.actions", "Actions"),
//   key: "actions",
//   render: (_: any, row: any) => (
//     <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//       <Tooltip title={t("global.view", "View")}>
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             cursor: "pointer",
//             marginBottom: 8,
//           }}
//           onClick={() => setSelectedOrders({ row, section: "view" })}
//         >
//           <FeatherIcon icon="eye" size={16} color="#C0C6DD" />
//         </span>
//       </Tooltip>
//       {row.status === "Offer Booked" && (
//         <Button
//           type="primary"
//           size="small"
//           onClick={() => setSelectedOrders({ row, section: "assignTruck" })}
//           style={{ width: 120 }}
//         >
//           {t("my-orders.assign-truck", "ASSIGN TRUCK")}
//         </Button>
//       )}
//       {row.status === "POD Uploaded" && (
//         <Button
//           type="dashed"
//           size="small"
//           onClick={() => setSelectedOrders({ row, section: "uploadPod" })}
//           style={{ width: 120 }}
//         >
//           {t("my-orders.upload-pod", "UPLOAD POD")}
//         </Button>
//       )}
//     </div>
//   ),
// }

//   ];


//   useEffect(() => {
//     setOrders(DummyOrders);
//   }, [orders]);
  

//   const onFilterChange = (e: any) => {
//     setQuery((prev) => ({
//       ...prev,
//       statusFilter: e.target.value as RequestStatusType,
//       pageNumber: 1,
//     }));
//   };

//       const onSearchChange = (value: any) => {
//     setRequest({ ...request, search: value });
//   };

//   return (
//     <>
//       {/* <CardToolbox> */}
//         <PageHeader
//           ghost
//           title={t("my-orders.myOrders", "My Orders")}
//           subTitle={
//             <>
//               {ordersData?.totalCount}{" "}
//               {t("my-orders.total-my-orders", "Total My Orders")}
//             </>
//           }
//           buttons={[
//             <ExportButtonPageApiHeader
//               key="1"
//               callFrom={"MyOrders"}
//               filterType={0}
//               municipalityId={""}
//               entityId={""}
//               search={request.search}
//               typeOfEquipmentId={""}
//               from={
//                 query.pickupDate ? query.pickupDate.format("YYYY-MM-DD") : ""
//               }
//               to={
//                 query.dropOffDate ? query.dropOffDate.format("YYYY-MM-DD") : ""
//               }
//             />,
//           ]}
//         />
//       <Main>
//         <Row gutter={25}>
//           <Col xs={24} sm={24} md={24} lg={24}>
//             <ProjectSorting>
//               <div className="project-sort-bar">
//                 <div className="project-sort-nav">
//                   <nav>
//                     <ul>
//                       {[...new Set(filterItems)].filter(Boolean).map((item) => (
//                         <li
//                           key={item.id}
//                           className={
//                             request?.filterType === item.id
//                               ? "active"
//                               : "deactivate"
//                           }
//                         >
//                           <Link
//                             to="#"
//                             onClick={() =>
//                               setRequest({
//                                 ...request,
//                                 // filterType: item.id,
//                                 pageNumber: 1,
//                                 pageSize: 10,
//                               })
//                             }
//                           >
//                             {item.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   </nav>
//                 </div>

//                 <div className="project-sort-search">
//                   <AutoComplete
//                     onSearch={(value) => onSearchChange(value)}
//                     patterns
//                     placeholder={t(
//                   "global.auto-complete-placeholder",
//                   "Search..."
//                 )}
//                   />
//                 </div>
//               </div>
//             </ProjectSorting>
//           </Col>
//         </Row>
//         {/* </CardToolbox> */}

//         <Row gutter={15}>
//           <Col xs={24} sm={24} md={24} lg={24}>
//             {selectedOrders && (
//               <ViewOrderDetails
//                 onCancel={() => setSelectedOrders(null)}
//                 user={selectedOrders}
//                 visible={selectedOrders !== null}
//                 activeSection={selectedOrders.section}
//               />
//             )}
//            <ProfileTableStyleWrapper>
//               <Cards headless>
//                 <TableWrapper 
//                 // style={{ overflowX: "auto", width: "100%" }}
//                 >
//                   <Table
//                     dataSource={DummyOrders}
//                     columns={columns}
//                     rowClassName={(record) =>
//                       record.status === "POD Confirmed" ? "green-row" : ""
//                     }
//                     pagination={{
//                       total: DummyOrders.length,
//                       current: query.pageNumber,
//                       pageSize: query.pageSize,
//                       showSizeChanger: true,
//                       pageSizeOptions: ["10", "50", "100"],
//                       onChange: (page, pageSize) =>
//                         setQuery((prev) => ({
//                           ...prev,
//                           pageNumber: page,
//                           pageSize: pageSize,
//                         })),
//                     }}
//                     locale={{
//                       emptyText: t("requests.noResults", "No Results Found"),
//                     }}
//                     rowKey="key"
//                     scroll={{ x: "1000px" }}
//                   />
//                 </TableWrapper>
//               </Cards>
//             </ProfileTableStyleWrapper>
//           </Col>
//         </Row>
//       </Main>
//     </>
//   );
// };

// export default MyOrdersPage;

