import React, { useState } from 'react';
import { Row, Col, Pagination, Button } from 'antd';
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
    { id: "ALL", name: t("global.all", "All") },
    { id: "ACTIVE", name: t("shipments.active", "Active") },
    { id: "Completed", name: t("shipments.completed", "Completed") },
  ];
  
  const [request, setRequest] = useState({
    filterType: filterKeys,
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
  "DEFAULT": " #EEF7FF"         
};

const borderColors: Record<string, string> = {
  "POD CONFIRMED": "  #31846A",  
  "DEFAULT":  " #9DA4F7"         
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
                              {[...new Set(filterKeys)].map((item) => (
                                <li
                                  key={item.id}
                                  className={
                                    request?.filterType === filterKeys
                                      ? "active"
                                      : "completed"
                                  }
                                >
                                  <Link
                                    to="#"
                                    onClick={() =>
                                      setRequest({
                                        ...request,
                                        filterType: filterKeys,
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
            {StaticShipments.map((offer) => {
              const bgColor =
                backgroundColors[offer.status] || backgroundColors["DEFAULT"];
              const borderColor =
                borderColors[offer.status] || borderColors["DEFAULT"];

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
                          {t("shipments.request-id", "Request ID")} {offer.id}
                        </span>

                        <div className="header-fields">
                          <span className="shipment-label">
                            {t("shipments.shipper", "Shipper :")}
                          </span>
                          <span className="shipment-main">{offer.shipper}</span>
                          <br />
                          <span className="shipment-label">
                            {t("shipments.carrier", "Carrier :")}
                          </span>
                          <span className="shipment-main">{offer.carrier}</span>
                        </div>
                      </div>
                      <div className="card-price-block">
                        <span className="card-booked-price">
                          {t("shipments.booked-price", "Booked Price")}
                        </span>
                        <div className="card-price-pill">
                          <span className="card-price-value">
                            {offer.price}
                          </span>
                          <span className="card-price-curr">
                            {offer.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-divider" />
                    <div className="pickup-block">
                      <div className="detail-label">
                        {t("shipments.pickup-details", "Pickup Details :")}
                      </div>
                      <div className="detail-main">{offer.pickup}</div>
                      <div className="detail-label">
                        {t("shipments.delivery-details", "Delivery Details :")}
                      </div>
                      <div className="detail-main">{offer.delivery}</div>
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
                          <span className="current-status">{offer.status}</span>
                        </div>
                        <Button className="confirm-btn" type="primary">
                          {offer.button}
                        </Button>
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
      </Main>
    </>
  );
};

export default ShipmentsPage;
