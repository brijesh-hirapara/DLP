import {
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Button,
  Select,
  Pagination,
  Typography,
  Popconfirm,
  Form,
  Empty
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useCallback, useMemo } from "react";
import styled from "styled-components";
import moment from "moment";
import {
  Main,
  Main as MainBase,
  Panel,
  OfferCardStyled,
  OfferFormBg,
  OfferFormRow,
  SectionHeader,
  InfoLabel,
  InfoValue,
  ErrorText,
} from "container/styled";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { Link } from "react-router-dom";
import { ProjectSorting } from "pages/localization/email/style";
import {
  CodebookDto,
  ListRequestDtoPaginatedList,
  UserFilterType,
  VehicleFleetRequestStatus,
} from "api/models";
import { useTranslation } from "react-i18next";
import { useAuthorization } from "hooks/useAuthorization";
import { RequestsApi } from "api/api";
import { SubmitOfferTransportManageDto } from "api/models/submit-offer-transport-manage-dto";
import openNotificationWithIcon from "utility/notification";
import { CodebookApi } from "api/api";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";
import { Cards } from "components/cards/frame/cards-frame";
import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";

import startConnection from "pages/requests/RequestSignalRService";
import { HubConnection } from "@microsoft/signalr";
import { OfferCard } from "./OfferCard";

const requestsApi = new RequestsApi();
const codebooksApi = new CodebookApi();


