import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Row, Col, Form, Input, Select, Radio, Checkbox, PageHeader, RadioChangeEvent, DatePicker, TimePicker, Spin, message, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { BasicFormWrapper } from '../../../container/styled';
import Heading from 'components/heading/heading';
import { Button } from 'components/buttons/buttons';
import { useTranslation } from 'react-i18next';
//@ts-ignore
import FeatherIcon from 'feather-icons-react';
import { Main } from "../../../container/styled";
import { WizardBlock } from './Style';
import { ProjectHeader } from "../../localization/email/style";
import styled from 'styled-components';
import type { IconType } from "react-icons";
import { CiRoute } from "react-icons/ci";
import { FaBoxOpen } from "react-icons/fa";
import { AiOutlineInfo } from "react-icons/ai";
import { FaFileCircleCheck } from "react-icons/fa6";
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CodebookApi, CodebookDto, RequestsApi } from "../../../api";
import openNotificationWithIcon from 'utility/notification';
import dayjs from 'dayjs';
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { hasPermission } from "utility/accessibility/hasPermission";
import { getDistanceInKm } from 'utility/distance-calc';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

const codebooksApi = new CodebookApi();
const requestsApi = new RequestsApi();

interface WizardStep {
  title: string;
  icon: IconType;
  content: React.ReactNode;
}

const { Option } = Select;

const DimensionInput = styled(InputNumber)`
// height: 48px;

// input {
//   text-align: center;
// }

// &::placeholder {
//   white-space: pre-line;   
//   text-align: center;     
//   line-height: 1.2;    
//   position: relative;
//   top: 40%;
//   transform: translateY(-50%); 
//   display: block;
// }
width: 100%;
height: 48px;
text-align: center;

/* Center numeric text */
input {
  text-align: center;
  height: 48px;
  line-height: 1.2;
}

/* Multi-line placeholder styling */
input::placeholder {
  white-space: pre-line;
  text-align: center;
  line-height: 1.2;
  display: block;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.25); /* AntD default placeholder color */
}
input::placeholder {
  transform: translateY(-100%);
}
`;

const ContinueButton = styled(Button)`
&.btn-continue {
width: 150px;  
}
`;

const NextButton = styled(Button)`
&.btn-next {
width: 150px;  
}
`;
const AddNewButton = styled(Button)`
&.btn-add_new {
width: 150px;   
}
`;

const EstimatedInput = ({ placeholder, ...props }: { placeholder: string }) => (
  <div style={{ position: 'relative' }}>
    <Input
      {...props}
      placeholder={placeholder}
      readOnly
      style={{
        backgroundColor: 'rgb(95, 99, 242)',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        height: 48,
        cursor: 'pointer',
        border: 'none',
      }}
    />
  </div>
);

interface RequestWizzardProps {
  viewKey?: string;
}

