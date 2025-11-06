import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Pagination, Button, Input, Popconfirm } from 'antd';
import { useTranslation } from "react-i18next";
import { PageHeader } from '../../components/page-headers/page-headers';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { CardToolbox, Main } from 'container/styled';
import { UsercardWrapper } from 'pages/style';
import { ProjectSorting } from 'pages/localization/email/style';
//@ts-ignore
import FeatherIcon from 'feather-icons-react';
import { ExportButtonPageApiHeader } from 'components/buttons/export-button/export-button-api';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { RequestsApi } from 'api/api';
import openNotificationWithIcon from 'utility/notification';
import { formatDate2 } from 'api/common';

const ManageTransportOffers = ({ offer }: { offer?: any }) => {
  const searchTimeout = useRef<any>();
  const { t } = useTranslation();
  const requestsApi = new RequestsApi();
  const params = useParams();
  const [offers, setOffers] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const onPaginationChange = (page: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, page }));
  };

  const onShowSizeChange = (page: number, size?: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, page, size }));
  };

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  const updateOfferMargin = (id: any, value: any) => {
    setOffers((prevOffers) =>
      prevOffers.map((offer) => {
        if (offer.id === id) {
          const basePrice = Number(offer.price.split(" ")[0]) || 0;
          const margin = parseFloat(value) || 0;
          const newDisplayPrice = `${(basePrice + basePrice * (margin / 100)).toFixed(2)}`;

          return {
            ...offer,
            margin: value,
            displayPrice: newDisplayPrice,
          };
        }
        return offer;
      })
    );
  };



  useEffect(() => {
    fetchOffers();
  }, [query, params.id]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await requestsApi.apiOfferSuperAdminGet({ ...query, idNumber: params.id });

      const apiData = response.data?.items || [];
      const total = response.data?.totalCount || 0;

      const formatted = apiData.map((items: any, index: number) => ({
        id: items.id,
        offerNo: `Offer No.${index + 1}`,
        price: `${items.price}`,
        currencyName: `${items.currencyName ?? "EUR"}`,
        displayPrice: `${items.price}`,
        provider: items.truckTypeName || "N/A",
        possiblePickup: items.estimatedPickupDateTime,
        requestedDelivery: items.estimatedDeliveryDateTime,
        pickupDateFrom: items.pickupDateFrom,
        pickupDateTo: items.pickupDateTo,
        deliveryDateFrom: items.deliveryDateFrom,
        deliveryDateTo: items.deliveryDateTo
      }));

      setOffers(formatted);
      setTotalCount(total);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading offers:", error);
    }
  };

  const handleSubmitToShipper = async (offer: any) => {
    setIsLoading(true);
    try {
      const data = {
        id: offer.id,
        profitMargin: parseFloat(offer.margin || "0"),
        adminApprovedPrice: parseFloat(offer.displayPrice?.toString().split(" ")[0] || "0"),
      }
      const response = await requestsApi.apiAdminApprovedOfferPut({ transportRequestId: params.id as string, submitOfferTransportManageDto: data });
      if (response.status === 200) {
        openNotificationWithIcon(
          "success",
          t("requests:success-offer-approval", "Offer approved successfully")
        );

      }
      fetchOffers();
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOffer = async (offer: any) => {
    setIsLoading(true);
    try {
      const data = {
        id: offer.id
      }
      const response = await requestsApi.apiTransportManagementIdRejectOfferPut({
        transportRequestId: params.id as string,
        submitOfferTransportManageDto:data,
      });

      if (response.status === 200) {
        openNotificationWithIcon(
          "success",
          t("offerCard.cancelSuccess", "Offer rejected successfully")
        );
      }

      fetchOffers();
    } catch (error) {
      console.error("Error rejecting offer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t(
            "manage-transport-offers.title",
            "Manage Transport Requests"
          )}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"TransportOffers"}
              filterType={0}
              municipalityId={""}
              entityId={""}
              search={""}
              from={""}
              to={""}
              typeOfEquipmentId={""}
            />,
          ]}
          subTitle={
            <>
              {offers?.length}{" "}
              {t(
                "manage-transport-offers:total-active-offers",
                "Total Active Offers"
              )}
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div
                    className="project-sort-search"
                    style={{ marginTop: "25px" }}
                  >
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
            </>
          }
        />
      </CardToolbox>
      <Main>
        <UsercardWrapper className="manage-transport-offers">
          <Row gutter={25}>
            {offers.map((offer) => (
              <Col key={offer.id} xxl={8} md={12} sm={24} xs={24}>
                <div className="card-container">
                  <div className="card-header">
                    <span className="card-header-title">{offer.offerNo}</span>
                  </div>

                  <span className="card-price-container">
                    <div className="card-price">
                      <div className="card-price-stack">
                        <span className="card-price-text">
                          {offer.price}
                        </span>
                        <span className="card-price-texts">
                          {offer.currencyName}
                        </span>
                      </div>
                    </div>
                    <div className="card-provider">{offer.provider}</div>
                  </span>

                  <div className="card-margin-container">
                    <span className="card-margin-label">
                      {t("manage-transport-offers.margin", "Margin %")}
                    </span>
                    <Input
                      className="card-margin-value"
                      value={offer.margin}
                      onChange={(e) =>
                        updateOfferMargin(offer.id, e.target.value)
                      }
                      style={{ width: 70, marginLeft: 8 }}
                      placeholder="0"
                    />
                  </div>

                  <div className="card-content">
                    <div className="card-info">
                      <div className="card-info-item">
                        <span style={{ marginLeft: 30 }}>
                          {t(
                            "manage-transport-offers.possible-pickup",
                            "Possible Pickup"
                          )}
                        </span>
                        <br />
                        <span className="card-info-text">
                          {formatDate2(offer?.pickupDateFrom)}
                          <FeatherIcon
                            size={16}
                            icon="corner-up-right"
                            style={{
                              color: "#6563ff",
                              margin: "0 8px",
                              fontSize: "18px",
                              verticalAlign: "middle",
                            }}
                          />
                          {formatDate2(offer?.pickupDateTo)}
                        </span>
                      </div>
                      <div
                        className="card-info-item"
                        style={{ textAlign: "right" }}
                      >
                        <span style={{ marginRight: 20 }}>
                          {t(
                            "manage-transport-offers.requested-delivery",
                            "Requested Delivery"
                          )}
                        </span>
                        <br />

                        <span className="card-info-text">
                          {formatDate2(offer?.deliveryDateFrom)}
                          <FeatherIcon
                            size={16}
                            icon="corner-up-right"
                            style={{
                              color: "#6563ff",
                              margin: "0 8px",
                              fontSize: "18px",
                              verticalAlign: "middle",
                            }}
                          />
                          {formatDate2(offer?.deliveryDateTo)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 500,
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      {t(
                        "manage-transport-offers.display-price",
                        "Display Price"
                      )}
                      : {offer.displayPrice + " " + offer.currencyName}
                    </div>

                    <div className="card-buttons">
                      <Button
                        htmlType="submit"
                        className="card-button"
                        onClick={() => handleSubmitToShipper(offer)}
                        style={{
                          border: "1px solid #e4e4e4",
                          backgroundColor: "#21C998",
                          color: "#fff",
                        }}
                      >
                        {t(
                          "manage-transport-offers.submit",
                          "Submit To Shipper"
                        )}
                      </Button>
                      <Popconfirm
                        title={t(
                          "institutions.reject-offer",
                          "Are you sure reject this offer?"
                        )}
                        onConfirm={() => handleRejectOffer(offer)}
                        okText={t("global.yes", "Yes")}
                        cancelText={t("global.no", "No")}
                      >
                        <Button
                          className="card-button"
                          style={{
                            border: "1px solid #FE6566",
                            color: "#FE6566",
                          }}
                        >
                          {t("manage-transport-offers.reject", "Reject")}
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </Col>
            ))}

            <Col xs={24}>
              <div className="pagination-container">
                <Pagination
                  showSizeChanger
                  current={query?.pageNumber}
                  total={totalCount}
                  pageSize={query.pageSize}
                  onChange={onPaginationChange}
                  onShowSizeChange={onShowSizeChange}
                  style={{ marginTop: 20, textAlign: "center" }}
                />
              </div>
            </Col>
          </Row>
        </UsercardWrapper>
      </Main>
    </>
  );
};

export default ManageTransportOffers;