export const SubmitOfferPage = () => {


  const getAccessibilityDescription = (accessibility: number | undefined) => {
    switch (accessibility) {
      case 1:
        return "Commercial with ramp but with lift";
      case 2:
        return "Commercial without ramp but with forklift";
      case 3:
        return "Commercial without forklift or ramp";
      default:
        return "No Access Info";
    }
  };
  

const [routeInfo, setRouteInfo] = useState({
    pickup: "",
    delivery: "",
    distance: "",
    access: "",
  });

  const [goodsInfo, setGoodsInfo] = useState({
    type: "",
    quantity: 0,
    dims: "",
    ldm: "",
    special: "",
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    pickupRange: "",
    deliveryRange: "",
    currency: "",
  });

    const defaultRouteInfo = {
    pickup: "",
    delivery: "",
    distance: "",
    access: "",
  };
  const defaultGoodsInfo = {
    type: "",
    quantity: 0,
    dims: "",
    ldm: "",
    special: "",
  };
  const defaultAdditionalInfo = {
    pickupRange: "",
    deliveryRange: "",
    currency: "",
    requestDateTime: moment(),
  };

  // const [forms, setForms] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [trailertypeOptions, setTrailertypeOptions] = useState<CodebookDto[]>(
    []
  );
  const [transportDetails, setTransportDetails] =
    useState<ListTransportManagementDtoPaginatedList | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [routeInfos, setRouteInfos] = useState<
    Record<string, typeof routeInfo>
  >({});
  const [goodsInfos, setGoodsInfos] = useState<
    Record<string, typeof goodsInfo>
  >({});
  const [additionalInfos, setAdditionalInfos] = useState<
    Record<string, typeof additionalInfo>
  >({});
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const inputWidth = 220;
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [request, setRequest] = useState<{
    status: VehicleFleetRequestStatus;
    search: string;
    pageNumber: number;
    pageSize: number;
    pickupDate: any;
    deliveryDate: any;
    pickupPostalCode: string;
    deliveryPostalCode: string;
    pickupDateRange: [moment.Moment] | null;
    deliveryDateRange: [moment.Moment] | null;
  }>({
    status: VehicleFleetRequestStatus.ALL,
    search: "",
    pageNumber: 1,
    pageSize: 2,
    pickupDate: "",
    deliveryDate: "",
    pickupPostalCode: "",
    deliveryPostalCode: "",
    pickupDateRange: null,
    deliveryDateRange: null,
  });

  const { RangePicker } = DatePicker;

  const truckTypeList = [
    { label: "Road Train", value: "Road Train" },
    { label: "Frigo Trailer", value: "Frigo Trailer" },
    { label: "7.5t", value: "7.5t" },
    { label: "12t", value: "12t" },
    { label: "Flexible Trailer", value: "Flexible Trailer" },
  ];



  // ✅ Use ref to store debounced function
  const debouncedSearchRef = useRef<any>(null);

  // ✅ Initialize debounced search once
  useEffect(() => {
    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    debouncedSearchRef.current = debounce((value: string) => {
      setRequest((prev) => ({ ...prev, search: value, pageNumber: 1 }));
    }, 500);
  }, []);

  // const onSearchChange = (value: any) => {
  //   if (debouncedSearchRef.current) {
  //     debouncedSearchRef.current(value);
  //   }
  // };

  const onSearchChange = useCallback((value: any) => {
  if (debouncedSearchRef.current) {
    debouncedSearchRef.current(value);
  }
}, []); // ✅ Empty deps because debouncedSearchRef is stable

  const fetchRequestDetails = useCallback(async (params: any) => {
    setLoadingDetails(true);
    try {
      const response = await requestsApi.apiTransportManagementCarrierListGet(
        params
      );
      setTransportDetails(response.data);
    } catch (error) {
      // Handle error or notify user
    } finally {
      setLoadingDetails(false);
    }
  }, []); 

  const fetchCodebooks = useCallback(async () => {
    try {
      const { data } = await codebooksApi.apiCodebookGet();
      setTrailertypeOptions(data.TrailerType || []);
    } catch (e) {
      // handle error
    }
  }, []);

  useEffect(() => {
    fetchCodebooks();
  }, [fetchCodebooks]);


  useEffect(() => {
    fetchRequestDetails({
      search: request.search,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      status: request.status,
      pickupDate: request.pickupDateRange
      ? request.pickupDateRange[0].format("YYYY-MM-DD")
      : "",
      deliveryDate: request.deliveryDateRange
      ? request.deliveryDateRange[0].format("YYYY-MM-DD")
      : "",
      pickupPostalCode: request.pickupPostalCode || "",
      deliveryPostalCode: request.deliveryPostalCode || "",
    });
  }, [
    fetchRequestDetails,
    request.search,
    request.pageNumber,
    request.pageSize,
    request.status,
    request.pickupDateRange,
    request.deliveryDateRange,
    request.pickupPostalCode,
    request.deliveryPostalCode,
  ]);

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
      const connection:any = await startConnection(onReceiveBid);
      setConnection(connection);
    };
  
    const onReceiveBid = async (id: string, price: string) => {
      // Handle the received bid data
      await fetchRequestDetails({
        search: request.search,
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        pickupDate: request.pickupDateRange
          ? request.pickupDate.format("YYYY-MM-DD")
          : "",
        dropOffDate: request.deliveryDate
          ? request.deliveryDate.format("YYYY-MM-DD")
          : "",
        pickupPostalCode: request.pickupPostalCode || "",
        dropOffPostalCode: request.deliveryPostalCode || "",
      });
    };
  
  
    // Signal R code End

  useEffect(() => {
    if (transportDetails?.items?.length) {
      const newRouteInfos: Record<string, typeof routeInfo> = {};
      const newGoodsInfos: Record<string, typeof goodsInfo> = {};
      const newAdditionalInfos: Record<string, typeof additionalInfo> = {};

      transportDetails.items.forEach((item) => {
        // Compute routeInfo
        const pickup = item.transportPickup?.length
          ? item.transportPickup[0]
          : null;
        const delivery = item.transportDelivery?.length
          ? item.transportDelivery[0]
          : null;

        newRouteInfos[item.id as string] = {
          pickup: pickup
            ? `${pickup.city ?? ""}, ${pickup.postalCode ?? ""}, ${
                pickup.countryName ?? ""
              }`
            : "",
          delivery: delivery
            ? `${delivery.city ?? ""}, ${delivery.postalCode ?? ""}, ${
                delivery.countryName ?? ""
              }`
            : "",
          distance: `${item.totalDistance ?? 0} km`,
          access: getAccessibilityDescription(item.accessibility),
        };

        // Compute goodsInfo
        const goods = item.transportGoods?.length
          ? item.transportGoods[0]
          : undefined;
        if (goods) {
          const length = goods.length || 0;
          const width = goods.width || 0;
          const height = goods.height || 0;
          const ldmValue =
            length && width && height
              ? (length * width * height).toFixed(2)
              : "0";

          newGoodsInfos[item.id as string] = {
            type: goods.typeOfGoodsName ?? "N/A",
            quantity: goods.quantity ?? 0,
            dims: `Length: ${length}m, Width: ${width}m, Height: ${height}m, Weight: ${goods.weight ?? 0}kg`,
            ldm: ` ${ldmValue} m³`,
            special: [
              goods.isIncludesAdrGoods ? "ADR Included" : "",
              goods.isCargoNotStackable ? "Cargo items are not stackable" : "",
            ]
              .filter(Boolean)
              .join(", "),
          };
        } else {
          newGoodsInfos[item.id as string] = {
            type: "",
            quantity: 0,
            dims: "",
            ldm: "",
            special: "",
          };
        }

        // Compute additionalInfo
        const transportInformation = item.transportInformation?.length
          ? item.transportInformation[0]
          : null;
        if (transportInformation) {
          const pickupFrom = moment(transportInformation.pickupDateFrom).format(
            "DD.MM.YYYY"
          );
          const pickupTo = moment(transportInformation.pickupDateTo).format(
            "DD.MM.YYYY"
          );
          const pickupFromTime = transportInformation.pickupTimeFrom
            ? moment(transportInformation.pickupTimeFrom, "HH:mm").format(
                "HH:mm"
              )
            : "";
          const pickupToTime = transportInformation.pickupTimeTo
            ? moment(transportInformation.pickupTimeTo, "HH:mm").format("HH:mm")
            : "";
          const deliveryFrom = moment(
            transportInformation.deliveryDateFrom
          ).format("DD.MM.YYYY");
          const deliveryTo = moment(transportInformation.deliveryDateTo).format(
            "DD.MM.YYYY"
          );
          const deliveryFromTime = transportInformation.deliveryTimeFrom
            ? moment(transportInformation.deliveryTimeFrom, "HH:mm").format(
                "HH:mm"
              )
            : "";
          const deliveryToTime = transportInformation.deliveryTimeTo
            ? moment(transportInformation.deliveryTimeTo, "HH:mm").format(
                "HH:mm"
              )
            : "";

          newAdditionalInfos[item.id as string] = {
            pickupRange:
              pickupFrom === pickupTo
                ? pickupFrom
                : `${pickupFrom} - ${pickupTo}` +
                  (pickupFromTime || pickupToTime
                    ? `\n${pickupFromTime} - ${pickupToTime}`.trim()
                    : ""),
            deliveryRange:
              deliveryFrom === deliveryTo
                ? deliveryFrom
                : `${deliveryFrom} - ${deliveryTo}` +
                  (deliveryFromTime || deliveryToTime
                    ? `\n${deliveryFromTime} - ${deliveryToTime}`.trim()
                    : ""),
            currency: transportInformation.currencyName || "EUR",
            // createdAt: moment(item.createdAt),
            // requestDateTime: transportInformation.pickupDateFrom
            //   ? moment(transportInformation.pickupDateFrom)
            //   : moment(),
          };
        } else {
          newAdditionalInfos[item.id as string] = {
            pickupRange: "",
            deliveryRange: "",
            currency: "",
            // createdAt: moment(),
            // requestDateTime: moment(),
          };
        }
      });

      setRouteInfos(newRouteInfos);
      setGoodsInfos(newGoodsInfos);
      setAdditionalInfos(newAdditionalInfos);
    }
  }, [transportDetails]);

  const filteredItems = (transportDetails?.items ?? []).filter((item) => {
    let pickupMatch = true;
    let deliveryMatch = true;
    let pickupPostalMatch = true;
    let deliveryPostalMatch = true;

    // Pickup Date filter
    if (request.pickupDate && item.transportInformation?.[0]?.pickupDateFrom) {
      pickupMatch = moment(item.transportInformation[0].pickupDateFrom).isSame(
        request.pickupDate,
        "day"
      );
    }

    // Drop-off Date filter
    if (
      request.deliveryDate &&
      item.transportInformation?.[0]?.deliveryDateFrom
    ) {
      deliveryMatch = moment(
        item.transportInformation[0].deliveryDateFrom
      ).isSame(request.deliveryDate, "day");
    }

    // Pickup Postal Code filter
    if (request.pickupPostalCode && item.transportPickup?.[0]?.postalCode) {
      pickupPostalMatch = item.transportPickup[0].postalCode.includes(
        request.pickupPostalCode
      );
    }

    // Drop-off Postal Code filter
    if (request.deliveryPostalCode && item.transportDelivery?.[0]?.postalCode) {
      deliveryPostalMatch = item.transportDelivery[0].postalCode.includes(
        request.deliveryPostalCode
      );
    }

    return (
      pickupMatch && deliveryMatch && pickupPostalMatch && deliveryPostalMatch
    );
  });

  const handleCancel = async (itemId: string, itemData: any) => {
    const rejectdto: SubmitOfferTransportManageDto = {
      id: itemData?.transportCarrier[0]?.id,
    };
    try {
      await requestsApi.apiTransportManagementIdRejectOfferPut({
        transportRequestId: itemId,
        submitOfferTransportManageDto: rejectdto,
      });
      openNotificationWithIcon(
        "success",
        t("offerCard.cancelSuccess", "Offer rejected successfully")
      ); // Optionally refresh the list after rejection
      fetchRequestDetails({
        search: request.search,
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        pickupDate: request.pickupDateRange
          ? request.pickupDate.format("YYYY-MM-DD")
          : "",
        deliveryDate: request.deliveryDate
          ? request.deliveryDate.format("YYYY-MM-DD")
          : "",
        pickupPostalCode: request.pickupPostalCode || "",
        deliveryPostalCode: request.deliveryPostalCode || "",
      });
    } catch (error) {
      console.error(error);
      openNotificationWithIcon(
        "error",
        t("offerCard.cancelError", "Failed to reject offer")
      );
    }
  };


