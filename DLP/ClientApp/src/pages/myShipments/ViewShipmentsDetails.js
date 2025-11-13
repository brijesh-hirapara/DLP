import React,   { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Spin, Timeline, Card } from "antd";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { OrganizationsApi } from "api/api";
import { Button } from "components/buttons/buttons";
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

const TimelineNormalWrap = styled.div`
  .ant-timeline-item-last > .ant-timeline-item-content{
    min-height: auto;
  }

  .ant-timeline-right{
    .ant-timeline-item-right{
      .ant-timeline-item-content{
        width: calc(100% - 32px) !important;
      }
    }
  }
  .ant-timeline-item{
    padding-bottom: 25px;
    &:last-child{
      padding-bottom: 0;
    }
    &.active{
      .timeline-content-text{
        p{
          color: ${({ theme }) => theme['dark-color']};
          font-weight: bold
        }
      }
    }

    .ant-timeline-item-content{
      margin: ${({ theme }) => (theme.rtl ? '0 32px 0 0' : '0 0 0 32px')};
      font-size: 14px !important;
      .timeline-content-inner{
        .timeline-content-time{
          min-width: 65px;
          font-weight: 600;
          color: ${({ theme }) => theme['light-gray-color']};
        }
      }
      p{
        margin-bottom: 0;
      }
    }
  }
`;

const CustomDotWrap = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #fff; /* white inner circle */
  border: 2px solid ${({ theme }) => theme['primary-color'] || '#5f63f2'}; /* blue border */

  &.completed::after {
    content: '✔';
    position: absolute;
    color: ${({ theme }) => theme['primary-color'] || '#5f63f2'}; /* blue tick */
    font-size: 10px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &.pending::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme['primary-color'] || '#5f63f2'}; /* blue dot */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
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


const ViewShipmentsDetails = () => {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [requestLoading, setRequestLoading] = useState(false);
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   let timer;

  //   const setUser = async () => {
  //     const tempUser = { ...user };
  //     tempUser["institution"] = await getInstitution(user?.organizationId);
  //     tempUser["fullName"] = user.firstName + " " + user.lastName;
  //     form.setFieldsValue(tempUser);

  //     timer = setTimeout(() => {
  //       setLoading(false);
  //     }, 500);
  //   };

  //   if (user) setUser();

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [user]);

  const getInstitution = async (id) => {
    if (!id) {
      return ""; // or return some default/fallback string
    }
    try {
      const { data } = await organizationsApi.apiOrganizationsIdGet({ id });
      return data.name;
    } catch (error) {
      console.error("Failed to get institution:", error);
      return ""; // fallback or error display text
    }
  };

  // return (
  //   <Card style={{ borderRadius: "12px" }}> 
  //   <Modal
  //     type="primary"
  //     footer={null}
  //     width={700}
  //     bodyStyle={{ paddingTop: 30 }}
  //     onCancel={onCancel}
  //     open={visible}
  //     style={{ padding: 0 }}
  //     closable={false}
  //     title={
  //       <div
  //         style={{
  //           display: "flex",
  //           justifyContent: "space-between",
  //           alignItems: "center",
  //           width: "100%",
  //         }}
  //       >
  //         <h5 style={{ margin: 0, fontWeight: 'bold' }}>
  //           {t("shipment-view-details", "Shipments Details")}
  //         </h5>
  //         <h5 style={{ margin: 0, fontWeight: 'bold' }}>
  //           {t("truck-driver-info", "Truck & Driver Informations")}
  //         </h5>
  //       </div>
  //     }
  //     modalRender={(modal) => (
  //       <div
  //         style={{
  //           background: "#F4F5F7", 
  //           borderRadius: "12px",    
  //         }}
  //       >
  //         <div
  //           style={{
  //             background: "#ffffff",  
  //             borderRadius: "5px",
  //             padding: "25px"
  //           }}
  //         >
  //           {modal} 
  //         </div>
  //       </div>
  //     )}
  //   >
  //     {loading ? (
  //       <Loader>
  //         <Spin />
  //       </Loader>
  //     ) : (
  //       <Row gutter={16}>
  //       {/* Left Section – Shipment Details */}
  //       <Col xs={24} md={14}>
  //       <TimelineNormalWrap>
  //         <Timeline>
  //           <Timeline.Item className="active" dot={<CustomDotWrap className="pending" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:18</p>
  //                 <p>Proof Of Delivery (POD) Uploaded
  //                   <FeatherIcon className="mx-2" icon="download" color="rgb(95, 99, 242)" size={20}/>
  //                 </p>
  //                 <Button type="primary">
  //                   CONFIRM POD
  //                 </Button>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:17</p>
  //                 <p>Proof Of Delivery (POD) Uploaded</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:16</p>
  //                 <p>Requested Delivery</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:15</p>
  //                 <p>Possible Pick-Up</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:14</p>
  //                 <p>Truck Assigned</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:13</p>
  //                 <p>Offer Booked</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //           <Timeline.Item dot={<CustomDotWrap className="completed" />}>
  //             <div className="timeline-content-inner align-center-v justify-content-between">
  //               <div className="timeline-content-text">
  //                 <p>Fri, 19.08.2025, 18:12</p>
  //                 <p>Request Created</p>
  //               </div>
  //             </div>
  //           </Timeline.Item>
  //         </Timeline>
  //     </TimelineNormalWrap>
  //     </Col>

  //       <Col xs={24} md={10}>
  //       <div style={{ lineHeight: "2", fontSize: "15px" }}>
  //             <p>
  //               <strong>{t("driver-first-name", "Truck Driver First Name:")}</strong> John
  //             </p>
  //             <p>
  //               <strong>{t("driver-last-name", "Truck Driver Last Name:")}</strong> Doe
  //             </p>
  //             <p>
  //               <strong>{t("driver-phone", "Phone Number:")}</strong> +389 77 235876
  //             </p>
  //             <p>
  //               <strong>{t("driver-passport", "Passport ID:")}</strong> 123456
  //             </p>
  //             <p>
  //               <strong>{t("truck-number", "Truck Number:")}</strong> 879
  //             </p>
  //       </div>
  //               <div style={{padding:'230px 0px 0px 150px'}}>
  //                 <Button size="default" type="primary" onClick={onCancel}>
  //                   Close
  //                 </Button>
  //               </div>
  //       </Col>
  //     </Row>
  //     )}
  //   </Modal>
  //   </Card>
  // );

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
                                    {  (
                                      <a
                                        // href={shipmentDetails.podFileUrl}
                                        download
                                        className="flex items-center text-primary hover:underline ml-2"
                                      >
                                        {/* <Download className="w-4 h-4 mr-1" /> */}
                                        {t("common:click-to-download", "Click to Download POD")}
                                      </a>  
                                    )}                 
                                </CardKeyValue>
                                <CardKeyValue style={{marginTop:15}}>
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

export default ViewShipmentsDetails;
