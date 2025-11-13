import { useEffect, useState } from "react";
import { RequestsApi, UserFilterType } from "../../api"
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Col, Form, Row, Spin } from "antd";
import { CardToolbox, Main } from "container/styled";
// @ts-ignore
import FeatherIcon from 'feather-icons-react';
import styled from "styled-components";
import { PageHeader } from "components/page-headers/page-headers";
import { Button } from "components/buttons/buttons";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";
import moment from "moment";

const requestsApi = new RequestsApi();

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const ManageTransportRequestDetailsPage = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const [requestsData, setRequestsData] = useState<any>(null);
    const [requestsLoading, setRequestsLoading] = useState(false);
    // const [requestsData, setRequestsData] =
    // useState<ListTransportManagementDtoPaginatedList>();

    const [query, setQuery] = useState<{
        status : any;   
        search: string;
        pageNumber: number;
        pageSize: number;
      }>({
        status: UserFilterType.ALL,  
        search: "",
        pageNumber: 1,
        pageSize: 10,
      });
      
      // When request.filterType changes, fetch data
      useEffect(() => {
        fetchRequests();
      }, [query]);

    const fetchRequests = async () => {
        try {
          setRequestsLoading(true);
          const response = await requestsApi.apiTransportManagementIdGet({
              transportRequestId: params.id as string
          });
          setRequestsData(response.data);
        } catch (err) {
            console.error("Error fetching request:", err);
        } finally {
            setRequestsLoading(false);
        }
      };

      const tableData = (Array.isArray(requestsData?.items) ? requestsData.items : [requestsData]).filter(Boolean).map((item: any) => {
        const pickupInfo = item.transportInformation?.[0] || {};
        const goods = item.transportGoods?.[0] || {};
        const pickup = item.transportPickup?.[0] || {};
        const delivery = item.transportDelivery?.[0] || {};

        const currency = pickupInfo?.currencyName || "EUR";

        const scheduleType = pickupInfo.dateSelectionOption  === undefined || pickupInfo.dateSelectionOption === 1
        ? "No Granted Dates"
        : pickupInfo.dateSelectionOption === 2
        ? "Select dates"
        : "N/A";

        const quantity = goods.quantity
        const goodsName = goods.typeOfGoodsName

        const specialConditionsText = [
            goods.isCargoNotStackable && "Cargo items are not stackable",
            goods.isIncludesAdrGoods && "Including ADR goods",
          ].filter(Boolean).join(", ") || "—";
          
        const pickupCompanyName = pickup.companyName
        const pickupCountry = pickup.countryName
        const pickupCity = pickup.city
        const pickupCompanyAddress = pickup.companyAddress
        const pickupCompanyPostalCode = pickup.postalCode
        const deliveryCompanyName = delivery.companyName
        const deliveryCountry = delivery.countryName
        const deliveryCity = delivery.city
        const deliveryCompanyAddress = delivery.companyAddress
        const deliveryCompanyPostalCode = delivery.postalCode
        const estimatedPickup =
          pickupInfo.pickupDateFrom && pickupInfo.pickupDateTo
            ? `${moment(pickupInfo.pickupDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.pickupDateTo).format("DD.MM.YYYY")}\n` +
            (pickupInfo.pickupTimeFrom || pickupInfo.pickupTimeTo
              ? `${moment(pickupInfo.pickupTimeFrom).format("HH:mm")} - ${moment(pickupInfo.pickupTimeTo).format("HH:mm")}\n`
              : '') 
            : "N/A";
    
        const estimatedDelivery =
          pickupInfo.deliveryDateFrom && pickupInfo.deliveryDateTo
            ? `${moment(pickupInfo.deliveryDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.deliveryDateTo).format("DD.MM.YYYY")}\n` +
            (pickupInfo.deliveryTimeFrom && pickupInfo.deliveryTimeTo
              ? `${moment(pickupInfo.deliveryTimeFrom).format("HH:mm")} - ${moment(pickupInfo.deliveryTimeTo).format("HH:mm")}\n`
            : "") 
        : "N/A";

        const accessibility = item.accessibility === 1
        ? "Commercial with ramp but with lift"
        : item.accessibility === 2
        ? "Commercial without ramp but with forklift"
        : item.accessibility === 3
        ? "Commercial without forklift or ramp"
        : "N/A";

        const length = (goods.length || 0);
        const width = (goods.width || 0);
        const height = (goods.height || 0);
        const weight = (goods.weight || 0);
        const ldmValue = length && width && height ? (length * width * height) : 0;
    
        const sideLength = Math.cbrt(ldmValue);
    
        const ldmText = ` ${ldmValue.toFixed(2)} m³`;
        const sideText = ` ${sideLength.toFixed(2)} m`; // Cube root as string with two decimals
    
    
        const goodsStr = `LDM ${sideText || 0} \nWeight ${goods.weight || 0} kg`;
        const totalDistance = item.totalDistance ? `${item.totalDistance} km` : '';

        return {
            key: item.id,
            transportRequestId: item.id,
            requestId: item.requestId,
            shipperName: item.shipperName || "",
            posiblePickup: estimatedPickup,
            pickupCompanyName: pickupCompanyName,
            pickupCountry: pickupCountry,
            pickupCity: pickupCity,
            pickupCompanyAddress: pickupCompanyAddress,
            pickupCompanyPostalCode: pickupCompanyPostalCode,
            deliveryCompanyName: deliveryCompanyName,
            deliveryCountry: deliveryCountry,
            deliveryCity: deliveryCity,
            deliveryCompanyAddress: deliveryCompanyAddress,
            deliveryCompanyPostalCode: deliveryCompanyPostalCode,
            requestedDelivery: estimatedDelivery,
            totalDistance: totalDistance,
            accessibility: accessibility,
            goodsName: goodsName,
            goods: goodsStr,
            width: width,
            height: height,
            length: length,
            weight: weight,
            quantity: quantity,
            ldmText: ldmText,
            currency: currency,
            scheduleType: scheduleType,
            specialConditions: specialConditionsText,
            status: (item.statusDesc || "",""),
            lowestPrice: item.transportCarrier?.[0]?.price || "-",
            carrierCount:item.carrierCount,
            adminOfferCount:item.adminOfferCount,
          };
    });

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

    return (
        <>{
            requestsLoading
                ? <Loader><Spin /> </Loader>
                :
                <>
                    <CardToolbox>
                        <PageHeader title={t('requests:details-title', 'Details of request')} buttons={[
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
                                    <h5 style={{fontWeight:'bold', marginBottom:20}}>{t("new-transport-request-review.route-header", "Route Information")}</h5>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-pickUp", "Possible Pick-Up:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <>
                                                        <p key={index}>{t("global.company-name", "Company Name")}: {data.pickupCompanyName}</p>
                                                        <p key={index}>{t("global.country", "Country")}: {data.pickupCountry}</p>
                                                        <p key={index}>{t("global.city", "City")}: {data.pickupCity}</p>
                                                        <p key={index}>{t("global.company-address", "Company Address")}: {data.pickupCompanyAddress}</p>
                                                        <p key={index}>{t("global.postal-code", "Postal Code")}: {data.pickupCompanyPostalCode}</p>
                                                    </>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-requestedDelivery", "Requested Delivery:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <>
                                                        <p key={index}>{t("global.company-name", "Company Name")}: {data.deliveryCompanyName}</p>
                                                        <p key={index}>{t("global.country", "Country")}: {data.deliveryCountry}</p>
                                                        <p key={index}>{t("global.city", "City")}: {data.deliveryCity}</p>
                                                        <p key={index}>{t("global.company-address", "Company Address")}: {data.deliveryCompanyAddress}</p>
                                                        <p key={index}>{t("global.postal-code", "Postal Code")}: {data.deliveryCompanyPostalCode}</p>
                                                    </>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-totalDistance", "Total Distance:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.totalDistance}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-accessType", "Access Type:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.accessibility}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                </Col>

                                <Col xs={24} sm={24} md={12} lg={8} >
                                    <h5 style={{fontWeight:'bold', marginBottom:20}}>{t("new-transport-request-review.goods-header", "Goods Details")}</h5>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.typeOfGoods", "Type of Goods:")}</strong>{" "}
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.goodsName}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-Dimensions-per-item", "Dimensions per item:")}</strong> 
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}>Length: {data.length}m, Width: {data.width}m, Heigth: {data.height}m, Weight: {data.weight}kg</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-Quantity", "Quantity:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.quantity}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-LDM-per-item", "LDM per item:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.ldmText}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-special-conditions", "Special Conditions:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.specialConditions}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                </Col>
                                
                                <Col xs={24} sm={24} md={12} lg={8} >
                                    <h5 style={{fontWeight:'bold', marginBottom:20}}>{t("new-transport-request-review.info-header", "Additional Information")}</h5>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.info-scheduleType", "Schedule Type:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.scheduleType}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.info-pickUp-dateTime", "Possible Pick-Up Date Range:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.posiblePickup}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.info-delivery-dateTime", "Requested Delivery Date Range:")}</strong>
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.requestedDelivery}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                        <CardKeyValue>
                                            <strong style={{ color: '#333' }}>{t("new-transport-request-review.info-currency", "Currency:")}</strong>{" "}
                                            <div>
                                                {tableData.map((data: any, index: number) => (
                                                    <p key={index}> {data.currency}</p>
                                                ))}
                                            </div>
                                        </CardKeyValue>
                                </Col>
                            </Row>
                        </Card>
                    </Main>
                  </>
            }
        </>
    );
}

export default ManageTransportRequestDetailsPage
