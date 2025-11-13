import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Button, Progress, Pagination, Popconfirm, Tooltip } from "antd";
import { PageHeader } from "components/page-headers/page-headers";
import { OfferCardStyled, CardToolbox, Main } from "container/styled";
import FeatherIcon from 'feather-icons-react';
import { RequestsApi } from "api/api";
import { useNavigate, useParams } from "react-router-dom";
import { convertUTCToLocal, formatDate2 } from "api/common";
import openNotificationWithIcon from "utility/notification";
import { CountdownTimerForExpire } from "utility/CountdownTimer/CountdownTimer";
import dayjs from "dayjs";
import startConnection from "pages/requests/RequestSignalRService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const requestsApi = new RequestsApi();

function ListChooseOfferPage() {

  const { t } = useTranslation();
  const [chooseOfferData, setChooseOfferData] = useState();
  const params = useParams();
  const [connection, setConnection] = useState(null);
  const navigate = useNavigate();

  const [query, setQuery] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const [isLoading, setIsLoading] = useState(false);

  const onPaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const isExpired = (date) => {
    if (!date) return true; // treat missing date as expired
    const currentDate = convertUTCToLocal(date)
    console.log(currentDate, "currentDate");
    const targetTime = new Date(currentDate).getTime();
    const now = new Date().getTime();
    return now > targetTime; // true means expired
  };

  const getDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return 0; // return 0 if either date is missing

    const start = new Date(startDate);
    const end = new Date(endDate);

    // check for invalid date
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffInMs = end.getTime() - start.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // full days difference
  };

  const getExpiryProgressPercent = (expiryDateTime, totalDurationMinutes = 360) => {
    const currentDate = convertUTCToLocal(expiryDateTime)
    const end = dayjs(currentDate);
    const now = dayjs();

    if (!end.isValid()) return 0;
    if (now.isAfter(end)) return 100;

    const remaining = end.diff(now, "minute");
    const percentElapsed = ((totalDurationMinutes - remaining) / totalDurationMinutes) * 100;

    return Math.min(Math.max(percentElapsed, 0), 100);
  };

  useEffect(() => {
    fetchOffers();
  }, [query, params.id]);

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
    const connection = await startConnection(onReceiveBid);
    setConnection(connection);
  };

  const onReceiveBid = async (id, price) => {
    // Handle the received bid data
    await fetchOffers();
  };

  // Signal R code End

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await requestsApi.apiChooseOfferGet({
        ...query, idNumber: params.id,
      });
      setChooseOfferData(response.data);
    } catch (err) {
      // handle error if necessary
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (offer) => {
    setIsLoading(true);
    try {
      const response = await requestsApi.apiChooseOfferPut(
        { transportRequestId: params.id, transportCarrierId: offer.id }
      );
      if (response.status === 200) {
        openNotificationWithIcon(
          "success",
          t("requests:success-offer-approval", "Offer approved successfully")
        );
        navigate("/my-requests");

      }
      fetchOffers();
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (offerId) => {
    const cardElement = document.getElementById(`offer-card-${offerId}`);
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Offer_${offerId}.pdf`);
    } catch (err) {
      console.error("PDF Download Error:", err);
    }
  };


  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("choose-offer.title", "Choose Offer")}
          subTitle={
            <>
              {chooseOfferData?.totalCount}{" "}
              {t("choose-offer:active-offers", "Active Offers")}
            </>
          }
        />
      </CardToolbox>

      <Main
        style={{
          padding: "20px 10px",
          maxWidth: "1440px",
          margin: "0 auto",
          boxSizing: "border-box",
          marginTop: '-40px'
        }}
        key={"choose-offer"}
      >
        <Row
          gutter={[24, 24]}
          justify="start"
          style={{ width: "98%", margin: 0 }}
        >
          {chooseOfferData?.items.map((offer, index) => (
            <Col xl={8} lg={8} md={12} sm={12} xs={24} style={{ display: "flex" }} key={offer.id}>
              <OfferCardStyled
                id={`offer-card-${offer.id}`}
                style={{
                  border:
                    !isExpired(offer?.expiryDateTime) && offer.isScheduleDiffers
                      ? "2px solid #F46A6A"
                      : isExpired(offer?.expiryDateTime)
                        ? "1px solid #FADCDC"
                        : "1px solid #E6E9F4",
                  backgroundColor: isExpired(offer?.expiryDateTime) ? "#FFF5F5" : "#fff",
                  borderRadius: 12,
                  padding: 20,
                  paddingBottom: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  height: "100%",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.05)",
                  width: "400px",
                  position: "relative",
                  overflow: "visible",
                }}
                key={offer.id}
              >

                {!isExpired(offer?.expiryDateTime) && offer.isScheduleDiffers && (
                  <Tooltip title={t(
                    "choose-offer.schedule-slightly-differs",
                    "The proposed schedule slightly differs from the originally requested delivery."
                  )}>
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        left: 169,
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F46A6A",
                        fontSize: 14,
                        border: "1px solid #F46A6A",
                      }}
                    >
                      !
                    </div>
                  </Tooltip>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isExpired(offer?.expiryDateTime) ? "#000" : "#5F63F2",
                        color: isExpired(offer?.expiryDateTime) ? "#fff" : "#fff",
                        borderRadius: "50%",
                        width: 72,
                        height: 72,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                        opacity: isExpired(offer?.expiryDateTime) ? 0.6 : 1,
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{offer.adminApprovedPrice}</div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{offer.currencyName ? offer.currencyName : "EUR"}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 17,
                          color: isExpired(offer?.expiryDateTime) ? "#777" : "#000",
                          wordWrap: "break-word",
                          textAlign: "left",
                          paddingLeft: 10
                        }}
                      >
                        {t("global:offer-no", "Offer No.") + String(index + 1).padStart(2, "0")}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", whiteSpace: "normal", wordBreak: "break-word", overflow: "visible", textAlign: "left", paddingLeft: 10 }}>
                        {/* {(t("choose-offer.description", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam"))} */}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 30, flexGrow: 1 }}>
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: isExpired(offer?.expiryDateTime) ? "#888" : "#111",
                            marginBottom: 4,
                          }}
                        >
                          {t("choose-offer.possible-pickup", "Possible Pickup")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            color: isExpired(offer?.expiryDateTime) ? "#999" : "#666",
                            fontSize: 13,
                          }}
                        >
                          {/* <span>{offer.pickup.split(" - ")[0] || offer.pickup}</span> */}
                          <span>{formatDate2(offer?.estimatedPickupDateTimeFrom)}</span>
                          <FeatherIcon
                            size={16}
                            icon="corner-up-right"
                            style={{
                              color: "#6563ff",
                              fontSize: "18px",
                              verticalAlign: "middle",
                            }}
                          />
                          {/* <span>{offer.pickup.split(" - ")[1] || offer.delivery}</span> */}
                          <span>{<span>{formatDate2(offer?.estimatedPickupDateTimeTo)}</span>}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", marginTop: 30 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: isExpired(offer?.expiryDateTime) ? "#888" : "#111",
                            marginBottom: 6,
                          }}
                        >
                          {t("choose-offer.estimated-loadtime", "Estimated Load Time")}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: isExpired(offer?.expiryDateTime) ? "#999" : "#666",
                          }}
                        >
                          {`${getDaysBetween(offer?.estimatedPickupDateTimeFrom, offer?.estimatedDeliveryDateTimeTo)} ${getDaysBetween(offer?.estimatedPickupDateTimeFrom, offer?.estimatedDeliveryDateTimeTo) > 1
                            ? t("global.days", "Days")
                            : t("global.day", "Day")
                            }`}
                        </div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            fontSize: 13,
                            color: isExpired(offer?.expiryDateTime) ? "#888" : "#111",
                            marginBottom: 6,
                          }}
                        >
                          {t("choose-offer.requested-delivery", "Requested Delivery")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            color: isExpired(offer?.expiryDateTime) ? "#999" : "#666",
                            fontSize: 13,
                          }}
                        >
                          {/* <span>{offer.delivery.split(" - ")[0] || offer.delivery}</span> */}
                          <span>{formatDate2(offer?.estimatedDeliveryDateTimeFrom)}</span>
                          <FeatherIcon
                            size={16}
                            icon="corner-up-right"
                            style={{
                              color: "#6563ff",
                              fontSize: "18px",
                              verticalAlign: "middle",
                            }}
                          />
                          {/* <span>{offer.delivery.split(" - ")[1] || "16.08.2025"}</span> */}
                          <span>{<span>{formatDate2(offer?.estimatedDeliveryDateTimeTo)}</span>}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", marginTop: 30 }}>
                        {isExpired(offer?.expiryDateTime) ? (
                          <div
                            style={{
                              fontSize: 15,
                              color: "#F46A6A",
                              fontWeight: 700,
                            }}
                          >
                            {t("choose-offer.expired", "Expired")}
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: isExpired(offer?.expiryDateTime) ? "#888" : "#111",
                                marginBottom: 6,
                              }}
                            >
                              {t("choose-offer.offer-expired-time", "Offer Expired Time")}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: isExpired(offer?.expiryDateTime) ? "#F46A6A" : "#5F63F2",
                                fontWeight: 600,
                              }}
                            >
                              <CountdownTimerForExpire startTime={offer.expiryDateTime} duration={24} />
                            </div>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>

                <Progress
                  percent={getExpiryProgressPercent(offer.expiryDateTime)}
                  showInfo={false}
                  strokeColor={isExpired(offer?.expiryDateTime) ? "#000" : "#5F63F2"}
                  strokeWidth={4}
                  style={{ marginTop: 32 }}
                />

                {!isExpired(offer?.expiryDateTime) && offer.isScheduleDiffers && (
                  <div
                    style={{
                      color: "#F46A6A",
                      fontSize: 12,
                      marginTop: 10,
                      textAlign: "left",
                    }}
                  >
                    {t(
                      "choose-offer.schedule-slightly-differs",
                      "The proposed schedule slightly differs from the originally requested delivery."
                    )}
                  </div>
                )}

                {!isExpired(offer?.expiryDateTime) ? (
                  <div className="card-buttons d-flex justify-content-center my-3">
                    <Popconfirm
                      title={t(
                        "my-request.choose-offer",
                        "Are you sure you want to book this offer?"
                      )}
                      onConfirm={() => handleSubmit(offer)}
                      okText={t("global.yes", "Yes")}
                      cancelText={t("global.no", "No")}
                    >
                      <Button
                        htmlType="submit"
                        className="card-button"
                        style={{
                          border: "1px solid #e4e4e4",
                          backgroundColor: "#21C998",
                          color: "#fff",
                        }}
                      >
                        {t(
                          "review-offer.accept-offer",
                          "Accept Offer"
                        )}
                      </Button>
                    </Popconfirm>

                    <Button
                      className="card-button mx-2"
                      onClick={() => handleDownloadPDF(offer.id)}
                      style={{
                        border: "1px solid #5F63F2",
                        color: "#5F63F2",
                        backgroundColor: "#fff",
                      }}
                    >
                      {t("choose-offer.download-pdf", "Download PDF")}
                    </Button>
                    {/* <Button
                        className="card-button mx-3"
                        style={{
                          border: "1px solid #FE6566",
                          color: "#FE6566",
                        }}
                      >
                        {t("choose-offer.view", "View")}
                      </Button> */}
                  </div>
                ) : ""}
              </OfferCardStyled>
            </Col>
          ))}

          <Col xs={24}>
            <div className="user-card-pagination" style={{ display: "flex", justifyContent: "end" }}>
              <Pagination
                current={chooseOfferData?.pageIndex}
                total={chooseOfferData?.totalCount}
                pageSize={query.pageSize}
                showSizeChanger
                pageSizeOptions={[10, 50, 100, 1000]}
                onChange={onPaginationChange}
                onShowSizeChange={onShowSizeChange}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} offers`}
              />
            </div>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ListChooseOfferPage;
