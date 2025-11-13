import React,   { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Spin, Timeline, Card } from "antd";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { RequestsApi } from "api/api";
import { Button } from "components/buttons/buttons";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CardToolbox, Main } from "container/styled";
import { PageHeader } from "components/page-headers/page-headers";
import { useNavigate } from "react-router-dom";
import { ListShipmentsDtoPaginatedList } from "api/models/list-shipments-dto-paginated-list";
import { useParams } from "react-router-dom";
// import 'react-phone-input-2/lib/style.css';

const requestsApi = new RequestsApi();


// At top of file, for clarity (recommended):
type PODFile = {
  id: string;
  contentType: string;
  fileContents: string;
  fileName: string;
};


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


const ViewIconOrderDetailsPage = () => {
const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [requestLoading, setRequestLoading] = useState(false);
  const navigate = useNavigate();
  const detailsItems = details?.items || [];
  const { id } = useParams();

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);
  
const fetchRequestDetails = async () => {
  try {
    setLoading(true);
    if (!id) return;
    const res = await requestsApi.apiCarrierOrdersDetailsIdGet({ shipmentId: id });
    setDetails(res.data);
  } catch (err) {
    // handle error
  }
  setLoading(false);
};


// Functional component for downloads
const PodDocumentsDownload = ({ files }: { files: PODFile[] }) => {
  return (
    <>
      {files.length > 0 ? (
        files.map((doc) => {
          const byteCharacters = atob(doc.fileContents);
          const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: doc.contentType });
          const downloadUrl = URL.createObjectURL(blob);

          return (
            <div>
              <div className="doc-line" key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, }}>
                {doc.fileName}
                <a
                  href={downloadUrl}
                  download={doc.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="download-icon">
                    <FeatherIcon size={16} icon="download" />
                  </span>
                </a>
              </div>
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
    <>{
        requestLoading
            ? <Loader><Spin /> </Loader>
            :
            <>
                <CardToolbox>
                    <PageHeader title={t('my-orders-view-details', 'My Orders Details')} buttons={[
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
                              <h5 style={{fontWeight:'bold', marginBottom:20}}>{t('my-orders-view-details', 'My Orders Details:')}</h5>
                                <CardKeyValue>
                                <span>{t("my-shipments:details.pod-confirmed", "Proof of Delivery Confirmed:")}</span>
                                <p>{details?.podConfirmedDate ? new Date(details.podConfirmedDate).toLocaleString() : t("common:not-yet", "Not Yet")}</p>
                                </CardKeyValue>

                                {/* <CardKeyValue>
                                     <span>{t("common:download-files", "Download Files")}</span>
                                    <div className="doc-line">
                                    Document 01: Title 01{" "}
                                    <span className="download-icon">
                                        <FeatherIcon size={16} icon="download" />
                                        </span>
                                    </div>
                                </CardKeyValue> */}
                                <CardKeyValue>
                                  <span>{t("common:download-files", "Download Files")}</span>
                                  <p>{details?.uploadPODFiles && (
                                    <PodDocumentsDownload files={details.uploadPODFiles as PODFile[]} />
                                  )}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                <span>{t("my-shipments:details.pod-confirmed", "Proof of Delivery Confirmed:")}</span>
                                <p>{details?.podConfirmedDate ? new Date(details.podConfirmedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                <span>{t("my-shipments:details.pickup-confirmed", "Pickup Confirmed:")}</span>
                                <p>{details?.pickupConfirmedDate ? new Date(details.pickupConfirmedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                <span>{t("my-shipments:details.delivery-confirmed", "Delivery Confirmed:")}</span>
                                <p>{details?.deliveryConfirmedDate ? new Date(details.deliveryConfirmedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                <span>{t("my-shipments:details.truck-assigned", "Truck Assigned:")}</span>
                                <p>{details?.truckAssignedDate ? new Date(details.truckAssignedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>

                                <CardKeyValue>
                                    <span>{t("my-shipments:details.offer-booked", "Offer Booked:")}</span>
                                    <p>{details?.offerBookedAt ? new Date(details.truckAssignedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                    <span> {t("my-shipments:details.request-created", "Request Created:")}</span>
                                    <p>{details?.requestCreatedAt ? new Date(details.truckAssignedDate).toLocaleString() : "-"}</p>
                                </CardKeyValue>
                            </Col>

                            <Col xs={24} sm={24} md={12} lg={8} >
                            <h5 style={{fontWeight:'bold', marginBottom:20}}>{t("truck-driver-info", "Truck & Driver Informations:")}</h5>
                                <CardKeyValue>
                                <span>{t("driver-first-name", "Truck Driver First Name:")}</span>
                                <p>{details?.shipmentAssignTrucks?.truckDriverFirstName || "-"}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                <span>{t("driver-last-name", "Truck Driver Last Name:")}</span>
                                <p>{details?.shipmentAssignTrucks?.truckDriverLastName || "-"}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                <span>{t("driver-phone", "Phone Number:")}</span>
                                <p>{details?.shipmentAssignTrucks?.phoneNumber || "-"}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                <span>{t("driver-passport", "Passport ID:")}</span>
                                <p>{details?.shipmentAssignTrucks?.passportId || "-"}</p>
                                </CardKeyValue>
                                <CardKeyValue>
                                <span>{t("truck-number", "Truck Number:")}</span>
                                <p>{details?.shipmentAssignTrucks?.truckNumber || "-"}</p>
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

export default ViewIconOrderDetailsPage;

