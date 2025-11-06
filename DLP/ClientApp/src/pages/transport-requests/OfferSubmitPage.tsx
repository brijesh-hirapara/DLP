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
} from "antd";
import { useEffect, useState } from "react";
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

const requestsApi = new RequestsApi();
const codebooksApi = new CodebookApi();

// Single card component
export function OfferCard({
  itemId,
  ordinalNumber,
  routeInfo,
  goodsInfo,
  additionalInfo,
  form,
  errors,
  handleInputChange,
  handleSubmit,
  truckTypeList,
  inputWidth,
  isViewOnly,
  trailertypeOptions,
  handleCancel,
  createdAt,
  showDeadline = true,
}: any) {
  const { t } = useTranslation();
 const now = moment(); 
 const createdAtUtc = moment.utc(createdAt); 
 const minValidityHours = now.diff(createdAtUtc.local(), "hours") + 2;
  // const minValidityHours = now.diff(createdAt, "hours") + 2;

  const currency = additionalInfo?.currency || "EUR";
  const netPricePlaceholder = `Net Price ${currency}`;
  

  return (
    <OfferCardStyled>
      <div className="margin-top-32-14-0-14">
        <Col className="margin-top-neg-30">
          <div className="flex-between">
            <InfoLabel>
              {t("offerCard.no", "No.")} {ordinalNumber}
            </InfoLabel>
            {/* <div className="deadline">
               {t("offerCard.deadline", "Deadline")}: 
              <CountdownTimer startTime={createdAt} duration={24}/>
            </div> */}
            {showDeadline && (
              <div className="deadline">
                {t("offerCard.deadline", "Deadline")}:
                <CountdownTimer startTime={createdAt} duration={24} />
              </div>
            )}
          </div>
        </Col>
        <div className="divider-line" />
        <Col>
          <SectionHeader>
            {t("offerCard.route-information", "Route Information")}{" "}
            <FeatherIcon icon="info" color="#5F63F2" size={18} />
          </SectionHeader>
          <div className="flex-gap40">
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex" }}>
                <InfoLabel style={{ whiteSpace: "nowrap" }}>
                  {t("offerCard.possible-pick-up:", "Possible Pick-Up:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                  {routeInfo.pickup}
                </InfoValue>
              </div>
              <div style={{ display: "flex" }}>
                <InfoLabel>
                  {t("offerCard.total-distance:", "Total Distance:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4 }}>
                  {routeInfo.distance}
                </InfoValue>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex" }}>
                  <InfoLabel style={{ whiteSpace: "nowrap" }}>
                    {t("offerCard.requested-delivery:", "Requested Delivery:")}
                  </InfoLabel>
                  <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                    {routeInfo.dropoff}
                  </InfoValue>
                </div>
                <div style={{ display: "flex" }}>
                  <InfoLabel style={{ whiteSpace: "nowrap" }}>
                    {t("offerCard.access-type:", "Access Type:")}
                  </InfoLabel>
                  <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                    {routeInfo.access}
                  </InfoValue>
                </div>
              </div>
            </div>
          </div>
          <div className="divider-line" />
          <SectionHeader style={{ marginTop: "24px" }}>
            {t("offerCard.goods-details", "Goods Details")}{" "}
            <FeatherIcon icon="info" color="#5F63F2" size={18} />
          </SectionHeader>
          <div className="flex-gap40 mt12">
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex" }}>
                <InfoLabel style={{ whiteSpace: "nowrap" }}>
                  {t("offerCard.type-of-goods:", "Type of Goods:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                  {goodsInfo.type}
                </InfoValue>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <InfoLabel style={{ whiteSpace: "nowrap" }}>
                  {t("offerCard.dimensions-per-item:", "Dimensions per item:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                  {goodsInfo.dims}
                </InfoValue>
              </div>
              <div style={{ display: "flex" }}>
                <InfoLabel style={{ whiteSpace: "nowrap" }}>
                  {t("offerCard.special-conditions:", "Special Conditions:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
                  {goodsInfo.special}
                </InfoValue>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex" }}>
                <InfoLabel>{t("offerCard.quantity:", "Quantity:")}</InfoLabel>
                <InfoValue style={{ marginLeft: 4 }}>
                  {goodsInfo.quantity}
                </InfoValue>
              </div>
              <div style={{ display: "flex" }}>
                <InfoLabel>
                  {t("offerCard.ldm-per-item:", "LDM per item:")}
                </InfoLabel>
                <InfoValue style={{ marginLeft: 4 }}>{goodsInfo.ldm}</InfoValue>
              </div>
            </div>
          </div>
          <div className="divider-line" />
          <SectionHeader style={{ marginTop: "24px" }}>
            {t("offerCard.additional-information", "Additional Information")}{" "}
            <FeatherIcon icon="info" color="#5F63F2" size={18} />
          </SectionHeader>
          <div className="flex-wrap-gap-40">
            <div style={{ flex: 1 }}>
              <InfoLabel>
                {t(
                  "offerCard.possible-pick-up-date-range:",
                  "Possible Pick-Up Date Range:"
                )}
              </InfoLabel>
              <InfoValue>{additionalInfo.pickupRange}</InfoValue>
            </div>
            <div style={{ flex: 1 }}>
              <InfoLabel>
                {t(
                  "offerCard.requested-delivery-date-range:",
                  "Requested Delivery Date Range:"
                )}
              </InfoLabel>
              <InfoValue>{additionalInfo.dropoffRange}</InfoValue>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <InfoLabel>{t("offerCard.currency:", "Currency:")}</InfoLabel>
            <InfoValue> {additionalInfo.currency}</InfoValue>
          </div>
        </Col>
      </div>
      <OfferFormBg>
        <div>
          <SectionHeader>
            {t("offerCard.submit-your-offer:", "Submit your Offer:")}
          </SectionHeader>
        </div>
        <Row className="offer-form-row" gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <InfoLabel>{t("offerCard.net-price", "Net Price")}</InfoLabel>
            <Input
              disabled={isViewOnly}
              value={form.netPrice}
              // placeholder="Net Price EUR"
              placeholder={netPricePlaceholder}
              onChange={(e) => handleInputChange("netPrice", e.target.value)}
              style={{ width: "100%" }}
            />
            {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <InfoLabel>
              {t("offerCard.validity-of-offer", "Validity of Offer")}
            </InfoLabel>
            <Input
              disabled={isViewOnly}
              value={form.validity}
              type="text"
              placeholder={`Minimum: ${minValidityHours} hours`}
              onChange={(e) => {
                let val = e.target.value;
                val = val.replace(",", ".");
                if (/^\d*\.?\d*$/.test(val)) {
                  handleInputChange("validity", val);
                }
              }}
              style={{ width: "100%" }}
            />
            {form.validity && Number(form.validity) < minValidityHours && (
              <ErrorText>{`Minimum accepted validity: ${minValidityHours} hours`}</ErrorText>
            )}
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <InfoLabel>{t("offerCard.truck-type", "Truck Type")}</InfoLabel>
            <Select
              disabled={isViewOnly}
              placeholder={t(
                "submitOfferPage.trailertypePlaceholder",
                "Select Truck Type"
              )}
              value={form.truckType === "" ? undefined : form.truckType}
              // value={form.truckType}
              onChange={(value) => handleInputChange("truckType", value)}
              style={{ width: "100%" }}
              className="custom-select-dropdown"
              size="large"
            >
              {trailertypeOptions.map((item: CodebookDto) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>

            {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <InfoLabel>
              {t(
                "offerCard.possible-pick-up-date-&-time:",
                "Possible Pick-Up Date & Time:"
              )}
            </InfoLabel>
            <DatePicker
              disabled={isViewOnly}
              className="offer-form-datepicker"
              style={{ width: "100%" }}
              showTime
              value={form.pickupDateTime}
              onChange={(date) => handleInputChange("pickupDateTime", date)}
              placeholder="Estimated Pickup Date and Time"
              format="DD.MM.YYYY HH:mm"
            />
            {errors.pickupDateTime && (
              <ErrorText>{errors.pickupDateTime}</ErrorText>
            )}
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <InfoLabel>
              {t(
                "offerCard.requested-delivery-date-&-time:",
                "Requested Delivery Date & Time:"
              )}
            </InfoLabel>
            <DatePicker
              disabled={isViewOnly}
              className="offer-form-datepicker"
              style={{ width: "100%" }}
              showTime
              value={form.dropoffDateTime}
              onChange={(date) => handleInputChange("dropoffDateTime", date)}
              placeholder="Estimated Drop-off Date and Time"
              format="DD.MM.YYYY HH:mm"
            />
            {errors.dropoffDateTime && (
              <ErrorText>{errors.dropoffDateTime}</ErrorText>
            )}
          </Col>
        </Row>
        {!isViewOnly && (
          <Row justify="center" style={{ marginTop: 25, marginBottom: 10 }}>
            <Col>
              <Button type="primary" onClick={() => handleSubmit(itemId)}>
                {t("offerCard.submit", "Submit")}
              </Button>
            </Col>
            <Col>
              <Popconfirm
                title={t(
                  "institutions.reject-offer",
                  "Are you sure reject this offer?"
                )}
                onConfirm={isViewOnly ? undefined : () => handleCancel(itemId)}
                okText={t("global.yes", "Yes")}
                cancelText={t("global.no", "No")}
              >
                <Button style={{ marginLeft: 12 }}>
                    {t("offerCard.cancel", "Cancel")}
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        )}
      </OfferFormBg>
    </OfferCardStyled>
  );
}

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
    dropoff: "",
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
    dropoffRange: "",
    currency: "",
    createdAt:moment(),
    requestDateTime: moment(), // or null if you want to handle no date case
  });
  const [forms, setForms] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [trailertypeOptions, setTrailertypeOptions] = useState<CodebookDto[]>(
    []
  );
  const [transportDetails, setTransportDetails] =
    useState<ListTransportManagementDtoPaginatedList | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [routeInfos, setRouteInfos] = useState<Record<string, typeof routeInfo>>({});
const [goodsInfos, setGoodsInfos] = useState<Record<string, typeof goodsInfo>>({});
const [additionalInfos, setAdditionalInfos] = useState<Record<string, typeof additionalInfo>>({});

  const inputWidth = 220;
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();
  const [request, setRequest] = useState<{
  status: VehicleFleetRequestStatus;
  search: string;
  pageNumber: number;
  pageSize: number;
  pickupDate: any;   
  dropOffDate: any;
  pickupPostalCode: string;
  dropOffPostalCode: string;
}>({
  status: VehicleFleetRequestStatus.ALL,
  search: "",
  pageNumber: 1,
  pageSize: 2,
  pickupDate: null,
  dropOffDate: null,
  pickupPostalCode: "",
  dropOffPostalCode: "",
});


  const truckTypeList = [
    { label: "Road Train", value: "Road Train" },
    { label: "Frigo Trailer", value: "Frigo Trailer" },
    { label: "7.5t", value: "7.5t" },
    { label: "12t", value: "12t" },
    { label: "Flexible Trailer", value: "Flexible Trailer" },
  ];

  const validate = (form: any, additionalInfo: any) => {
    const e: { [k: string]: string } = {};
    if (!form.netPrice) e.netPrice = "*Required";
    if (!form.truckType) e.truckType = "*Required";
    if (!form.validity) e.validity = "*Required";
    if (!form.pickupDateTime) e.pickupDateTime = "*Required";
    if (!form.dropoffDateTime) e.dropoffDateTime = "*Required";
    const now = moment();
    const minValidityHours =
      now.diff(additionalInfo.createdAt, "hours") + 2;
    // const validHours = parseFloat(form.validity || "0");
    const validHours = Number(form.validity);
    if (form.validity && validHours < minValidityHours) {
      e.validity = `Minimum accepted validity: ${minValidityHours} hours`;
    }
    return e;
  };
  useEffect(() => {
    const fetchCodebooks = async () => {
      try {
        const { data } = await codebooksApi.apiCodebookGet();
        setTrailertypeOptions(data.TrailerType || []);
      } catch (e) {
        // handle error
      }
    };
    fetchCodebooks();
  }, []);

  const fetchRequestDetails = async (params: any) => {
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
  };

  const defaultRouteInfo = {
  pickup: "",
  dropoff: "",
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
  dropoffRange: "",
  currency: "",
  requestDateTime: moment(),
};


  useEffect(() => {
    fetchRequestDetails({
      search: request.search,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      status:request.status,
      pickupDate: request.pickupDate
        ? request.pickupDate.format("YYYY-MM-DD")
        : undefined,
      dropOffDate: request.dropOffDate
        ? request.dropOffDate.format("YYYY-MM-DD")
        : undefined,
      pickupPostalCode: request.pickupPostalCode || undefined,
      dropOffPostalCode: request.dropOffPostalCode || undefined,
    });
  }, [
    request.search,
    request.pageNumber,
    request.pageSize,
    request.status,
    request.pickupDate,
    request.dropOffDate,
    request.pickupPostalCode,
    request.dropOffPostalCode,
  ]);


  useEffect(() => {
  if (transportDetails?.items?.length) {
    const newRouteInfos: Record<string, typeof routeInfo> = {};
    const newGoodsInfos: Record<string, typeof goodsInfo> = {};
    const newAdditionalInfos: Record<string, typeof additionalInfo> = {};

    transportDetails.items.forEach((item) => {
      // Compute routeInfo
      const pickup = item.transportPickup?.length ? item.transportPickup[0] : null;
      const dropoff = item.transportDelivery?.length ? item.transportDelivery[0] : null;

      newRouteInfos[item.id as string] = {
        pickup: pickup ? `${pickup.city ?? ""}, ${pickup.postalCode ?? ""}, ${pickup.countryName ?? ""}` : "",
        dropoff: dropoff ? `${dropoff.city ?? ""}, ${dropoff.postalCode ?? ""}, ${dropoff.countryName ?? ""}` : "",
        distance: `${item.totalDistance ?? 0} km`,
        access : getAccessibilityDescription(item.accessibility), 

      };

      // Compute goodsInfo
      const goods = item.transportGoods?.length ? item.transportGoods[0] : undefined;
      if (goods) {
        const length = goods.length || 0;
        const width = goods.width || 0;
        const height = goods.height || 0;
        const ldmValue = length && width && height ? (length * width * height).toFixed(2) : "0";

        newGoodsInfos[item.id as string] = {
          type: goods.typeOfGoodsName ?? "N/A",
          quantity: goods.quantity ?? 0,
          dims: `L:${length} W:${width} H:${height}`,
          ldm: ` ${ldmValue} m³`,
          special: [
            goods.isIncludesAdrGoods ? "ADR Included" : "",
            goods.isCargoNotStackable ? "Cargo items are not stackable" : "",
          ].filter(Boolean).join(", "),
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
      const transportInformation = item.transportInformation?.length ? item.transportInformation[0] : null;
      if (transportInformation) {
        const pickupFrom = moment(transportInformation.pickupDateFrom).format("DD.MM.YYYY");
        const pickupTo = moment(transportInformation.pickupDateTo).format("DD.MM.YYYY");
        const pickupFromTime = transportInformation.pickupTimeFrom
          ? moment(transportInformation.pickupTimeFrom, "HH:mm").format("HH:mm")
          : "";
        const pickupToTime = transportInformation.pickupTimeTo
          ? moment(transportInformation.pickupTimeTo, "HH:mm").format("HH:mm")
          : "";
        const dropoffFrom = moment(transportInformation.deliveryDateFrom).format("DD.MM.YYYY");
        const dropoffTo = moment(transportInformation.deliveryDateTo).format("DD.MM.YYYY");
        const dropoffFromTime = transportInformation.deliveryTimeFrom
          ? moment(transportInformation.deliveryTimeFrom, "HH:mm").format("HH:mm")
          : "";
        const dropoffToTime = transportInformation.deliveryTimeTo
          ? moment(transportInformation.deliveryTimeTo, "HH:mm").format("HH:mm")
          : "";

        newAdditionalInfos[item.id as string] = {
          pickupRange:
            pickupFrom === pickupTo
              ? pickupFrom
              : `${pickupFrom} - ${pickupTo}` +
                (pickupFromTime || pickupToTime ? `\n${pickupFromTime} - ${pickupToTime}`.trim() : ""),
          dropoffRange:
            dropoffFrom === dropoffTo
              ? dropoffFrom
              : `${dropoffFrom} - ${dropoffTo}` +
                (dropoffFromTime || dropoffToTime ? `\n${dropoffFromTime} - ${dropoffToTime}`.trim() : ""),
          currency: transportInformation.currencyName || "EUR",
          createdAt: moment(item.createdAt),
          requestDateTime: transportInformation.pickupDateFrom
            ? moment(transportInformation.pickupDateFrom)
            : moment(),
        };
      } else {
        newAdditionalInfos[item.id as string] = {
          pickupRange: "",
          dropoffRange: "",
          currency: "",
          createdAt:moment(),
          requestDateTime: moment(),
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
    let dropoffMatch = true;
    let pickupPostalMatch = true;
    let dropoffPostalMatch = true;

    // Pickup Date filter
    if (request.pickupDate && item.transportInformation?.[0]?.pickupDateFrom) {
      pickupMatch = moment(item.transportInformation[0].pickupDateFrom).isSame(
        request.pickupDate,
        "day"
      );
    }

    // Drop-off Date filter
    if (
      request.dropOffDate &&
      item.transportInformation?.[0]?.deliveryDateFrom
    ) {
      dropoffMatch = moment(
        item.transportInformation[0].deliveryDateFrom
      ).isSame(request.dropOffDate, "day");
    }

    // Pickup Postal Code filter
    if (request.pickupPostalCode && item.transportPickup?.[0]?.postalCode) {
      pickupPostalMatch = item.transportPickup[0].postalCode.includes(
        request.pickupPostalCode
      );
    }

    // Drop-off Postal Code filter
    if (request.dropOffPostalCode && item.transportDelivery?.[0]?.postalCode) {
      dropoffPostalMatch = item.transportDelivery[0].postalCode.includes(
        request.dropOffPostalCode
      );
    }

    return (
      pickupMatch && dropoffMatch && pickupPostalMatch && dropoffPostalMatch
    );
  });

const handleInputChange = (itemId: string, field: string, value: any): void => {
  if (!itemId) return;

  setForms((prev) => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      [field]: value,
    },
  }));

  setErrors((prev) => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      [field]: "",
    },
  }));
};

const handleCancel = async (itemId: string, itemData: any) => {
  const rejectdto : SubmitOfferTransportManageDto = {
      id: itemData?.transportCarrier[0]?.id,
  }
  try {
    await requestsApi.apiTransportManagementIdRejectOfferPut({
      transportRequestId: itemId,
      submitOfferTransportManageDto: rejectdto,
    });
    openNotificationWithIcon(
      "success",
      t("offerCard.cancelSuccess", "Offer rejected successfully")
    );
    // Optionally refresh the list after rejection
    fetchRequestDetails({
      search: request.search,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      pickupDate: request.pickupDate ? request.pickupDate.format("YYYY-MM-DD") : undefined,
      dropOffDate: request.dropOffDate ? request.dropOffDate.format("YYYY-MM-DD") : undefined,
      pickupPostalCode: request.pickupPostalCode || undefined,
      dropOffPostalCode: request.dropOffPostalCode || undefined,
    });
  } catch (error) {
    console.error(error);
    openNotificationWithIcon(
      "error",
      t("offerCard.cancelError", "Failed to reject offer")
    );
  }
};


const handleSubmit = async (itemId: string, itemData: any) => {
  const form = forms[itemId] || {};
  const e = validate(form, additionalInfos[itemId] || defaultAdditionalInfo);
  setErrors((prev) => ({ ...prev, [itemId]: e }));
  if (Object.keys(e).length > 0) return;

  const dto: SubmitOfferTransportManageDto = {
    id: itemData?.transportCarrier[0]?.id,
    price: form.netPrice,
    offerValidityDate: Number(form.validity),
    estimatedPickupDateTime: form.pickupDateTime
      ? moment(form.pickupDateTime).toISOString()
      : null,
    estimatedDeliveryDateTime: form.dropoffDateTime
      ? moment(form.dropoffDateTime).toISOString()
      : null,
    truckTypeId: form.truckType,
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
      pickupDate: request.pickupDate ? request.pickupDate.format("YYYY-MM-DD") : undefined,
      dropOffDate: request.dropOffDate ? request.dropOffDate.format("YYYY-MM-DD") : undefined,
      pickupPostalCode: request.pickupPostalCode || undefined,
      dropOffPostalCode: request.dropOffPostalCode || undefined,
    });

  } catch (error) {
    console.error(error);
    openNotificationWithIcon(
      "error",
      t("offerCard.error", "Failed to submit offer")
    );
  }
};

  const onSearchChange = (value: any) => {
    setRequest({ ...request, search: value });
  };

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
                      pickupDate: date,
                      pageNumber: 1,
                    }))
                  }
                />
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
                  placeholder={t("requests.dropOffDate", "Drop-off Date")}
                  onChange={(date) =>
                    setRequest((prev) => ({
                      ...prev,
                      dropOffDate: date,
                      pageNumber: 1,
                    }))
                  }
                />
              </Col>
              <Col flex="1 1 0">
                <Input
                  style={{ width: "100%" }}
                  placeholder={t(
                    "requests.dropOffPostalCode",
                    "Drop-off Postal Code"
                  )}
                  onChange={(e) =>
                    setRequest((prev) => ({
                      ...prev,
                      dropOffPostalCode: e.target.value,
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
      form={forms[item.id] || {}}
      errors={errors[item.id] || {}}
      handleInputChange={(field: any, v : any) => handleInputChange(item.id as string, field, v)}
      handleSubmit={() => handleSubmit(item.id as string, item)}
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






// import { Card, Col, DatePicker, Input, Row, Button, Select } from "antd";
// import { useState } from "react";
// import styled from "styled-components";
// import moment from "moment";
// import { Main, Main as MainBase, Panel, OfferCardStyled, OfferFormBg, OfferFormRow, SectionHeader, InfoLabel, InfoValue, ErrorText

// } from "container/styled";
// //@ts-ignore
// import FeatherIcon from "feather-icons-react";
// import { AutoComplete } from "components/autoComplete/autoComplete";
// import { Link } from "react-router-dom";
// import { ProjectSorting } from "pages/localization/email/style";
// import { UserFilterType } from "api/models";
// import { useTranslation } from "react-i18next";
// import { useAuthorization } from "hooks/useAuthorization";
// import { RequestsApi } from "api/api";
// import { SubmitOfferTransportManageDto } from "api/models/submit-offer-transport-manage-dto";
// import openNotificationWithIcon from "utility/notification";

// const requestsApi = new RequestsApi();

// // Single card component
// export function OfferCard({
//   routeInfo, goodsInfo, additionalInfo,
//   form, errors, handleInputChange, handleSubmit, truckTypeList, inputWidth,isViewOnly
// }: any) {
//     const { t } = useTranslation();
//   const now = moment();
// const diffMillis = now.diff(additionalInfo.requestDateTime);
// const duration = moment.duration(diffMillis);

// const hours = Math.max(22, Math.floor(duration.asHours()));
// const minutes = duration.minutes();
// const seconds = duration.seconds();
//   return (
//     <OfferCardStyled>
//       <div className="margin-top-32-14-0-14">
//         {/* <Row> */}
//         <Col className="margin-top-neg-30">
//           <div className="flex-between">
//             <InfoLabel>{t("offerCard.no-23-99", "No. 23-99")}</InfoLabel>
//             {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//             <div className="deadline">
//               {t("offerCard.deadline", "Deadline")}: {hours}H {minutes}Min {seconds}Sec
//             </div>
//           </div>
//         </Col>
//         <div className="divider-line" />
//         <Col>
//           <SectionHeader>
//             {t("offerCard.route-information", "Route Information")}{" "}
//             <FeatherIcon icon="info" color="#5F63F2" size={18} />
//           </SectionHeader>

//           {/* Row for Possible Pick-Up and Requested Delivery */}
//           <div className="flex-gap40">
//             <div style={{ flex: 1 }}>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>{t("offerCard.possible-pick-up:", "Possible Pick-Up:")}</InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>
//                   {routeInfo.pickup}
//                 </InfoValue>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>{t("offerCard.total-distance:", "Total Distance:")}</InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>
//                   {routeInfo.distance}
//                 </InfoValue>
//               </div>
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: "flex" }}>
//                   <InfoLabel>{t("offerCard.requested-delivery:", "Requested Delivery:")}</InfoLabel>
//                   <InfoValue style={{ marginLeft: 4 }}>
//                     {routeInfo.dropoff}
//                   </InfoValue>
//                 </div>
//                 {/* <div style={{ display: "flex" }}>
//       <InfoLabel>Access Type:</InfoLabel>
//       <InfoValue style={{ marginLeft: 4 }}>{routeInfo.access}</InfoValue>
//     </div> */}
//                 <div style={{ display: "flex" }}>
//                   <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                     {t("offerCard.access-type:", "Access Type:")}
//                   </InfoLabel>
//                   <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
//                     {routeInfo.access}
//                   </InfoValue>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="divider-line" />

//           <SectionHeader style={{ marginTop: "24px" }}>
//             {t("offerCard.goods-details", "Goods Details")}<FeatherIcon icon="info" color="#5F63F2" size={18} />
//           </SectionHeader>

//           <div className="flex-gap40 mt12">
//             <div style={{ flex: 1 }}>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>{t("offerCard.type-of-goods:", "Type of Goods:")}</InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>
//                   {goodsInfo.type}
//                 </InfoValue>
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap" }}>
//                 <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                   {t("offerCard.dimensions-per-item:", "Dimensions per item:")}
//                 </InfoLabel>
//                 <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
//                   {goodsInfo.dims}
//                 </InfoValue>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                   {t("offerCard.special-conditions:", "Special Conditions:")}
//                 </InfoLabel>
//                 <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
//                   {goodsInfo.special}
//                 </InfoValue>
//               </div>
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>{t("offerCard.quantity:", "Quantity:")}</InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>
//                   {goodsInfo.quantity}
//                 </InfoValue>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>{t("offerCard.ldm-per-item:", "LDM per item:")}</InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>{goodsInfo.ldm}</InfoValue>
//               </div>
//             </div>
//           </div>

//           <div className="divider-line" />
//           <SectionHeader style={{ marginTop: "24px" }}>
//             {t("offerCard.additional-information", "Additional Information")}{" "}
//             <FeatherIcon icon="info" color="#5F63F2" size={18} />
//           </SectionHeader>

//           <div className="flex-wrap-gap-40">
//             {/* <div style={{ display: 'flex', flexDirection: 'column' }}>
//         <InfoLabel>Schedule Type:</InfoLabel>
//         <InfoValue style={{ color: '#838489' }}>-</InfoValue>
//       </div> */}
//             <div style={{ flex: 1 }}>
//               <InfoLabel>{t("offerCard.possible-pick-up-date-range:", "Possible Pick-Up Date Range:")}</InfoLabel>
//               <InfoValue>{additionalInfo.pickupRange}</InfoValue>
//               <InfoLabel>{t("offerCard.quantity:", "Currency:")}</InfoLabel>
//               <InfoValue>{additionalInfo.currency}</InfoValue>
//             </div>
//             <div style={{ flex: 1 }}>
//               <InfoLabel>{t("offerCard.requested-delivery-date-range:", "Requested Delivery Date Range:")}</InfoLabel>
//               <InfoValue>{additionalInfo.dropoffRange}</InfoValue>
//             </div>
//           </div>
//         </Col>
//         {/* </Row> */}
//       </div>
//       <OfferFormBg>
//         <div>
//           <SectionHeader>{t("offerCard.submit-your-offer:", "Submit your Offer:")}</SectionHeader>
//         </div>
//         <Row className="offer-form-row" gutter={[16, 16]}>
//           <Col xs={24} sm={24} md={8} lg={8}>
//             <InfoLabel>{t("offerCard.net-price", "Net Price")}</InfoLabel>
//             <Input
//               value={form.netPrice}
//               placeholder="Net Price EUR"
//               onChange={(e) => handleInputChange("netPrice", e.target.value)}
//               style={{ width: "100%" }}
//             />
//             {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
//           </Col>
//           <Col xs={24} sm={24} md={8} lg={8}>
//             <InfoLabel>{t("offerCard.validity-of-offer", "Validity of Offer")}</InfoLabel>
//             <Input
//               value={form.validity}
//               type="text"
//               placeholder="Validity of Offer (hours)"
//               onChange={(e) => {
//                 let val = e.target.value;
//                 val = val.replace(",", ".");
//                 if (/^\d*\.?\d*$/.test(val)) {
//                   handleInputChange("validity", val);
//                 }
//               }}
//               style={{ width: "100%" }}
//             />
//             {/* {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//             <div style={{ color: "#f5222d", fontSize: 13, marginTop: 8 }}>
//               Minimum accepted validity:{" "}
//               {Math.max(
//                 22,
//                 moment().diff(additionalInfo.requestDateTime, "hours") + 2
//               )}{" "}
//               hours
//             </div> */}
//           </Col>
//           <Col xs={24} sm={24} md={8} lg={8}>
//             <InfoLabel>{t("offerCard.truck-type", "Truck Type")}</InfoLabel>
//             <Input
//               value={form.truckType}
//               placeholder="Truck Type"
//               // options={truckTypeList}
//               onChange={(v) => handleInputChange("truckType", v)}
//               style={{ width: "100%" }}
//             />
//             {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
//           </Col>

//           <Col xs={24} sm={24} md={12} lg={12}>
//             <InfoLabel>{t("offerCard.possible-pick-up-date-&-time:", "Possible Pick-Up Date & Time:")}</InfoLabel>
//             <DatePicker
//              className="offer-form-datepicker"
//               style={{ width: "100%" }}
//               showTime
//               value={form.pickupDateTime}
//               onChange={(dt) => handleInputChange("pickupDateTime", dt)}
//               placeholder="Estimated Pickup Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.pickupDateTime && (
//               <ErrorText>{errors.pickupDateTime}</ErrorText>
//             )}
//           </Col>
//           <Col xs={24} sm={24} md={12} lg={12}>
//             <InfoLabel>{t("offerCard.requested-delivery-date-&-time:", "Requested Delivery Date & Time:")}</InfoLabel>
//             <DatePicker
//              className="offer-form-datepicker"
//               style={{ width: "100%" }}
//               showTime
//               value={form.dropoffDateTime}
//               onChange={(dt) => handleInputChange("dropoffDateTime", dt)}
//               placeholder="Estimated Drop-off Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.dropoffDateTime && (
//               <ErrorText>{errors.dropoffDateTime}</ErrorText>
//             )}
//           </Col>
//         </Row>
//         {/* <Row justify="center" style={{ marginTop: 25, marginBottom: 10 }}>
//           <Col>
//             <Button type="primary" onClick={handleSubmit}>
//               Submit
//             </Button>
//           </Col>
//           <Col>
//             <Button
//               style={{ marginLeft: 12 }}
//               onClick={() => window.history.back()}
//             >
//               Cancel
//             </Button>
//           </Col>
//         </Row> */}
//         {!isViewOnly && (
//           <Row justify="center" style={{ marginTop: 25, marginBottom: 10 }}>
//             <Col>
//               <Button type="primary" onClick={handleSubmit}>
//                 {t("offerCard.submit", "Submit")}
//               </Button>
//             </Col>
//             <Col>
//               <Button
//                 style={{ marginLeft: 12 }}
//                 onClick={() => window.history.back()}
//               >
//                 {t("offerCard.cancel", "Cancel")}
//               </Button>
//             </Col>
//           </Row>
//         )}
//       </OfferFormBg>
//     </OfferCardStyled>
//   );
// }

// // Main page: two cards side by side
// export const SubmitOfferPage = () => {
//   // Dummy data for both cards for demo, replace as needed
//   const [routeInfo] = useState({
//     pickup: "Skopje, 1000, MKD",
//     dropoff: "Ohrid, 6000, EUR",
//     distance: "180 km",
//     access: "Commercial without ramp but with forklift",
//   });
//   const [goodsInfo] = useState({
//     type: "Pallet",
//     quantity: 32,
//     dims: "Length:1m, Width:1.20m, Height:0.8m, Weight:80kg",
//     ldm: "1.2",
//     special: "Cargo items are not stackable, ...",
//   });
//   const [additionalInfo] = useState({
//     pickupRange: "10.08.2025-16.08.2025, 14:30-18:30",
//     dropoffRange: "13.09.2025-15.09.2025, 11:00-13:00",
//     currency: "EUR",
//     requestDateTime: moment("2025-09-22T10:00"),
//   });

//   // Form state per card (for demo, both start empty)
//   const [form1, setForm1] = useState({ netPrice: "", truckType: "", validity: "", pickupDateTime: null as any, dropoffDateTime: null as any });
//   const [form2, setForm2] = useState({ netPrice: "", truckType: "", validity: "", pickupDateTime: null as any, dropoffDateTime: null as any });
//   const [errors1, setErrors1] = useState<{ [k: string]: string }>({});
//   const [errors2, setErrors2] = useState<{ [k: string]: string }>({});
//   const inputWidth = 220;
//     const { t } = useTranslation();
//     const { hasPermission } = useAuthorization();

//     // const filterKeys = [
//     //   { id: UserFilterType.ALL, name: t("users:select.all", "All") },
//     //   { id: UserFilterType.ACTIVE, name: t("users:select.active", "Active") },
//     //   {
//     //     id: UserFilterType.PENDING,
//     //     name: t("users:select.not-confirmed", "Not Confirmed"),
//     //   },
//     //   hasPermission("users:list-deactivated") && {
//     //     id: UserFilterType.DISABLED,
//     //     name: t("users:select.disabled", "Disabled"),
//     //   },
//     //   { id: UserFilterType.DELETED, name: t("users:select.deleted", "Deleted") },
//     // ].filter(Boolean);

//     const filterItems = [
//   { id: 1, name: "All" },
//   { id: 2, name: "Active" },
//   { id: 3, name: "Pending" },
//   { id: 4, name: "Outdated" },
//   { id: 5, name: "Rejected" },
// ];

//       const [request, setRequest] = useState({
//         filterType: UserFilterType.ACTIVE,
//         search: "",
//         pageNumber: 1,
//         pageSize: 10,
//       });

//   const truckTypeList = [
//     { label: "Road Train", value: "Road Train" },
//     { label: "Frigo Trailer", value: "Frigo Trailer" },
//     { label: "7.5t", value: "7.5t" },
//     { label: "12t", value: "12t" },
//     { label: "Flexible Trailer", value: "Flexible Trailer" },
//   ];

//   const validate = (form: any, additionalInfo: any) => {
//     const e: { [k: string]: string } = {};
//     if (!form.netPrice) e.netPrice = "*Required";
//     if (!form.truckType) e.truckType = "*Required";
//     if (!form.validity) e.validity = "*Required";
//     if (!form.pickupDateTime) e.pickupDateTime = "*Required";
//     if (!form.dropoffDateTime) e.dropoffDateTime = "*Required";
//     const now = moment();
//     const minValidityHours = now.diff(additionalInfo.requestDateTime, "hours") + 2;
//     const validHours = parseFloat(form.validity || "0");
//     if (form.validity && validHours < minValidityHours) {
//       e.validity = `Minimum accepted validity: ${minValidityHours} hours`;
//     }
//     return e;
//   };

//   const handleInputChange1 = (field: string, v: any) => {
//     setForm1(prev => ({ ...prev, [field]: v }));
//     setErrors1(prev => ({ ...prev, [field]: "" }));
//   };
//   // const handleSubmit1 = () => {
//   //   const e = validate(form1, additionalInfo);
//   //   setErrors1(e);
//   //   if (Object.keys(e).length === 0) {
//   //     alert("Offer 1 submitted (simulate backend POST)");
//   //   }
//   // };
//   const handleInputChange2 = (field: string, v: any) => {
//     setForm2(prev => ({ ...prev, [field]: v }));
//     setErrors2(prev => ({ ...prev, [field]: "" }));
//   };
//   // const handleSubmit2 = () => {
//   //   const e = validate(form2, additionalInfo);
//   //   setErrors2(e);
//   //   if (Object.keys(e).length === 0) {
//   //     alert("Offer 2 submitted (simulate backend POST)");
//   //   }
//   // };
//   const handleSubmit1 = async () => {
//     console.log("Submit clicked for 1");
//   const e = validate(form1, additionalInfo);
//   setErrors1(e);
//   if (Object.keys(e).length > 0) return;

//   const dto: SubmitOfferTransportManageDto = {
//     id: "123", // replace with route param or dynamic id
//     price: form1.netPrice,
//     offerValidityDate: moment().add(Number(form1.validity), "hours").toISOString(),
//     estimatedPickupDateTime: form1.pickupDateTime ? moment(form1.pickupDateTime).toISOString() : null,
//     estimatedDeliveryDateTime: form1.dropoffDateTime ? moment(form1.dropoffDateTime).toISOString() : null,
//     truckTypeId: form1.truckType,
//   };

//   try {
//     await requestsApi.apiTransportManagementIdSubmitOfferPut({
//       id: "123", // same ID as above
//       submitOfferTransportManageDto: dto,
//     });
//     openNotificationWithIcon("success", t("offerCard.success", "Offer submitted successfully"));
//   } catch (error) {
//     console.error(error);
//     openNotificationWithIcon("error", t("offerCard.error", "Failed to submit offer"));
//   }
// };

// const handleSubmit2 = async () => {
//   const e = validate(form2, additionalInfo);
//   setErrors2(e);
//   if (Object.keys(e).length > 0) return;

//   const dto: SubmitOfferTransportManageDto = {
//     id: "456", // replace dynamically if needed
//     price: form2.netPrice,
//     offerValidityDate: moment().add(Number(form2.validity), "hours").toISOString(),
//     estimatedPickupDateTime: form2.pickupDateTime ? moment(form2.pickupDateTime).toISOString() : null,
//     estimatedDeliveryDateTime: form2.dropoffDateTime ? moment(form2.dropoffDateTime).toISOString() : null,
//     truckTypeId: form2.truckType,
//   };

//   try {
//     await requestsApi.apiTransportManagementIdSubmitOfferPut({
//       id: "456",
//       submitOfferTransportManageDto: dto,
//     });
//     openNotificationWithIcon("success", t("offerCard.success", "Offer submitted successfully"));
//   } catch (error) {
//     console.error(error);
//     openNotificationWithIcon("error", t("offerCard.error", "Failed to submit offer"));
//   }
// };

//     const onSearchChange = (value: any) => {
//     setRequest({ ...request, search: value });
//   };

//   return (

//     <Main>
//       <div
//         style={{
//           fontWeight: 600,
//           fontSize: 22,
//           paddingTop: 20,
//           paddingBottom: 20,
//         }}>
//           {t("submitOfferPage.submit-an-offer", "Submit an Offer")}
//         </div>
//       <Row gutter={25}>
//         <Col xs={24}>
//           <ProjectSorting>
//             <div className="project-sort-bar">
//               <div className="project-sort-nav">
//                 <nav>
//                   <ul>
//                     {[...new Set(filterItems)].filter(Boolean).map((item) => (
//                       <li
//                         key={item.id}
//                         className={
//                           request?.filterType === item.id
//                             ? "active"
//                             : "deactivate"
//                         }
//                       >
//                         <Link
//                           to="#"
//                           onClick={() =>
//                             setRequest({
//                               ...request,
//                               // filterType: item.id,
//                               pageNumber: 1,
//                               pageSize: 10,
//                             })
//                           }
//                         >
//                           {item.name}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </nav>
//               </div>

//               {/* </Col> */}
//               {/* {request.filterType === UserFilterType.PENDING && hasPermission('users:resend-confirmation-mails') && (<Col lg={6} md={6} xs={24} style={{ display: 'flex', justifyContent: 'end' }}>
//                           <Button
//                             className="btn-add_new"
//                             size="default"
//                             onClick={onclickNotConfirmedEmailSend}
//                             type="primary"
//                             key="btn_2"
//                           >
//                             Resend Confirmation Emails
//                           </Button>
//                         </Col>)} */}
//               <div className="project-sort-search">
//                 <AutoComplete
//                   onSearch={(value) => onSearchChange(value)}
//                   patterns
//                   placeholder={t(
//                   "global.auto-complete-placeholder",
//                   "Search..."
//                 )}
//                 />
//               </div>
//               {/* <div className="project-sort-group">
//                           <div className="sort-group">
//                             <span>{t("users:sort.label", "Sort By:")}</span>
//                             <Select defaultValue="category">
//                               <Select.Option value="category">Name</Select.Option>
//                               <Select.Option value="rate">Top Rated</Select.Option>
//                               <Select.Option value="popular">Popular</Select.Option>
//                               <Select.Option value="time">Newest</Select.Option>
//                               <Select.Option value="price">Price</Select.Option>
//                             </Select>
//                             <div className="layout-style">
//                               <NavLink to={`${path}/grid`}>
//                                 <FeatherIcon icon="grid" size={16} />
//                               </NavLink>
//                               <NavLink to={`${path}/list`}>
//                                 <FeatherIcon icon="list" size={16} />
//                               </NavLink>
//                             </div>
//                           </div>
//                         </div> */}
//             </div>
//           </ProjectSorting>
//         </Col>
//       </Row>
//       <Panel>
//         <OfferCard
//           routeInfo={routeInfo}
//           goodsInfo={goodsInfo}
//           additionalInfo={additionalInfo}
//           form={form1}
//           errors={errors1}
//           handleInputChange={handleInputChange1}
//           handleSubmit={handleSubmit1}
//           truckTypeList={truckTypeList}
//           inputWidth={inputWidth}
//         />
//         <OfferCard
//           routeInfo={routeInfo}
//           goodsInfo={goodsInfo}
//           additionalInfo={additionalInfo}
//           form={form2}
//           errors={errors2}
//           handleInputChange={handleInputChange2}
//           handleSubmit={handleSubmit2}
//           truckTypeList={truckTypeList}
//           inputWidth={inputWidth}
//         />
//       </Panel>
//     </Main>
//   );
// };

// export default SubmitOfferPage;

// import { Card, Col, DatePicker, Input, Row, Button, Select } from "antd";
// import { useState } from "react";
// import styled from "styled-components";
// import moment from "moment";
// import { Main } from "container/styled";

// const SectionHeader = styled.h3`
//   font-weight: 600;
//   font-size: 15px;
//   color: #000;
//   margin-bottom: 12px;
// `;

// const InfoRow = styled(Row)`
//   margin-bottom: 30px;
// `;

// const InfoCol = styled(Col)`
//   border-right: 1px solid #ededed;
//   &:last-child {
//     border-right: none;
//   }
//   padding-right: 16px;
// `;

// const Label = styled.div`
//   font-weight: 600;
//   font-size: 13px;
//   color: #000;
// `;

// const Value = styled.div`
//   font-weight: 400;
//   font-size: 13px;
//   color: #737373;
//   margin-bottom: 8px;
// `;

// const OfferFormRow = styled(Row)`
//   margin-top: 35px;
//   margin-bottom: 35px;
// `;

// const ErrorText = styled.div`
//   color: #f5222d;
//   font-size: 13px;
//   margin-top: 5px;
// `;

// const SubmitButton = styled(Button)`
//   background: #37b635 !important;
//   border: none !important;
//   min-width: 120px;
// `;

// const CancelButton = styled(Button)`
//   min-width: 120px;
// `;

// // SubmitOfferPage component
// export const SubmitOfferPage = () => {
//   // Dummy backend data
//   const [routeInfo] = useState({
//     pickup: "Skopje, 1000, MKD",
//     dropoff: "Ohrid, 6000, MKD",
//     distance: "180 km",
//     access: "Commercial without ramp but with forklift",
//   });
//   const [goodsInfo] = useState({
//     type: "Pallet",
//     quantity: 32,
//     dims: "1m, 1.20m, 0.8m, 80kg",
//     ldm: "1.2",
//     special: "Cargo items are not stackable, ...",
//   });
//   const [additionalInfo] = useState({
//     pickupRange: "10.08.2025-16.08.2025, 14:30-18:30",
//     dropoffRange: "13.09.2025-15.09.2025, 11:00-13:00",
//     currency: "EUR",
//     // Add an example request submission datetime here
//     requestDateTime: moment("2025-09-22T10:00"), // Example fixed for demo, replace as needed
//   });

//   // Form state
//   const [form, setForm] = useState({
//     netPrice: "",
//     truckType: "",
//     validity: "",
//     pickupDateTime: null as null | moment.Moment,
//     dropoffDateTime: null as null | moment.Moment,
//   });
//   const [errors, setErrors] = useState<{ [k: string]: string }>({});
//   const inputWidth = 330;

//   const truckTypeList = [
//     { label: "Road Train", value: "Road Train" },
//     { label: "Frigo Trailer", value: "Frigo Trailer" },
//     { label: "7.5t", value: "7.5t" },
//     { label: "12t", value: "12t" },
//     { label: "Flexible Trailer", value: "Flexible Trailer" },
//   ];

//   // Basic validation for demo (required fields)
//   const validate = () => {
//     const e: { [k: string]: string } = {};
//     if (!form.netPrice) e.netPrice = "*Required";
//     if (!form.truckType) e.truckType = "*Required";
//     if (!form.validity) e.validity = "*Required";
//     if (!form.pickupDateTime) e.pickupDateTime = "*Required";
//     if (!form.dropoffDateTime) e.dropoffDateTime = "*Required";

//     // Dynamic minimum validity calculation
//     const now = moment();
//     const minValidityHours = now.diff(additionalInfo.requestDateTime, "hours") + 2;
//     const validHours = parseFloat(form.validity || "0");

//     if (form.validity && validHours < minValidityHours) {
//       e.validity = `Minimum accepted validity: ${minValidityHours} hours`;
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // Handlers
//   const handleInputChange = (field: string, v: any) => {
//     setForm((prev) => ({ ...prev, [field]: v }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const handleSubmit = () => {
//     if (validate()) {
//       // submit
//       alert("Offer submitted (simulate backend POST)");
//     }
//   };

//   return (
//     <Main>
//       <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>
//         Submit an Offer
//       </div>
//       <Card>
//         <InfoRow gutter={32}>
//           <InfoCol span={8}>
//             <SectionHeader>Route Information</SectionHeader>
//             <Label>Estimated Pick-Up:</Label>
//             <Value>{routeInfo.pickup}</Value>
//             <Label>Estimated Drop-Off:</Label>
//             <Value>{routeInfo.dropoff}</Value>
//             <Label>Total Distance:</Label>
//             <Value>{routeInfo.distance}</Value>
//             <Label>Access Type:</Label>
//             <Value>{routeInfo.access}</Value>
//           </InfoCol>
//           <InfoCol span={8}>
//             <SectionHeader>Goods Details</SectionHeader>
//             <Label>Type of Goods:</Label>
//             <Value>{goodsInfo.type}</Value>
//             <Label>Quantity:</Label>
//             <Value>{goodsInfo.quantity}</Value>
//             <Label>Dimensions per item:</Label>
//             <Value>{goodsInfo.dims}</Value>
//             <Label>LDM per item:</Label>
//             <Value>{goodsInfo.ldm}</Value>
//             <Label>Special Conditions:</Label>
//             <Value>{goodsInfo.special}</Value>
//           </InfoCol>
//           <InfoCol span={8}>
//             <SectionHeader>Additional Information</SectionHeader>
//             <Label>Schedule Type:</Label>
//             <Label>Pickup Date Range: <Value>{additionalInfo.pickupRange}</Value></Label>

//             <Label>Drop-off Date Range: <Value>{additionalInfo.dropoffRange}</Value></Label>

//             <Label>Currency: <Value>{additionalInfo.currency}</Value></Label>

//           </InfoCol>
//         </InfoRow>

//         <div className="offer-equal-height">
//         <OfferFormRow gutter={[16, 16]}>
//           <Col>
//             <Label>*Net Price</Label>
//             <Input
//               value={form.netPrice}
//               placeholder="Net Price EUR"
//               onChange={(e) => handleInputChange("netPrice", e.target.value)}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
//           </Col>
//           <Col>
//             <Label>Truck Type</Label>
//             <Select
//               value={form.truckType}
//               placeholder="Truck Type"
//               options={truckTypeList}
//               onChange={(v) => handleInputChange("truckType", v)}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
//           </Col>
//           <Col>
//             <Label>Estimated Pickup Date and Time</Label>
//             <DatePicker
//               style={{ width: `${inputWidth}px` }}
//               showTime
//               value={form.pickupDateTime}
//               onChange={(dt) => handleInputChange("pickupDateTime", dt)}
//               placeholder="Estimated Pickup Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.pickupDateTime && <ErrorText>{errors.pickupDateTime}</ErrorText>}
//           </Col>
//           <Col>
//             <Label>Estimated Drop-off Date and Time</Label>
//             <DatePicker
//               style={{ width: `${inputWidth}px` }}
//               showTime
//               value={form.dropoffDateTime}
//               onChange={(dt) => handleInputChange("dropoffDateTime", dt)}
//               placeholder="Estimated Drop-off Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.dropoffDateTime && <ErrorText>{errors.dropoffDateTime}</ErrorText>}
//           </Col>
//           <Col>
//             <Label>*Validity of Offer</Label>
//             <Input
//               value={form.validity}
//               type="text" // text to allow decimal with dot
//               placeholder="Validity of Offer (hours)"
//               onChange={(e) => {
//                 let val = e.target.value;
//                 val = val.replace(",", ".");
//                 if (/^\d*\.?\d*$/.test(val)) {
//                   handleInputChange("validity", val);
//                 }
//               }}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//             <div style={{ color: "#f5222d", fontSize: 13, marginTop: 8 }}>
//               Minimum accepted validity:{" "}
//               {Math.max(22, moment().diff(additionalInfo.requestDateTime, "hours") + 2)} hours
//             </div>
//           </Col>
//         </OfferFormRow>
//         </div>

//         <Row justify="end" style={{ marginTop: 36, marginBottom: -12 }}>
//           <Col>
//             <SubmitButton type="primary" onClick={handleSubmit}>
//               Submit Offer
//             </SubmitButton>
//           </Col>
//           <Col>
//             <CancelButton style={{ marginLeft: 12 }} onClick={() => window.history.back()}>
//               Cancel
//             </CancelButton>
//           </Col>
//         </Row>
//       </Card>
//     </Main>
//   );
// };

// export default SubmitOfferPage;

// import { Card, Col, DatePicker, Input, Row, Button, Select, Divider } from "antd";
// import { useState } from "react";
// import styled from "styled-components";
// import moment from "moment";
// import { Main } from "container/styled";
// import { Cards } from "components/cards/frame/cards-frame";

// const SectionHeader = styled.h3`
//   font-weight: 600;
//   font-size: 15px;
//   color: #000;
//   margin-bottom: 12px;
// `;

// const InfoRow = styled(Row)`
//   margin-bottom: 30px;
// `;

// const InfoCol = styled(Col)`
//   border-right: 1px solid #ededed;
//   &:last-child {
//     border-right: none;
//   }
//   padding-right: 16px;
// `;

// const Label = styled.div`
//   font-weight: 600;
//   font-size: 13px;
//   color: #000;
// `;

// const Value = styled.div`
//   font-weight: 400;
//   font-size: 13px;
//   color: #737373;
//   margin-bottom: 8px;
// `;

// const OfferFormRow = styled(Row)`
//   margin-top: 35px;
//   margin-bottom: 35px;
// `;

// const ErrorText = styled.div`
//   color: #f5222d;
//   font-size: 13px;
//   margin-top: 5px;
// `;

// const SubmitButton = styled(Button)`
//   background: #37b635 !important;
//   border: none !important;
//   min-width: 120px;
// `;

// const CancelButton = styled(Button)`
//   min-width: 120px;
// `;

// // SubmitOfferPage component
// export const SubmitOfferPage = () => {
//   // Dummy backend data
//   const [routeInfo] = useState({
//     pickup: "Skopje, 1000, MKD",
//     dropoff: "Ohrid, 6000, MKD",
//     distance: "180 km",
//     access: "Commercial without ramp but with forklift",
//   });
//   const [goodsInfo] = useState({
//     type: "Pallet",
//     quantity: 32,
//     dims: "1m, 1.20m, 0.8m, 80kg",
//     ldm: "1.2",
//     special: "Cargo items are not stackable, ...",
//   });
//   const [additionalInfo] = useState({
//     pickupRange: "10.08.2025-16.08.2025, 14:30-18:30",
//     dropoffRange: "13.09.2025-15.09.2025, 11:00-13:00",
//     currency: "EUR",
//   });

//   // Form state
//   const [form, setForm] = useState({
//     netPrice: "",
//     truckType: "",
//     validity: "",
//     pickupDateTime: null as null | moment.Moment,
//     dropoffDateTime: null as null | moment.Moment,
//   });
//   const [errors, setErrors] = useState<{ [k: string]: string }>({});
//   const inputWidth = 330;

//   const truckTypeList = [
//     { label: "Road Train", value: "Road Train" },
//     { label: "Frigo Trailer", value: "Frigo Trailer" },
//     { label: "7.5t", value: "7.5t" },
//     { label: "12t", value: "12t" },
//     { label: "Flexible Trailer", value: "Flexible Trailer" },
//   ];

//   // Basic validation for demo (required fields)
//   const validate = () => {
//     const e: { [k: string]: string } = {};
//     if (!form.netPrice) e.netPrice = "*Required";
//     if (!form.truckType) e.truckType = "*Required";
//     if (!form.validity) e.validity = "*Required";
//     if (!form.pickupDateTime) e.pickupDateTime = "*Required";
//     if (!form.dropoffDateTime) e.dropoffDateTime = "*Required";
//     const validHours = parseFloat(form.validity || "0");
//     if (form.validity && validHours < 22)
//     e.validity = "Minimum accepted validity: 22 hours";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // Handlers
//   const handleInputChange = (field: string, v: any) => {
//     setForm((prev) => ({ ...prev, [field]: v }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const handleSubmit = () => {
//     if (validate()) {
//       // submit
//       alert("Offer submitted (simulate backend POST)");
//     }
//   };

//   return (
//     <Main>
//       <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 24 }}>
//         Submit an Offer
//       </div>
//       <Card>
//         <InfoRow gutter={32}>
//           <InfoCol span={8}>
//             <SectionHeader>Route Information</SectionHeader>
//             <Label>Estimated Pick-Up:</Label>
//             <Value>{routeInfo.pickup}</Value>
//             <Label>Estimated Drop-Off:</Label>
//             <Value>{routeInfo.dropoff}</Value>
//             <Label>Total Distance:</Label>
//             <Value>{routeInfo.distance}</Value>
//             <Label>Access Type:</Label>
//             <Value>{routeInfo.access}</Value>
//           </InfoCol>
//           <InfoCol span={8}>
//             <SectionHeader>Goods Details</SectionHeader>
//             <Label>Type of Goods:</Label>
//             <Value>{goodsInfo.type}</Value>
//             <Label>Quantity:</Label>
//             <Value>{goodsInfo.quantity}</Value>
//             <Label>Dimensions per item:</Label>
//             <Value>{goodsInfo.dims}</Value>
//             <Label>LDM per item:</Label>
//             <Value>{goodsInfo.ldm}</Value>
//             <Label>Special Conditions:</Label>
//             <Value>{goodsInfo.special}</Value>
//           </InfoCol>
//           <InfoCol span={8}>
//             <SectionHeader>Additional Information</SectionHeader>
//             <Label>Schedule Type:</Label>
//             <Value>Pickup Date Range: {additionalInfo.pickupRange}</Value>
//             <Value>Drop-off Date Range: {additionalInfo.dropoffRange}</Value>
//             <Value>Currency: {additionalInfo.currency}</Value>
//           </InfoCol>
//         </InfoRow>

//         {/* <div className="offer-equal-height">
//         <OfferFormRow gutter={[16, 16]}>
//           <Col span={6}>
//             <Label>*Net Price</Label>
//             <Input
//               value={form.netPrice}
//               placeholder="Net Price EUR"
//               onChange={(e) => handleInputChange("netPrice", e.target.value)}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
//           </Col>
//           <Col span={6}>
//             <Label>Truck Type</Label>
//             <Select
//               value={form.truckType}
//               placeholder="Truck Type"
//               options={truckTypeList}
//               onChange={(v) => handleInputChange("truckType", v)}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
//           </Col>
//           <Col span={6}>
//             <Label>Estimated Pickup Date and Time</Label>
//             <DatePicker
//               style={{ width: `${inputWidth}px` }}
//               showTime
//               value={form.pickupDateTime}
//               onChange={(dt) => handleInputChange("pickupDateTime", dt)}
//               placeholder="Estimated Pickup Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.pickupDateTime && (
//               <ErrorText>{errors.pickupDateTime}</ErrorText>
//             )}
//           </Col>
//           <Col span={6}>
//             <Label>Estimated Drop-off Date and Time</Label>
//             <DatePicker
//               style={{ width: `${inputWidth}px` }}
//               showTime
//               value={form.dropoffDateTime}
//               onChange={(dt) => handleInputChange("dropoffDateTime", dt)}
//               placeholder="Estimated Drop-off Date and Time"
//               format="DD.MM.YYYY HH:mm"
//             />
//             {errors.dropoffDateTime && (
//               <ErrorText>{errors.dropoffDateTime}</ErrorText>
//             )}
//           </Col>
//         </OfferFormRow>

//         <OfferFormRow gutter={[16, 16]}>
//           <Col span={6}>
//             <Label>*Validity of Offer</Label>
//             <Input
//               value={form.validity}
//               type="number"
//               placeholder="Validity of Offer"
//               onChange={(e) => handleInputChange("validity", e.target.value)}
//               style={{ width: `${inputWidth}px` }}
//             />
//             {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//             <div
//               style={{ color: "#f5222d", fontSize: 13, marginTop: "0.8em" }}
//             >
//               Minimum accepted validity: 22 hours
//             </div>
//           </Col>
//         </OfferFormRow> */}

//         <div className="offer-equal-height">
//           <OfferFormRow gutter={[16, 16]}>
//             {" "}
//             {/* gutter can be array [horizontal, vertical] */}
//             <Col>
//               <Label>*Net Price</Label>
//               <Input
//                 value={form.netPrice}
//                 placeholder="Net Price EUR"
//                 onChange={(e) => handleInputChange("netPrice", e.target.value)}
//                 style={{ width: `${inputWidth}px` }}
//               />
//               {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
//             </Col>
//             <Col>
//               <Label>Truck Type</Label>
//               <Select
//                 value={form.truckType}
//                 placeholder="Truck Type"
//                 options={truckTypeList}
//                 onChange={(v) => handleInputChange("truckType", v)}
//                 style={{ width: `${inputWidth}px` }}
//               />
//               {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
//             </Col>
//             <Col>
//               <Label>Estimated Pickup Date and Time</Label>
//               <DatePicker
//                 style={{ width: `${inputWidth}px` }}
//                 showTime
//                 value={form.pickupDateTime}
//                 onChange={(dt) => handleInputChange("pickupDateTime", dt)}
//                 placeholder="Estimated Pickup Date and Time"
//                 format="DD.MM.YYYY HH:mm"
//               />
//               {errors.pickupDateTime && (
//                 <ErrorText>{errors.pickupDateTime}</ErrorText>
//               )}
//             </Col>
//             <Col>
//               <Label>Estimated Drop-off Date and Time</Label>
//               <DatePicker
//                 style={{ width: `${inputWidth}px` }}
//                 showTime
//                 value={form.dropoffDateTime}
//                 onChange={(dt) => handleInputChange("dropoffDateTime", dt)}
//                 placeholder="Estimated Drop-off Date and Time"
//                 format="DD.MM.YYYY HH:mm"
//               />
//               {errors.dropoffDateTime && (
//                 <ErrorText>{errors.dropoffDateTime}</ErrorText>
//               )}
//             </Col>
//             {/* <Col>
//               <Label>*Validity of Offer</Label>
//               <Input
//                 value={form.validity}
//                 type="text"
//                 placeholder="Validity of Offer (hours)"
//                 onChange={(e) => handleInputChange("validity", e.target.value)}
//                 style={{ width: `${inputWidth}px` }}
//               />
//               {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//               <div style={{ color: "#f52222", fontSize: 13, marginTop: 8 }}>
//                 Minimum accepted validity: 22 hours
//               </div>
//             </Col> */}
//             <Col>
//               <Label>*Validity of Offer</Label>
//               <Input
//                 value={form.validity}
//                 type="text" // use text for better decimal input handling
//                 placeholder="Validity of Offer (hours)"
//                 onChange={(e) => {
//                   let val = e.target.value;
//                   val = val.replace(",", ".");
//                   if (/^\d*\.?\d*$/.test(val)) {
//                     // allow digits and at most one dot
//                     handleInputChange("validity", val);
//                   }
//                 }}
//                 style={{ width: `${inputWidth}px` }}
//               />

//               {errors.validity && <ErrorText>{errors.validity}</ErrorText>}
//               <div style={{ color: "#f52222", fontSize: 13, marginTop: 8 }}>
//                 Minimum accepted validity: 22 hours
//               </div>
//             </Col>
//           </OfferFormRow>
//         </div>

//         <Row justify="end" style={{ marginTop: 36, marginBottom: -12 }}>
//           <Col>
//             <SubmitButton type="primary" onClick={handleSubmit}>
//               Submit Offer
//             </SubmitButton>
//           </Col>
//           <Col>
//             <CancelButton
//               style={{ marginLeft: 12 }}
//               onClick={() => window.history.back()}
//             >
//               Cancel
//             </CancelButton>
//           </Col>
//         </Row>
//       </Card>
//     </Main>
//   );
// };

// export default SubmitOfferPage;
