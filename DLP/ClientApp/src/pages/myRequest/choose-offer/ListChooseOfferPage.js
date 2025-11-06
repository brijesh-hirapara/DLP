import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Button, Progress, Pagination } from "antd";
import { PageHeader } from "components/page-headers/page-headers";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { ProjectSorting } from "pages/localization/email/style";
import { OfferCardStyled, CardToolbox } from "container/styled";
import { UserCard } from "pages/style";
import FeatherIcon from 'feather-icons-react';
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { RequestsApi } from "api/api";
import { useParams } from "react-router-dom";
import { formatDate2 } from "api/common";

const requestsApi = new RequestsApi();

const offers = [
  { id: 1, price: 120, currency: "EUR", number: "Offer No.01", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "4 Days", expiredTime: "1h 15m 30sec", progress: 60 },
  { id: 2, price: 150, currency: "EUR", number: "Offer No.02", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "2 Days", expiredTime: "2h 15m 30sec", progress: 40 },
  { id: 3, price: 180, currency: "EUR", number: "Offer No.03", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "3 Days", expiredTime: "00h 15m 30sec", progress: 90 },
  { id: 4, price: 200, currency: "EUR", number: "Offer No.04", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "1 Day", expiredTime: "1h 45m 20sec", progress: 20, warning: "The proposed schedule slightly differs from the originally requested delivery." },
  { id: 5, price: 220, currency: "EUR", number: "Offer No.05", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "4 Days", expired: true, progress: 100 },
  { id: 6, price: 280, currency: "EUR", number: "Offer No.06", pickup: "05.07.2025", delivery: "15.08.2025", loadTime: "5 Days", expiredTime: "00h 45m 10sec", progress: 70 },
];

