import React,   { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Spin, Timeline, Card } from "antd";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { OrganizationsApi } from "api/api";
import { Button } from "components/buttons/buttons";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CardToolbox, Main } from "container/styled";
import { PageHeader } from "components/page-headers/page-headers";
import { useNavigate } from "react-router-dom";
// import 'react-phone-input-2/lib/style.css';

const organizationsApi = new OrganizationsApi();

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 100%;
  justify-content: center;
  align-items: center;
  justifyItems: center;
`;

const CardKeyValue = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  span {
    color: #323548;
    font-size: 13px;
    display: block;
    font-weight:bold;
    margin-bottom: 3px;
  }

  p {
    font-weight: 500;
  }
`;


const ViewIconDetailsPage = () => {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [requestLoading, setRequestLoading] = useState(false);
  const navigate = useNavigate();
  

  const getInstitution = async (id: any) => {
    if (!id) {
      return ""; // or return some default/fallback string
    }
    try {
      const { data } = await organizationsApi.apiOrganizationsIdGet({ id });
      return data.name;
    } catch (error) {
      console.error("Failed to get institution:", error);
      return ""; 
    }
  };

  return (
    <>{
        requestLoading
            ? <Loader><Spin /> </Loader>
            :
            <>
                <CardToolbox>
                    <PageHeader title={t('shipment-view-details', 'Details of request')} buttons={[
                        <Button
                            type="primary"
                            onClick={() => navigate(-1)}
                        >
                            {t("global:go.back", "Go back")}{" "}
                            <FeatherIcon icon="arrow-left" size={16} />
                        </Button>
                    ]} />
                  
                </CardToolbox>
                <Main>
                    <Card>
                        <Row gutter={[16, 16]} justify="space-between">
                            <Col xs={24} sm={24} md={12} lg={8} >
                              <h5 style={{fontWeight:'bold', marginBottom:20}}>{t('shipment-view-details', 'Shipments Details:')}</h5>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.pod-confirmed", "Proof of Delivery Confirmed:")}</span>
                                    {/* <p>{requestData.companyName}</p> */} <p>Fri, 19.08.2025, 18:18</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                     <span>{t("common:download-files", "Download Files")}</span>
                                    <div className="doc-line">
                                    Document 01: Title 01{" "}
                                    {/* <span className="download-icon"> */}
                                        <FeatherIcon size={16} icon="download" />
                                        {/* </span> */}
                                    </div>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.pod", "Proof of Delivery (POD) Uploaded:")}</span>
                                    {/* <p>{requestData?.receiveNews ? "Yes" : "No"}</p> */} <p>Fri, 19.08.2025, 18:17</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.delivery-confirmed ", "Delivery Confirmed:")}</span>
                                    {/* <p>{requestData?.hasVatIdAndAcceptsTerms ? "Yes" : "No"}</p> */} <p>Fri, 19.08.2025, 18:16</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.pickup-confirmed", "Pickup Confirmed:")}</span>
                                    {/* <p>{requestData.companyPhoneNumber ? "+" + requestData.companyPhoneNumber :  '-'}</p> */} <p>Fri, 19.08.2025, 18:15</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.truck-assigned", "Truck Assigned:")}</span>
                                    {/* <p>{requestData?.contactPersonEmail}</p> */} <p>Fri, 19.08.2025, 18:14</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("my-shipments:details.offer-booked", "Offer Booked:")}</span>
                                    {/* <p>{requestData.contactPerson}</p> */} <p>Fri, 19.08.2025, 18:13</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span> {t("my-shipments:details.request-created", "Request Created:")}</span>
                                    {/* <p>{requestData.requestId}</p> */} <p>Fri, 19.08.2025, 18:12</p>
                                </CardKeyValue>
                            </Col>

                            <Col xs={24} sm={24} md={12} lg={8} >
                            <h5 style={{fontWeight:'bold', marginBottom:20}}>{t("truck-driver-info", "Truck & Driver Informations:")}</h5>
                                <CardKeyValue>
                                    <span>{t("driver-first-name", "Truck Driver First Name:")}</span>
                                    {/* <p>{requestData.requestTypeDesc}</p> */} <p>John</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                    <span>{t("driver-last-name", "Truck Driver Last Name:")}</span>
                                    {/* <p>{requestData.requestTypeDesc}</p> */} <p>Doe</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                    <span>{t("driver-phone", "Phone Number:")}</span>
                                    {/* <p>{requestData?.countryName}</p> */} <p>+389 77 235876</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span>{t("driver-passport", "Passport ID:")}</span>
                                    {/* <p>{requestData?.postCode}</p> */} <p>123456</p>
                                </CardKeyValue>    
                                <CardKeyValue>
                                    <span>{t("truck-number", "Truck Number:")}</span>
                                    {/* <p>{requestData.address || '-'}</p> */} <p>879</p>
                                </CardKeyValue>
                            </Col>
                        </Row>
                    </Card>
                </Main>
            </>
    }
    </>
);
};

export default ViewIconDetailsPage;