const RequestWizzard: React.FC<RequestWizzardProps> = ({ viewKey }) => {
  const isReadOnly = viewKey === "view";
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [routeForm] = Form.useForm();
  const [goodsForm] = Form.useForm();
  const [additionalForm] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const params = useParams();
  const { RangePicker: TimeRangePicker } = TimePicker;
  const { RangePicker: DateRangePicker } = DatePicker;
  const [codebooks, setCodebooks] = useState<{
    Country: CodebookDto[];
    TrailerType: CodebookDto[];
    Certificate: CodebookDto[];
    GoodsType: CodebookDto[];
    CemtPermit: CodebookDto[];
    License: CodebookDto[];
    OperatingCountry: CodebookDto[];
    Currency: CodebookDto[];
  }>({
    Country: [],
    TrailerType: [],
    Certificate: [],
    GoodsType: [],
    CemtPermit: [],
    License: [],
    OperatingCountry: [],
    Currency: [],
  });

  const [current, setCurrent] = useState(0)
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [dateType, setDateType] = useState("noGrantedDates");
  const [requestLoading, setRequestLoading] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distance, setDistance] = useState<string | null>("");

  const safeDayjs = (value?: string | Date | null) => {
    if (!value) return undefined;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : undefined;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      
      try {
        setRequestLoading(true);
        const response = await requestsApi.apiTransportManagementIdGet({
          transportRequestId: params.id as string
        });
        setRequestLoading(false);
        const responseData: any = response.data;

        // ----- Extract data -----
        const pickup = responseData.transportPickup?.[0];
        const delivery = responseData.transportDelivery?.[0];
        const goods = responseData.transportGoods?.[0];
        const info = responseData.transportInformation?.[0];

        // ----- Set Route Form -----
        routeForm.setFieldsValue({
          pickup_companyName: pickup?.companyName,
          pickup_countryId: pickup?.countryId,
          pickup_city: pickup?.city,
          pickup_companyAddress: pickup?.companyAddress,
          pickup_postalCode: pickup?.postalCode,

          dropoff_companyName: delivery?.companyName,
          dropoff_countryId: delivery?.countryId,
          dropoff_city: delivery?.city,
          dropoff_companyAddress: delivery?.companyAddress,
          dropoff_postalCode: delivery?.postalCode,
          accessibility: responseData?.accessibility

        });

        // ----- Set Goods Form -----
        goodsForm.setFieldsValue({
          typeOfGoodsId: goods?.typeOfGoodsId,
          quantity: goods?.quantity,
          length: goods?.length,
          width: goods?.width,
          height: goods?.height,
          weight: goods?.weight,
          isIncludesAdrGoods: goods?.isIncludesAdrGoods,
          isCargoNotStackable: goods?.isCargoNotStackable,
        });

        // ----- Set Additional Form -----
        if (info) {
          setDateType(info.dateSelectionOption === 1 ? "noGrantedDates" : "selectDates")
          additionalForm.setFieldsValue({
            dateSelectionOption: info.dateSelectionOption === 1 ? "noGrantedDates" : "selectDates",
            pickupDateRange:
              safeDayjs(info.pickupDateFrom) && safeDayjs(info.pickupDateTo)
                ? [safeDayjs(info.pickupDateFrom), safeDayjs(info.pickupDateTo)]
                : undefined,
            dropoffDateRange:
              safeDayjs(info.deliveryDateFrom) && safeDayjs(info.deliveryDateTo)
                ? [safeDayjs(info.deliveryDateFrom), safeDayjs(info.deliveryDateTo)]
                : undefined,
            pickupTimeRange:
              safeDayjs(info.pickupTimeFrom) && safeDayjs(info.pickupTimeTo)
                ? [safeDayjs(info.pickupTimeFrom), safeDayjs(info.pickupTimeTo)]
                : undefined,
            dropoffTimeRange:
              safeDayjs(info.deliveryTimeFrom) && safeDayjs(info.deliveryTimeTo)
                ? [safeDayjs(info.deliveryTimeFrom), safeDayjs(info.deliveryTimeTo)]
                : undefined,
            currencyId: info.currencyId,
          });
        }
        if(viewKey === "TemplateEdit" || viewKey === "view"){
          setSaveAsTemplate(responseData?.isTemplate);
          // ----- Set Review Form -----
          reviewForm.setFieldsValue({
            templateName: responseData.templateName || "",
          });
          setDistance(responseData?.totalDistance + " km");
        }

      } catch (error) {
        console.error(error);
      }
    };

    if (params.id) fetchDetails();
  }, [params.id]);


  const handleDateTypeChange = (e: RadioChangeEvent) => {
    setDateType(e.target.value);

    if (e.target.value === "selectDates") {
      additionalForm.setFieldsValue({
        pickupDateRange: undefined,
        dropoffDateRange: undefined,
        pickupTimeRange: undefined,
        dropoffTimeRange: undefined,
      });
    }
  };


  useLayoutEffect(() => {
    const activeElement = document.querySelectorAll('.ant-steps-item-active');
    const successElement = document.querySelectorAll('.ant-steps-item-finish');

    activeElement.forEach((element) => {
      const bgImage = element.previousElementSibling as HTMLElement | null;
      if (bgImage) {
        if (bgImage.classList.contains('success-step-item')) {
          bgImage.classList.remove('success-step-item');
        } else {
          bgImage.classList.remove('wizard-step-item');
        }
        bgImage.classList.add('wizard-steps-item-active');
      }
    });

    successElement.forEach((element) => {
      const bgImage = element.previousSibling as HTMLElement | null;
      if (bgImage) {
        bgImage.classList.remove('wizard-steps-item-active');
        bgImage.classList.add('success-step-item');
      }
    });
  });

  useEffect(() => {
    const fetchCodebooks = async () => {
      setRequestLoading(true);
      const { data } = await codebooksApi.apiCodebookGet();
      setRequestLoading(false);
      setCodebooks({
        Country: data.Country || [],
        TrailerType: data.TrailerType || [],
        CemtPermit: data.CemtPermit || [],
        Certificate: data.Certificate || [],
        GoodsType: data.GoodsType || [],
        License: data.License || [],
        OperatingCountry: data.OperatingCountry || [],
        Currency: data.Currency || [],
      });
    };
    fetchCodebooks();
  }, []);


  const pickupCity = Form.useWatch("pickup_city", routeForm) as string | undefined;
  const pickupPostal = Form.useWatch("pickup_postalCode", routeForm) as string | undefined;
  const pickupCountry = Form.useWatch("pickup_countryId", routeForm) as string | undefined;
  const pickupCountryName = codebooks?.Country?.find(
    (item) => String(item.id) === String(pickupCountry)
  )?.name;

  const pickupAddress = Form.useWatch("pickup_companyAddress", routeForm) as string | undefined;

  const pickupCountryCode = pickupCountryName?.match(/\(([^)]+)\)/)?.[1] || pickupCountryName || "XX";

  const dropoffCity = Form.useWatch("dropoff_city", routeForm) as string | undefined;
  const dropoffPostal = Form.useWatch("dropoff_postalCode", routeForm) as string | undefined;
  const dropoffCountry = Form.useWatch("dropoff_countryId", routeForm) as string | undefined;
  const dropoffCountryName = codebooks?.Country?.find(
    (item) => String(item.id) === String(dropoffCountry)
  )?.name;
  const dropAddress = Form.useWatch("dropoff_companyAddress", routeForm) as string | undefined;

  

  const dropoffCountryCode = dropoffCountryName?.match(/\(([^)]+)\)/)?.[1] || dropoffCountryName || "XX";

  useEffect(() => {
    const fetchDistance = async () => {
      if (
        pickupCity &&
        pickupPostal &&
        pickupCountryName &&
        dropoffCity &&
        dropoffPostal &&
        dropoffCountryName && 
        !isReadOnly
      ) {
        
        setDistanceLoading(true);
        const pickup = {
          countryId: pickupCountryName,
          city: pickupCity,
          companyAddress: pickupAddress,
          postalCode: pickupPostal,
        };

        const delivery = {
          countryId: dropoffCountryName,
          city: dropoffCity,
          companyAddress: dropAddress,
          postalCode: dropoffPostal,
        };
        try {
          const totalDistance = await getDistanceInKm(pickup, delivery);
          setDistance(totalDistance);
        } catch (error) {
        } finally {
          setDistanceLoading(false);
        }
      }
    };

    fetchDistance();
  }, [
    pickupCity,
    pickupPostal,
    pickupCountryName,
    dropoffCity,
    dropoffPostal,
    dropoffCountryName,
  ]);



  enum VehicleAccessType {
    RampLift = 1,
    Forklift = 2,
    None = 3,
  }

  const length = Form.useWatch("length", goodsForm);
  const width = Form.useWatch("width", goodsForm);
  const height = Form.useWatch("height", goodsForm);
  const weight = Form.useWatch("weight", goodsForm);

  const ldmValue =
    length && width && height ? (Math.round(length * width * height * 100) / 100).toFixed(2) : "0";

  const ldmPlaceholder = `${t("new-transport-request-goods.ldm-per-item", "LDM Per Item:")} ${ldmValue} m³`;

  const transformRequest = () => {
    const transportPickupAndDelivery = routeForm.getFieldsValue();
    const transportGoods = goodsForm.getFieldsValue();
    const transportInformation = additionalForm.getFieldsValue();
    const review = reviewForm.getFieldsValue();
    const totalDistanceStr = distance || "";
    const data = {
      "templateId":params.id ? params.id : "",
      "accessibility": transportPickupAndDelivery?.accessibility,
      "totalDistance": parseFloat(totalDistanceStr.replace(/[^\d.]/g, "")) || 0,
      "isTemplate": saveAsTemplate,
      "templateName": review.templateName,
      "transportPickup": {
        "companyName": transportPickupAndDelivery.pickup_companyName,
        "countryId": transportPickupAndDelivery.pickup_countryId,
        "city": transportPickupAndDelivery.pickup_city,
        "companyAddress": transportPickupAndDelivery.pickup_companyAddress,
        "postalCode": transportPickupAndDelivery.pickup_postalCode
      },
      "transportDelivery": {
        "companyName": transportPickupAndDelivery.dropoff_companyName,
        "countryId": transportPickupAndDelivery.dropoff_countryId,
        "city": transportPickupAndDelivery.dropoff_city,
        "companyAddress": transportPickupAndDelivery.dropoff_companyAddress,
        "postalCode": transportPickupAndDelivery.dropoff_postalCode
      },
      "transportGoods": {
        "typeOfGoodsId": transportGoods.typeOfGoodsId,
        "quantity": Number(transportGoods.quantity),
        "length": parseFloat(transportGoods.length),
        "width": parseFloat(transportGoods.width),
        "height": parseFloat(transportGoods.height),
        "weight": parseFloat(transportGoods.weight),
        "isIncludesAdrGoods": transportGoods.isIncludesAdrGoods,
        "isCargoNotStackable": transportGoods.isCargoNotStackable
      },
      "transportInformation": {
        "dateSelectionOption": transportInformation.dateSelectionOption === "noGrantedDates" ? 1 : 2,
        "pickupDateFrom": transportInformation.pickupDateRange?.[0] || null,
        "pickupDateTo": transportInformation.pickupDateRange?.[1] || null,
        "pickupTimeFrom": transportInformation.pickupTimeRange?.[0] || null,
        "pickupTimeTo": transportInformation.pickupTimeRange?.[1] || null,
        "deliveryDateFrom": transportInformation.dropoffDateRange?.[0] || null,
        "deliveryDateTo": transportInformation.dropoffDateRange?.[1] || null,
        "deliveryTimeFrom": transportInformation.dropoffTimeRange?.[0] || null,
        "deliveryTimeTo": transportInformation.dropoffTimeRange?.[1] || null,
        "currencyId": transportInformation.currencyId
      }
    }

    return data;
  }

  const requestData = transformRequest();

  // --- Step 1: Route ---
  const step1Content = (
    <Form form={routeForm} name="routes" layout="vertical" disabled={isReadOnly}>
      <BasicFormWrapper className="basic-form-inner">
        <div className="atbd-form-checkout" style={{ marginTop: -29 }}>
          <Row justify="center">
            <Col span={24}>
              <div style={{ marginBottom: "24px", paddingTop: '20px' }}>
                <div style={{ display: '-webkit-inline-box', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  <FeatherIcon icon="upload" color="rgb(95, 99, 242)" size={20} />
                  <Heading as="h4">{t("new-transport-request-route.pickup-header", "Possible Pick-Up (Origin)")}</Heading>
                </div>
                {/* <Form layout="vertical" name="pickup"> */}
                <Row gutter={16}>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="pickup_companyName"
                      required
                      label={t("global.company-name", "Company Name")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.company-name", "Company Name"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.company-name", "Company Name"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.company-name", "Company Name")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="pickup_countryId"
                      label={t("global.country", "Country")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.country", "Country"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.country", "Country"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Select placeholder={t("global.country", "Country")}>
                        {codebooks.Country.map((item: CodebookDto) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item name="pickup_city" label={t("global.city", "City")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.city", "City"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.city", "City"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.city", "City")} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="pickup_companyAddress"
                      label={t("global.company-address", "Company Address")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.company-address", "Company Address"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.company-address", "Company Address"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.company-address", "Company Address")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="pickup_postalCode"
                      label={t("global.postal-code", "Postal Code")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.postal-code", "Postal Code"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.postal-code", "Postal Code"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.postal-code", "Postal Code")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24} style={{ padding: '36px 11px 0px 4px' }}>
                    <Form.Item
                      name="pickup_estimation"
                    >
                      <EstimatedInput placeholder={`${t("new-transport-request-route.pickup-estimation-placeholder", "Estimated:")} ${pickupCity || "City"}, ${pickupPostal || "0000"} - ${pickupCountryCode}`} />
                    </Form.Item>
                  </Col>
                </Row>
                {/* </Form> */}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: '-webkit-inline-box', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  <FeatherIcon icon="download" color="rgb(95, 99, 242)" size={20} />
                  <Heading as="h4">{t("new-transport-request-route.delivery-header", "Requested Delivery (Destination)")}</Heading>
                </div>
                {/* <Form layout="vertical" name="dropoff"> */}
                <Row gutter={16}>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="dropoff_companyName"
                      label={t("global.company-name", "Company Name")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.company-name", "Company Name"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.company-name", "Company Name"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.company-name", "Company Name")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="dropoff_countryId"
                      label={t("global.country", "Country")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.country", "Country"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.country", "Country"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Select placeholder={t("global.country", "Country")}>
                        {codebooks.Country.map((item: CodebookDto) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item name="dropoff_city" label={t("global.city", "City")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.city", "City"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.city", "City"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}>
                      <Input placeholder={t("global.city", "City")} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="dropoff_companyAddress"
                      label={t("global.company-address", "Company Address")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.company-address", "Company Address"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.company-address", "Company Address"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.company-address", "Company Address")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="dropoff_postalCode"
                      label={t("global.postal-code", "Postal Code")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global.postal-code", "Postal Code"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global.postal-code", "Postal Code"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Input placeholder={t("global.postal-code", "Postal Code")} />
                    </Form.Item>
                  </Col>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24} style={{ padding: '36px 7px 1px 10px' }}>
                    <Form.Item
                      name="dropoff_estimation"
                    >
                      <EstimatedInput placeholder={`${t("new-transport-request-route.dropoff_estimation-placeholder", "Estimated:")} ${dropoffCity || "City"}, ${dropoffPostal || "0000"} - ${dropoffCountryCode}`} />
                    </Form.Item>
                  </Col>
                </Row>
                {/* </Form> */}
              </div>

              <div style={{ paddingTop: "24px", marginBottom: "24px" }}>
                <Heading as="h4">
                  {t("new-transport-request-route.accessibility-header", "Select the type of accessibility available")}
                </Heading>
                <Form.Item name="accessibility" style={{ marginBottom: -12 }}
                  rules={[
                    {
                      required: true,
                      message: t("validations.required-field", {
                        field: t("global.accessibility", "Accessibility"),
                        defaultValue: "{{field}} is required!",
                      }),
                    },
                  ]}
                >
                  <Radio.Group style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginTop: 10 }}>
                    <Radio value={VehicleAccessType.RampLift}>{t("new-transport-request-route.accessibility-ramplift", "Commercial with ramp but with lift")}</Radio>
                    <Radio value={VehicleAccessType.Forklift}>{t("new-transport-request-route.accessibility-forklift", "Commercial without ramp but with forklift")}</Radio>
                    <Radio value={VehicleAccessType.None}>{t("new-transport-request-route.accessibility-none", "Commercial without forklift or ramp")}</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </div>
      </BasicFormWrapper>
    </Form>
  );

  // --- Step 2: Specify the Goods ---
  const step2Content = (
    <Form form={goodsForm} disabled={isReadOnly} name="goods" layout="vertical" initialValues={{ notStackable: true, adrGoods: false }} style={{ marginTop: 20 }}>
      <BasicFormWrapper className="basic-form-inner">
        <div className="atbd-form-checkout">
          <Row justify="center">
            <Col span={24}>
              <div style={{ borderRadius: 8, padding: 5, marginBottom: 12 }}>
                <Row gutter={24}>
                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="typeOfGoodsId"
                      label={t("type-of-goods", "Type of goods")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global:type-of-goods", "Type of goods"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global:type-of-goods", "Type of goods"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <Select placeholder={t("new-transport-request-goods.type-Of-goods-placeholder", "Select Goods")}>
                        {codebooks.GoodsType.map((item: CodebookDto) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item
                      name="quantity"
                      label={t("global:quantity", "Quantity")}
                      rules={[
                        {
                          required: true,
                          message: t("validations.required-field", {
                            field: t("global:quantity", "Quantity"),
                            defaultValue: "{{field}} is required!",
                          }),
                        },
                        {
                          pattern: /^(?!\s)(?!.*\s$).+/,
                          message: t("validations.no-whitespace", {
                            field: t("global:quantity", "Quantity"),
                            defaultValue: "{{field}} cannot be empty or whitespace only."
                          }),
                        },
                      ]}
                    >
                      <InputNumber placeholder={t("global:quantity", "Quantity")} type="number" min={1} />
                    </Form.Item>
                  </Col>

                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#ff4d4f' }}>*</span>{t("new-transport-request-goods.dimension-title", "Single Items Dimension")}
                    </div>
                    <Row gutter={8} style={{ paddingTop: 6 }}>
                      <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
                        <Form.Item
                          name="length"
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:length", "Length"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:length", "Length"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                          style={{ marginBottom: 10 }}
                        >
                          <DimensionInput
                            min={0}
                            type="number"
                            placeholder={`${t("new-transport-request-goods.dimension-length", "*Length")}`}
                          />
                        </Form.Item>
                      </Col>

                      <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
                        <Form.Item
                          name="width"
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:width", "Width"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:width", "Width"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                          style={{ marginBottom: 10 }}
                        >
                          <DimensionInput placeholder={t("new-transport-request-goods.dimension-width", "*Width (in meters)")} type='number' min={0} />
                        </Form.Item>
                      </Col>

                      <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
                        <Form.Item
                          name="height"
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:height", "Height"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:height", "Height"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                          style={{ marginBottom: 10 }}
                        >
                          <DimensionInput placeholder={t("new-transport-request-goods.dimension-height", "*Height (in meters)")} type='number' min={0} />
                        </Form.Item>
                      </Col>

                      <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
                        <Form.Item
                          name="weight"
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:weight", "Weight"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:weight", "Weight"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                          style={{ marginBottom: 10 }}
                        >
                          <DimensionInput placeholder={t("new-transport-request-goods.dimension-weight", "*Weight (in kilograms)")} type='number' min={0} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xxl={10} xl={10} lg={12} md={24} sm={24} xs={24} style={{ paddingTop: 10 }}>
                    <div style={{ fontWeight: 550, marginBottom: '10px' }}>{t("new-transport-request-goods.properties-header", "Additional Cargo Properties")}</div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <Form.Item name="isCargoNotStackable" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Checkbox>{t("new-transport-request-goods-properties.isCargoNotStackable", "Cargo items are not stackable")}</Checkbox>
                      </Form.Item>
                      <Form.Item name="isIncludesAdrGoods" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Checkbox>{t("new-transport-request-goods-properties.isIncludesAdrGoods", "Including ADR goods")}</Checkbox>
                      </Form.Item>
                    </div>
                  </Col>

                  <Col xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
                    {/* Empty column for alignment */}
                  </Col>

                  <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                    <Form.Item name="ldmPerItem" style={{ marginTop: 15, paddingLeft: 7 }}>
                      <EstimatedInput placeholder={ldmPlaceholder} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </BasicFormWrapper>
    </Form>
  );

  // --- Step 3: Additional Information ---
  const step3Content = (
    <Form form={additionalForm} name="additional" layout="vertical" initialValues={{ dateSelectionOption: 'noGrantedDates', currency: 'EUR' }} disabled={isReadOnly} >
      <BasicFormWrapper className="basic-form-inner">
        <div className="atbd-form-checkout">
          <Row justify="center">
            <Col span={24}>
              <div style={{ borderRadius: 8, marginBottom: 12 }}>
                <Heading as="h4">{t("new-transport-request-info.header", "Define Possible Pickup and Requested Delivery date and time")}</Heading>
                {/* <Form layout="vertical" name="pickup-dropoff" style={{marginTop: 30}}> */}
                <Row gutter={24} style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Form.Item name="dateSelectionOption" style={{ marginBottom: 0 }} initialValue="noGrantedDates">
                      <Radio.Group onChange={handleDateTypeChange} style={{ display: "flex", gap: 18, paddingTop: 20 }}>
                        <Radio value="noGrantedDates">{t("new-transport-request-info.dateType-noGrantedDates", "No granted dates")}</Radio>
                        <Radio value="selectDates">{t("new-transport-request-info.dateType-selectDates", "Select dates")}</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                {dateType === "selectDates" && (
                  <>
                    <Row gutter={16} style={{ marginTop: 40 }}>
                      <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                        <Form.Item name="pickupDateRange" label={t("new-transport-request-info-date-type-select-dates.pickupDate-label", "Possible Pickup Date Range")}
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:pickup-date-range", "Possible Pickup Date Range"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:pickup-date-range", "Possible Pickup Date Range"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                        >
                          <DateRangePicker style={{ width: "100%" }} placeholder={[t("global:start-date", "Start Date"), t("global:end-date", "End Date")]} />
                        </Form.Item>
                      </Col>
                      <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                        <Form.Item name="dropoffDateRange" label={t("new-transport-request-info-dateType-select-dates.delivery-date-label", "Requested Delivery Date Range")}
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:dropoff-date-range", "Dropoff Date Range"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:dropoff-date-range", "Dropoff Date Range"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}
                        >
                          <DateRangePicker style={{ width: "100%" }} placeholder={[t("global:start-date", "Start Date"), t("global:end-date", "End Date")]} />
                        </Form.Item>
                      </Col>
                      <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                        <Form.Item name="currencyId" label={t("new-transport-request-info.currency-label", "Currency")}
                          rules={[
                            {
                              required: true,
                              message: t("validations.required-field", {
                                field: t("global:currency", "Currency"),
                                defaultValue: "{{field}} is required!",
                              }),
                            },
                            {
                              pattern: /^(?!\s)(?!.*\s$).+/,
                              message: t("validations.no-whitespace", {
                                field: t("global:currency", "Currency"),
                                defaultValue: "{{field}} cannot be empty or whitespace only."
                              }),
                            },
                          ]}>
                          <Select placeholder={t("new-transport-request-info.currency-placeholder", "Select Currency")} style={{ height: '50px', fontSize: '14px' }}>
                            {codebooks.Currency.map((item: CodebookDto) => (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 30 }}>
                      <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                        <Form.Item name="pickupTimeRange" label="Possible Pickup Time Range">
                          <TimeRangePicker style={{ width: "100%" }} placeholder={[t("global:start-time", "Start Time"), t("global:end-time", "End Time")]} />
                        </Form.Item>
                      </Col>
                      <Col xxl={8} xl={8} lg={8} md={12} sm={24} xs={24}>
                        <Form.Item name="dropoffTimeRange" label="Requested Delivery Time Range">
                          <TimeRangePicker style={{ width: "100%" }} placeholder={[t("global:start-time", "Start Time"), t("global:end-time", "End Time")]} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
                {/* </Form> */}
              </div>
            </Col>
          </Row>
        </div>
      </BasicFormWrapper>
    </Form>
  );

  // --- Step 4: Your Transport Request (Review) ---
  const step4Content = (
    <Form form={reviewForm} name="review" layout="vertical" disabled={isReadOnly}>
      <BasicFormWrapper className="basic-form-inner">
        <Row justify="center">
          <Col span={24}>
            {(() => {
              const cardShadowStyle = {
                flex: 1,
                padding: "15px",
                border: '1px solid transparent',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                backgroundColor: '#fff'
              };

              return (
                <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: 'wrap' }}>
                  <div style={cardShadowStyle}>
                    <div style={{ display: '-webkit-box', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                      <Heading as="h4">{t("new-transport-request-review.route-header", "Route Information")}</Heading>
                      <FeatherIcon icon="info" color="rgb(95, 99, 242)" size={25} strokeWidth={3} />
                    </div>
                    <p style={{ margin: '5px 0', paddingTop: 10, color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-pickUp", "Possible Pick-Up:")}</strong> {[pickupCity, pickupPostal, pickupCountryCode].filter(Boolean).join(", ")}</p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-requestedDelivery", "Requested Delivery:")}</strong> {[dropoffCity, dropoffPostal, dropoffCountryCode].filter(Boolean).join(", ")}</p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-totalDistance", "Total Distance:")}</strong> {distance}</p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.route-info-accessType", "Access Type:")}</strong> {requestData.accessibility === 1 && ("Commercial with ramp but with lift")} {requestData.accessibility === 2 && ("Commercial without ramp but with forklift")}  {requestData.accessibility === 3 && ("Commercial without forklift or ramp")}</p>
                  </div>

                  <div style={cardShadowStyle}>
                    <div style={{ display: '-webkit-box', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                      <Heading as="h4">{t("new-transport-request-review.goods-header", "Goods Details")}</Heading>
                      <FeatherIcon icon="info" color="rgb(95, 99, 242)" size={25} strokeWidth={3} />
                    </div>
                    <p style={{ margin: '5px 0', paddingTop: 10, color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.typeOfGoods", "Type of Goods:")}</strong>{" "}
                      {
                        codebooks?.GoodsType?.find(
                          (item) => item.id === requestData.transportGoods.typeOfGoodsId
                        )?.name || "—"
                      }
                    </p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-Quantity", "Quantity:")}</strong> {requestData.transportGoods.quantity}</p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-Dimensions-per-item", "Dimensions per item:")}</strong> <br /> Length: <strong style={{ color: '#333' }}>{length}m</strong>, Width: <strong style={{ color: '#333' }}>{width}m</strong>, Heigth: <strong style={{ color: '#333' }}>{height}m</strong>, Weight: <strong style={{ color: '#333' }}>{weight}kg</strong></p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-LDM-per-item", "LDM per item:")}</strong> {ldmValue}m³</p>
                    <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.goods-special-conditions", "Special Conditions:")}</strong> {[requestData.transportGoods.isCargoNotStackable && "Cargo items are not stackable", requestData.transportGoods.isIncludesAdrGoods && "Including ADR goods"].filter(Boolean).join(', ') || "—"}</p>
                  </div>

                                    <div style={cardShadowStyle}>
                                        <div style={{ display: '-webkit-box', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                            <Heading as="h4">{t("new-transport-request-review.info-header", "Additional Information")}</Heading>
                                            <FeatherIcon icon="info" color="rgb(95, 99, 242)" size={25} strokeWidth={3} />
                                        </div>
                                        <p style={{ margin: '5px 0', paddingTop: 10, color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.info-scheduleType", "Schedule Type:")}</strong> {requestData.transportInformation.dateSelectionOption===1 && ("No Granted Dates")} {requestData.transportInformation.dateSelectionOption===2 && ("Select dates")}</p>
                                        <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.info-pickUp-dateTime", "Possible Pick-Up Date Range:")}</strong> {dayjs(requestData.transportInformation.pickupDateFrom).isValid() ? (
                                          `${dayjs(requestData.transportInformation.pickupDateFrom).format("YYYY.MM.DD")} - ${dayjs(requestData.transportInformation.pickupDateTo).format("YYYY.MM.DD")}${
                                            dayjs(requestData.transportInformation.pickupTimeFrom).isValid() && dayjs(requestData.transportInformation.pickupTimeTo).isValid() ? `, ${dayjs(requestData.transportInformation.pickupTimeFrom).format("HH:mm")} - ${dayjs(requestData.transportInformation.pickupTimeTo).format("HH:mm")}` : ""}`
                                        ) : (
                                          ""
                                        )}</p>
                                        <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.info-delivery-dateTime", "Requested Delivery Date Range:")}</strong> {dayjs(requestData.transportInformation.deliveryDateFrom).isValid() ? (
                                          `${dayjs(requestData.transportInformation.deliveryDateFrom).format("YYYY.MM.DD")} - ${dayjs(requestData.transportInformation.deliveryDateTo).format("YYYY.MM.DD")}${
                                            dayjs(requestData.transportInformation.pickupTimeFrom).isValid() && dayjs(requestData.transportInformation.pickupTimeTo).isValid() ? `, ${dayjs(requestData.transportInformation.deliveryTimeFrom).format("HH:mm")} - ${dayjs(requestData.transportInformation.deliveryTimeTo).format("HH:mm")}` : ""}`
                                        ) : ( 
                                          ""
                                        )}</p>
                                        <p style={{ margin: '5px 0', color: '#999' }}><strong style={{ color: '#333' }}>{t("new-transport-request-review.info-currency", "Currency:")}</strong>{" "}
                                        {
                                          codebooks?.Currency?.find(
                                            (item) => item.id === requestData.transportInformation.currencyId
                                          )?.name || "EUR"
                                          }</p>
                                    </div>
                                </div>
                            );
                        })()}
                        <Form.Item style={{ marginTop: 30 }}>
                            <Checkbox checked={saveAsTemplate} onChange={(e: CheckboxChangeEvent) => setSaveAsTemplate(e.target.checked)}>
                              {t("new-transport-request-review.save-as-template", "Save as Template")}
                            </Checkbox>
                        </Form.Item>
                        {saveAsTemplate && (
                                    <>
                                      <Form.Item
                                        name="templateName"
                                        rules={
                                           [
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                  field: t("global:template-name", "Template Name"),
                                                  defaultValue: "{{field}} is required!",
                                                }),
                                              }, 
                                              {
                                                pattern: /^(?!\s)(?!.*\s$).+/,
                                                message: t("validations.no-whitespace", {
                                                  field: t("global:template-name", "Template Name"),
                                                  defaultValue: "{{field}} cannot be empty or whitespace only."
                                                }),
                                              },
                                            ]
                                          }
                                      >
                                        <Input
                                          placeholder="Enter Template Name"
                                          style={{ width: 220, height: 40, fontSize: 14 }}
                                        />
                                      </Form.Item>
{/*                           
                                      <Button
                                        type="primary"
                                        // onClick={handleSaveTemplate}
                                        // style={{ height: 40 }}
                                      >
                                        Save
                                      </Button> */}
              </>
            )}
          </Col>
        </Row>
      </BasicFormWrapper>
    </Form>
  );


  const steps: WizardStep[] = [
    {
      title: t("new-transport-request.title-route", "Route"),
      icon: CiRoute,
      content: step1Content,
    },
    {
      title: t("new-transport-request.title-goods", "Specify the Goods"),
      icon: FaBoxOpen,
      content: step2Content,
    },
    {
      title: t("new-transport-request.title-additional-info", "Additional Information"),
      icon: AiOutlineInfo,
      content: step3Content,
    },
    {
      title: t("new-transport-request.title-request", "Your Transport Request"),
      icon: FaFileCircleCheck,
      content: step4Content,
    },
  ];

  const next = async () => {
    try {
      if (current === 0) await routeForm.validateFields();
      else if (current === 1) await goodsForm.validateFields();
      else if (current === 2) {
        await additionalForm.validateFields();
  
        const pickupRange = additionalForm.getFieldValue("pickupDateRange");
        const dropoffRange = additionalForm.getFieldValue("dropoffDateRange");
  
        const pickupEnd = pickupRange?.[1];
        const dropoffStart = dropoffRange?.[0];
  
        if (
          pickupRange &&
          dropoffRange &&
          pickupEnd &&
          dropoffStart &&
          pickupEnd.isAfter(dropoffStart)
        ) {
          additionalForm.setFields([
            {
              name: "dropoffDateRange",
              errors: [
                t(
                "shipment:delivery-date-invalid",
                "Delivery start date/time cannot be before pickup end date/time."
                ),
            ],
            },
          ]);
          return; 
        }
  
        additionalForm.setFields([
          {
            name: "dropoffDateRange",
            errors: [],
          },
        ]);
      } else if (current === 3) {
        await reviewForm.validateFields();
      }
  
      setCurrent(current + 1);
    } catch (err) {
    }
  };
  

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const onSubmit = async () => {
    try {
      if (current === 3) await reviewForm.validateFields();
      setIsSaving(true);
      const data = transformRequest();
      if(!params.id || viewKey !== "TemplateEdit"){
        delete (data as any).templateId;
      }
      const response = params.id && viewKey === "TemplateEdit" ?
        await requestsApi.apiUpdateTemplateIdPut({
          requestTransportQuery: data
        })
        : await requestsApi.apiRequestsTransportPost({
          requestTransportQuery: data
        })
      setIsSaving(false);
      if (response.status === 200) {
        params.id && viewKey === "TemplateEdit" ?
          openNotificationWithIcon(
            "success",
            t(
              "transport-request-template.success.update",
              "Transport Request Template Updated Successfully"
            )
          ) : openNotificationWithIcon(
            "success",
            t(
              "transport-request.success.add",
              "Transport Request Added Successfully"
            )
          );
        navigate("/my-requests");
      }
    } catch (err) {
      setIsSaving(false);
    }
  }

  return (
    <>
      <ProjectHeader style={{ marginBottom: -20 }}>
        <PageHeader
          ghost
          title={t("new-transport-request.title", "New Transport Request")}
          subTitle={<>{t("new-transport-request.step", {current: current + 1, total: steps?.length})}</>}
          extra={[
            !isReadOnly &&
            hasPermission("my-templates:list") && (
              <AddNewButton
                onClick={() => navigate("/my-requests/new-transport-request/my-templates")}
                className="btn-add_new"
                size="large"
                type="primary"
                key="add-template"
              >
                {t("new-transport-request.my-templates", "My Templates")}
              </AddNewButton>
            )
          ]}
        />
      </ProjectHeader>
      {requestLoading ? (
        <div
          style={{
            display: "flex",
            height: 400,
            width: "100%",
            justifyContent: "center",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <Main>
          <Row justify="center" >
            <Col xxl={24} xs={24} style={{ paddingTop: 40 }}>
              <WizardBlock
                style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: 10,
                  padding: '30px',
                  minHeight: 'calc(100vh - 250px)',
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Custom Step Indicator Bar */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginBottom: "40px", marginTop: "-88px" }}>
                  {steps.map((step, index) => {
                    const isCompleted = index < current;
                    const isCurrent = index === current;

                    const bgColor = isCurrent || isCompleted ? "rgb(95, 99, 242)" : "#d9d9d9";
                    const iconColor = isCurrent || isCompleted ? "#fff" : "#999";

                    const IconComponent = step.icon;

                    return (
                      <React.Fragment key={index} >
                        <div key={index} style={{ display: "flex", flex: "1 1 200px", maxWidth: "200px", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                          <div
                            style={{
                              // marginTop: 5,
                              marginTop: 10,
                              fontSize: 14,
                              color: isCurrent || isCompleted ? "black" : "#999",
                              fontWeight: isCurrent ? 600 : 400,
                              textAlign: "center",
                            }}
                          >
                            {step.title}
                          </div>
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              backgroundColor: bgColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: `2px solid ${bgColor}`,
                              transition: "all 0.3s ease",
                            }}
                            onClick={async () => {
                              try {
                                switch (current) {
                                  case 0: await routeForm.validateFields(); break;
                                  case 1: await goodsForm.validateFields(); break;
                                  case 2: await additionalForm.validateFields(); break;
                                  case 3: await reviewForm.validateFields(); break;
                                }
                                setCurrent(index);
                              } catch (err) {
                              }
                            }}
                          >
                            {/* <FeatherIcon icon={step.icon} color={iconColor} size={20} /> */}
                            <IconComponent strokeWidth={1} style={{ color: iconColor }} size={30} />
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                {/* End Custom Step Indicator Bar */}


                {/* Step Content */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: current === 0 ? 'block' : 'none' }}>{step1Content}</div>
                  <div style={{ display: current === 1 ? 'block' : 'none' }}>{step2Content}</div>
                  <div style={{ display: current === 2 ? 'block' : 'none' }}>{step3Content}</div>
                  <div style={{ display: current === 3 ? 'block' : 'none' }}>{step4Content}</div>
                </div>



                {/* Navigation Buttons */}
                <div
                  className="steps-action"
                  style={{ display: "flex", gap: 20, justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', marginTop: '20px', paddingRight: '50px' }}
                >
                  {current === 0 && (
                    <div style={{ fontWeight: 'bold', fontSize: '19px', order: 1 }}>
                      {t("new-transport-request-review.route-info-totalDistance", "Total Distance:")} 
                      {isReadOnly 
                          ? (
                              distance 
                          ) 
                          : distanceLoading 
                              ? (
                                  t("global:distance-loader", "Calculating distance, please wait...")
                              ) 
                              : (
                                  distance
                              )
                      }
                    </div>
                  )}

                  <div style={{ order: 2, flexGrow: 1 }} />

                  {current < steps.length - 1 && (
                    <ContinueButton
                      type="primary"
                      onClick={next}
                      className="btn-continue"
                      size="large"
                    >
                      {t("global:continue", "Continue")}
                      {/* <FeatherIcon icon="arrow-right" size={16} style={{ marginLeft: 8 }} /> */}
                    </ContinueButton>
                  )}

                  {current === 0 && (
                    <Button
                      type="default"
                      onClick={() => navigate(-1)}
                      className="btn-cancel border border-black"
                      size="large"
                    >
                      {t("global:cancel", "Cancel")}{" "}
                    </Button>
                  )}

                  <div style={{ order: 2, flexGrow: 1 }} />


                  {current === steps.length - 1 && (
                    <NextButton
                      disabled={isReadOnly}
                      className="btn-next"
                      type="primary"
                      loading={isSaving}
                      htmlType="submit"
                      size="large"
                      onClick={onSubmit}
                    >
                      {t("global:publish", "Publish")}{" "}
                      {/* <FeatherIcon icon="save" size={16} style={{ marginLeft: 8 }} /> */}
                    </NextButton>
                  )}

                  {current > 0 && (
                    <Button
                      type="default"
                      onClick={prev}
                      className="back-button border border-black"
                      size="large"
                    >
                      {/* <FeatherIcon icon="arrow-left" size={16} style={{ marginRight: 8 }} /> */}
                      {t("global:back", "Back")}{" "}
                    </Button>
                  )}
                </div>
              </WizardBlock>
            </Col>
          </Row>
        </Main>
      )}
    </>
  );
}

export default RequestWizzard;