const handleSubmit = async (itemId: string, itemData: any, values: any) => {


  const dto: SubmitOfferTransportManageDto = {
    id: itemData?.transportCarrier[0]?.id,
    price: Number(values.netPrice),
    offerValidityDate: Number(values.validity),
    estimatedPickupDateTimeFrom: values.pickupDateTimeRange 
      ? moment(values.pickupDateTimeRange[0]).toISOString() 
      : null,
    estimatedPickupDateTimeTo: values.pickupDateTimeRange 
      ? moment(values.pickupDateTimeRange[1]).toISOString() 
      : null,
    estimatedDeliveryDateTimeFrom: values.deliveryDateTimeRange 
      ? moment(values.deliveryDateTimeRange[0]).toISOString() 
      : null,
    estimatedDeliveryDateTimeTo: values.deliveryDateTimeRange 
      ? moment(values.deliveryDateTimeRange[1]).toISOString() 
      : null,
    truckTypeId: values.truckType,
  };

  try {
    await requestsApi.apiTransportManagementIdSubmitOfferPut({
      transportRequestId: itemData?.id || "",
      submitOfferTransportManageDto: dto,
    });
    openNotificationWithIcon(
      "success",
      t("offerCard.success", "Offer submitted successfully")
    );

    // Refresh request details after submit
    fetchRequestDetails({
      search: request.search,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      status: request.status,
      pickupDate: request.pickupDateRange?.[0]?.format("YYYY-MM-DD") || "",
      deliveryDate: request.deliveryDateRange?.[0]?.format("YYYY-MM-DD") || "",
      pickupPostalCode: request.pickupPostalCode || "",
      deliveryPostalCode: request.deliveryPostalCode || "",
    });
  } catch (error) {
    console.error(error);
    openNotificationWithIcon(
      "error",
      t("offerCard.error", "Failed to submit offer")
    );
  }
};


  // const onSearchChange = (value: any) => {
  //   setRequest({ ...request, search: value });
  // };