function ListChooseOfferPage() {

  const { t } = useTranslation();
  const [chooseOfferData, setChooseOfferData] = useState();
  const searchTimeout = useRef();
  const params = useParams();
  

  // const [pageData, setPageData] = useState({
  //   pageIndex: 1,
  //   pageSize: 10,
  // });

  const [query, setQuery] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const [isLoading, setIsLoading] = useState(false);

  const totalOffers = offers.length;
  // const startIndex = (pageData.pageIndex - 1) * pageData.pageSize;

  const onSearchChange = (value) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  const onPaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  
  useEffect(() => {
    fetchOffers();
  }, [query,params.id]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await requestsApi.apiChooseOfferGet({
        ...query,idNumber:params.id,
      });
      setChooseOfferData(response.data);
    } catch (err) {
      // handle error if necessary
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <>
            <CardToolbox>
              <PageHeader
                ghost
                title={t("choose-offer.title","Choose Offer")}
                subTitle={
                  <>
                    {chooseOfferData?.totalCount}{" "}
                    {t("choose-offer:active-offers","Active Offers")}
                    <ProjectSorting>
                      <div className="project-sort-bar">
                        <div
                          className="project-sort-search"
                          style={{ marginTop: "25px" }}
                        >
                          <AutoComplete
                            onSearch={(value) => onSearchChange(value)}
                            placeholder={t(
                  "choose-offer.search-placeholder",
                  "Search Offer"
                )}
                            patterns
                          />
                        </div>
                      </div>
                    </ProjectSorting>
                  </>
                }
                buttons={[
                  <ExportButtonPageApiHeader
                    key="1"
                    callFrom={"choose-offer"}
                    filterType={0}
                    municipalityId={""}
                    entityId={""}
                    search={query.search}
                    typeOfEquipmentId={""}
                    from={""}
                    to={""}
                  />,
                ]}
              />
            </CardToolbox>

      <UserCard
              style={{
                padding: "20px 10px",
                maxWidth: "1440px",
                margin: "0 auto",
                boxSizing: "border-box",
                marginTop:'-40px'
              }}
              key={"choose-offer"}
                >
        <Row  
          gutter={[24, 24]}
          justify="start"
          style={{ width: "98%", margin: 0 }}
        >
          {chooseOfferData?.items.map((offer,index) => (
              <Col xl={8} lg={8} md={12} sm={12} xs={24} style={{ display: "flex" }}>
              <OfferCardStyled
                style={{
                  border:
                    offer.id === 4
                      ? "2px solid #F46A6A"
                      : offer.expired
                      ? "1px solid #FADCDC"
                      : "1px solid #E6E9F4",
                  backgroundColor: offer.expired ? "#FFF5F5" : "#fff",
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

              {offer.id === 4 && (
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
                        backgroundColor: offer.expired ? "#000" : "#5F63F2",
                        color: offer.expired ? "#fff" : "#fff",
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
                        opacity: offer.expired ? 0.6 : 1,
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
                          color: offer.expired ? "#777" : "#000",
                          wordWrap: "break-word",
                          textAlign: "left",
                          paddingLeft: 10
                        }}
                      >
                        {t("global:offer-no", "Offer No.") + String(index + 1).padStart(2, "0")}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", whiteSpace: "normal",wordBreak: "break-word",overflow: "visible", textAlign: "left", paddingLeft: 10}}>
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
                            color: offer.expired ? "#888" : "#111",
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
                            color: offer.expired ? "#999" : "#666",
                            fontSize: 13,
                          }}
                        >
                          {/* <span>{offer.pickup.split(" - ")[0] || offer.pickup}</span> */}
                          <span>{formatDate2(offer?.pickupDateFrom)}</span>
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
                          <span>{<span>{formatDate2(offer?.pickupDateTo)}</span>}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", marginTop: 30 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: offer.expired ? "#888" : "#111",
                            marginBottom: 6,
                          }}
                        >
                          {t("choose-offer.estimated-loadtime", "Estimated Load Time")}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: offer.expired ? "#999" : "#666",
                          }}
                        >
                          {offer.loadTime}
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
                            color: offer.expired ? "#888" : "#111",
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
                            color: offer.expired ? "#999" : "#666",
                            fontSize: 13,
                          }}
                        >
                          {/* <span>{offer.delivery.split(" - ")[0] || offer.delivery}</span> */}
                          <span>{formatDate2(offer?.deliveryDateFrom)}</span>
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
                          <span>{<span>{formatDate2(offer?.deliveryDateTo)}</span>}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "center", marginTop: 30 }}>
                      {offer.expired ? (
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
                            color: offer.expired ? "#888" : "#111",
                            marginBottom: 6,
                          }}
                        >
                          {t("choose-offer.offer-expired-time", "Offer Expired Time")}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: offer.expired ? "#F46A6A" : "#5F63F2",
                            fontWeight: 600,
                          }}
                        >
                          {offer.expiredTime}
                        </div>
                        </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>

                <Progress
                  percent={offer.progress}
                  showInfo={false}
                  strokeColor={offer.expired ? "#000" : "#5F63F2"} 
                  strokeWidth={4}
                  style={{ marginTop: 32 }}
                />

                {offer.warning && (
                  <div
                    style={{
                      color: "#F46A6A",
                      fontSize: 12,
                      marginTop: 10,
                      textAlign: "left",
                    }}
                  >
                    {offer.warning}
                  </div>
                )}
              
              {!offer.expired ? (               
                      <div className="card-buttons">
                      <Button
                        htmlType="submit"
                        className="card-button my-3"
                        style={{
                          border: "1px solid #e4e4e4",
                          backgroundColor: "#21C998",
                          color: "#fff",
                        }}
                      >
                        {t(
                          "choose-offer.book-now",
                          "Book Now"
                        )}
                      </Button>
                      <Button
                        className="card-button mx-3"
                        style={{
                          border: "1px solid #FE6566",
                          color: "#FE6566",
                        }}
                      >
                        {t("choose-offer.view", "View")}
                      </Button>
                    </div>
                     ) : "" }
                 </OfferCardStyled>
            </Col>
          ))}

              <Col xs={24}>
              <div className="user-card-pagination" style={{display: "flex", justifyContent: "end", marginRight: 50}}>
                <Pagination
                  current={chooseOfferData?.pageIndex}
                  total={chooseOfferData?.totalCount}
                  pageSize={query.pageSize}
                  showSizeChanger
                  pageSizeOptions= {[10, 50, 100, 1000]}
                  onChange={onPaginationChange}
                  onShowSizeChange={onShowSizeChange}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} offers`}
                />
              </div>
            </Col>
          </Row>
    </UserCard>
    </>
  );
}

export default ListChooseOfferPage;