//   const debouncedSearch = useCallback(
//   debounce((value: string) => {
//     setRequest((prev) => ({ ...prev, search: value, pageNumber: 1 }));
//   }, 500), // 500ms delay
//   []
// );
// const onSearchChange = (value: any) => {
//   debouncedSearch(value);
// };

  return (
    <Main>
      <div
        style={{
          fontWeight: 600,
          fontSize: 22,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        {t("submitOfferPage.submit-an-offer", "Submit an Offer")}
      </div>
      <Row gutter={25}>
        <Col xs={24}>
          <ProjectSorting>
            <div className="project-sort-bar">
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
          <Cards headless>
            <Row gutter={[15, 0]} justify="center" align="middle">
              <Col flex="70px">
                <Typography.Text strong>
                  {t("requests.filters", "Filters :")}
                </Typography.Text>
              </Col>
              <Col flex="1 1 0">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD.MM.YYYY"
                  placeholder={t("requests.pickupDate", "Pickup Date")}
                  onChange={(date) =>
                    setRequest((prev) => ({
                      ...prev,
                      pickupDateRange: date ? [date] : null,
                      pageNumber: 1,
                    }))
                  }
                />
                {/* <RangePicker
                  format="DD.MM.YYYY"
                  style={{ width: "100%" }}
                  onChange={(date) =>
                    setRequest((prev) => ({
                      ...prev,
                      pickupDate: date,
                      pageNumber: 1,
                    }))
                  }
                /> */}
              </Col>
              <Col flex="1 1 0">
                <Input
                  style={{ width: "100%" }}
                  placeholder={t(
                    "requests.pickupPostalCode",
                    "Pickup Postal Code"
                  )}
                  onChange={(e) =>
                    setRequest((prev) => ({
                      ...prev,
                      pickupPostalCode: e.target.value,
                      pageNumber: 1,
                    }))
                  }
                  allowClear
                />
              </Col>
              <Col flex="1 1 0">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD.MM.YYYY"
                  placeholder={t("requests.delivery-Date", "Delivery Date")}
                  onChange={(date) =>
                    setRequest((prev) => ({
                      ...prev,
                      deliveryDateRange: date ? [date] : null,
                      pageNumber: 1,
                    }))
                  }
                />
                {/* <RangePicker
                  format="DD.MM.YYYY"
                  style={{ width: "100%" }}
                  onChange={(date) =>
                    setRequest((prev) => ({
                      ...prev,
                      deliveryDate: date,
                      pageNumber: 1,
                    }))
                  }
                /> */}
              </Col>
              <Col flex="1 1 0">
                <Input
                  style={{ width: "100%" }}
                  placeholder={t(
                    "requests.delivery-PostalCode",
                    "Delivery Postal Code"
                  )}
                  onChange={(e) =>
                    setRequest((prev) => ({
                      ...prev,
                      deliveryPostalCode: e.target.value,
                      pageNumber: 1,
                    }))
                  }
                  allowClear
                />
              </Col>
            </Row>
          </Cards>
        </Col>
      </Row>
      <Panel>
{filteredItems.map((item) => {
  if (!item.id) return null;

  return (
    <OfferCard
      key={item.id}
      itemId={item.id}
      createdAt={item.createdAt}
      ordinalNumber={item.requestId}
      routeInfo={routeInfos[item.id] || defaultRouteInfo}
      goodsInfo={goodsInfos[item.id] || defaultGoodsInfo}
      additionalInfo={additionalInfos[item.id] || defaultAdditionalInfo}
      form={{}}
      errors={{}}
      handleInputChange={() => {}}
      handleSubmit={(values: any) => handleSubmit(item.id as string, item, values)}
      handleCancel={() => handleCancel(item.id as string, item)}
      truckTypeList={truckTypeList}
      inputWidth={inputWidth}
      trailertypeOptions={trailertypeOptions}
    />
  );
})}
      </Panel>
      {transportDetails && (
        <div style={{ textAlign: "right", margin: "24px 0" }}>
            {transportDetails?.totalCount === 0 && (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <Empty description={t("requests.noResults","No Data Found")} />
              </div>
            )}
          <Pagination
            current={request.pageNumber}
            pageSize={request.pageSize}
            total={transportDetails.totalCount}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            onChange={(page, pageSize) =>
              setRequest({ ...request, pageNumber: page, pageSize: pageSize })
            }
          />
        </div>
      )}
    </Main>
  );
};

export default SubmitOfferPage;

