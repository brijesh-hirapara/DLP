import {
  Col,
  DatePicker,
  Input,
  Row,
  Button,
  Select,
  Popconfirm,
  Form,
} from "antd";
import { useEffect } from "react";
import moment from "moment";
import {
  OfferCardStyled,
  OfferFormBg,
  SectionHeader,
  InfoLabel,
  InfoValue,
} from "container/styled";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CodebookDto } from "api/models";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";

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
  const [formInstance] = Form.useForm();
  const now = moment();
  const createdAtUtc = moment.utc(createdAt);
  const minValidityHours = now.diff(createdAtUtc.local(), "hours") + 2;

  const currency = additionalInfo?.currency || "EUR";
  const netPricePlaceholder = `Net Price ${currency}`;

  
  // Disable all dates before today
const disablePastDates = (current: any) => {
  return current && current < moment().startOf("day");
};

// Disable all times before current time on today
const disablePastTimes = (date: any, type = "start") => {
  if (!date) return {};
  if (date.isSame(moment(), "day")) {
    const currentHour = moment().hour();
    const currentMinute = moment().minute();
    return {
      disabledHours: () => [...Array(currentHour).keys()],
      disabledMinutes: (selectedHour: any) =>
        selectedHour === currentHour
          ? [...Array(currentMinute).keys()]
          : [],
    };
  }
  return {};
};

  // Set initial values if form data exists
  useEffect(() => {
    if (form && Object.keys(form).length > 0) {
      const initialValues: any = {};
      
      if (form.netPrice !== undefined) initialValues.netPrice = form.netPrice;
      if (form.validity !== undefined) initialValues.validity = form.validity;
      if (form.truckType !== undefined && form.truckType !== "") {
        initialValues.truckType = form.truckType;
      }
      if (form.pickupDateTimeRange !== undefined) {
        initialValues.pickupDateTimeRange = form.pickupDateTimeRange;
      }
      if (form.deliveryDateTimeRange !== undefined) {
        initialValues.deliveryDateTimeRange = form.deliveryDateTimeRange;
      }
      
      formInstance.setFieldsValue(initialValues);
    }
  }, [form, formInstance]);

  const onFinish = (values: any) => {
    handleSubmit(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    openNotificationWithIcon("error", t("validations.form-validation-failed", "Please check all required fields"));
  };

  return (
    <OfferCardStyled>
      <div className="margin-top-32-14-0-14">
        <Col className="margin-top-neg-30">
          <div className="flex-between">
            <InfoLabel>
              {t("offerCard.requestId:", "Request ID:")} {ordinalNumber}
            </InfoLabel>
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
                    {routeInfo.delivery}
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
          <div className="flex-gap40 " style={{ flex: 1 }}>
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
              <InfoValue>{additionalInfo.deliveryRange}</InfoValue>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <InfoLabel>{t("offerCard.currency:", "Currency:")}</InfoLabel>
            <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}> {additionalInfo.currency}</InfoValue>
          </div>
        </Col>
      </div>
      
      <OfferFormBg>
        <div>
          <SectionHeader>
            {t("offerCard.submit-your-offer:", "Submit your Offer:")}
          </SectionHeader>
        </div>
        
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          disabled={isViewOnly}
        >
          <Row className="offer-form-row" gutter={[16, 16]}>
            {/* Net Price */}
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="netPrice"
                label={t("offerCard.net-price", "Net Price")}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("offerCard.net-price", "Net Price"),
                      defaultValue: "Net Price is required!",
                    }),
                  },
                  {
                    pattern: /^\d*\.?\d*$/,
                    message: t("validations.invalid-number", "Please enter a valid number"),
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder={netPricePlaceholder}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            {/* Validity of Offer */}
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="validity"
                label={t("offerCard.validity-of-offer", "Validity of Offer")}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("offerCard.validity-of-offer", "Validity of Offer"),
                      defaultValue: "Validity of Offer is required!",
                    }),
                  },
                  {
                    pattern: /^\d*\.?\d*$/,
                    message: t("validations.invalid-number", "Please enter a valid number"),
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const numValue = Number(value.toString().replace(",", "."));
                      if (isNaN(numValue)) {
                        return Promise.reject(
                          new Error(t("validations.invalid-number", "Please enter a valid number"))
                        );
                      }
                      if (numValue < minValidityHours) {
                        return Promise.reject(
                          new Error(`Minimum accepted validity: ${minValidityHours} hours`)
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                normalize={(value) => {
                  return value ? value.replace(",", ".") : value;
                }}
              >
                <Input
                  size="large"
                  type="text"
                  placeholder={`Minimum: ${minValidityHours} hours`}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            {/* Truck Type */}
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                name="truckType"
                label={t("offerCard.truck-type", "Truck Type")}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("offerCard.truck-type", "Truck Type"),
                      defaultValue: "Truck Type is required!",
                    }),
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder={t(
                    "submitOfferPage.trailertypePlaceholder",
                    "Select Truck Type"
                  )}
                  style={{ width: "100%" }}
                  className="custom-select-dropdown"
                >
                  {trailertypeOptions.map((item: CodebookDto) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            {/* Pickup Date & Time */}
            <Col xs={24} sm={12} md={12} lg={12}>
              <Form.Item
              className="rangepicker-responsive"
                name="pickupDateTimeRange"
                label={t(
                  "offerCard.possible-pick-up-date-&-time:",
                  "Possible Pick-Up Date & Time:"
                )}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t(
                        "offerCard.possible-pick-up-date-&-time:",
                        "Possible Pick-Up Date & Time"
                      ),
                      defaultValue: "Pickup Date & Time is required!",
                    }),
                  },
                ]}
              >
                {/* <DatePicker.RangePicker
                  // size="large"
                  showTime={{ format: "HH:mm" }}
                  format="DD.MM.YYYY HH:mm"
                  style={{ width: "100%", height: "50px" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                /> */}
                {/* <DatePicker.RangePicker
  showTime={{ format: "HH:mm" }}
  format="DD.MM.YYYY HH:mm"
  style={{ width: "100%", height: "50px" }}
  getPopupContainer={(trigger) => trigger.parentElement!}
  disabledDate={(currentMoment) => {
    // Disable all dates before today (midnight)
    return currentMoment && currentMoment < moment().startOf("day");
  }}
/> */}

<DatePicker.RangePicker
  showTime={{ format: "HH:mm" }}
  format="DD.MM.YYYY HH:mm"
  style={{ width: "100%", height: "50px" }}
  getPopupContainer={(trigger) => trigger.parentElement!}
  disabledDate={disablePastDates}
  disabledTime={disablePastTimes}
/>

              </Form.Item>
            </Col>

            {/* Delivery Date & Time */}
            <Col xs={24} sm={12} md={12} lg={12}>
              <Form.Item
              className="rangepicker-responsive"
                name="deliveryDateTimeRange"
                label={t(
                  "offerCard.requested-delivery-date-&-time:",
                  "Requested Delivery Date & Time:"
                )}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t(
                        "offerCard.requested-delivery-date-&-time:",
                        "Requested Delivery Date & Time"
                      ),
                      defaultValue: "Delivery Date & Time is required!",
                    }),
                  },
                  {
                    validator: (_, value) => {
                      if (!value || !value[0] || !value[1]) return Promise.resolve();
                      
                      const pickupRange = formInstance.getFieldValue('pickupDateTimeRange');
                      if (pickupRange && pickupRange[1] && value[0]) {
                        if (pickupRange[1].isAfter(value[0])) {
                          return Promise.reject(
                            new Error('Delivery start cannot be before pickup end')
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker.RangePicker
                  // size="large"
                  showTime={{ format: "HH:mm" }}
                  format="DD.MM.YYYY HH:mm"
                  style={{ width: "100%" , height: "50px" }}
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />
              </Form.Item>
            </Col>
          </Row>

          {!isViewOnly && (
            <Row justify="center" style={{ marginTop: 25, marginBottom: 10 }}>
              <Col>
                <Button type="primary" htmlType="submit" size="large">
                  {t("offerCard.submit-offer", "Submit Offer")}
                </Button>
              </Col>
              <Col>
                <Popconfirm
                  title={t(
                    "institutions.reject-offer",
                    "Are you sure reject this offer?"
                  )}
                  onConfirm={handleCancel}
                  okText={t("global.yes", "Yes")}
                  cancelText={t("global.no", "No")}
                >
                  <Button size="large" style={{ marginLeft: 12 }}>
                    {t("offerCard.cancel", "Cancel")}
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          )}
        </Form>
      </OfferFormBg>
    </OfferCardStyled>
  );
}





// import {
//   Col,
//   DatePicker,
//   Input,
//   Button,
//   Select,
//   Typography,
//   Popconfirm,
// } from "antd";
// import moment from "moment";
// import {
//   OfferCardStyled,
//   OfferFormBg,
//   SectionHeader,
//   InfoLabel,
//   InfoValue,
//   ErrorText,
// } from "container/styled";
// //@ts-ignore
// import FeatherIcon from "feather-icons-react";
// import { useTranslation } from "react-i18next";
// import { CodebookDto } from "api/models";
// import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";

// export function OfferCard({
//   itemId,
//   ordinalNumber,
//   routeInfo,
//   goodsInfo,
//   additionalInfo,
//   form,
//   errors,
//   handleInputChange,
//   handleSubmit,
//   truckTypeList,
//   inputWidth,
//   isViewOnly,
//   trailertypeOptions,
//   handleCancel,
//   createdAt,
//   showDeadline = true,
// }: any) {
//   const { t } = useTranslation();
//   const now = moment();
//   const createdAtUtc = moment.utc(createdAt);
//   const minValidityHours = now.diff(createdAtUtc.local(), "hours") + 2;
  
//   // const minValidityHours = now.diff(createdAt, "hours") + 2;

//   const currency = additionalInfo?.currency || "EUR";
//   const netPricePlaceholder = `Net Price ${currency}`;
//   const { RangePicker } = DatePicker;

//   const pickupMin = moment("2025-11-05 08:00", "YYYY-MM-DD HH:mm");
//   const pickupMax = moment("2025-11-13 20:30", "YYYY-MM-DD HH:mm");
//   const dropoffMin = moment("2025-11-10 12:30", "YYYY-MM-DD HH:mm");
//   const dropoffMax = moment("2025-11-13 20:30", "YYYY-MM-DD HH:mm");

  
//   return (
//     <OfferCardStyled>
//       <div className="margin-top-32-14-0-14">
//         <Col className="margin-top-neg-30">
//           <div className="flex-between">
//             <InfoLabel>
//               {t("offerCard.no", "No.")} {ordinalNumber}
//             </InfoLabel>
//             {/* <div className="deadline">
//                {t("offerCard.deadline", "Deadline")}: 
//               <CountdownTimer startTime={createdAt} duration={24}/>
//             </div> */}
//             {showDeadline && (
//               <div className="deadline">
//                 {t("offerCard.deadline", "Deadline")}:
//                 <CountdownTimer startTime={createdAt} duration={24} />
//               </div>
//             )}
//           </div>
//         </Col>
//         <div className="divider-line" />
//         <Col>
//           <SectionHeader>
//             {t("offerCard.route-information", "Route Information")}{" "}
//             <FeatherIcon icon="info" color="#5F63F2" size={18} />
//           </SectionHeader>
//           <div className="flex-gap40">
//             <div style={{ flex: 1 }}>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                   {t("offerCard.possible-pick-up:", "Possible Pick-Up:")}
//                 </InfoLabel>
//                 <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
//                   {routeInfo.pickup}
//                 </InfoValue>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel>
//                   {t("offerCard.total-distance:", "Total Distance:")}
//                 </InfoLabel>
//                 <InfoValue style={{ marginLeft: 4 }}>
//                   {routeInfo.distance}
//                 </InfoValue>
//               </div>
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ flex: 1 }}>
//                 <div style={{ display: "flex" }}>
//                   <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                     {t("offerCard.requested-delivery:", "Requested Delivery:")}
//                   </InfoLabel>
//                   <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
//                     {routeInfo.dropoff}
//                   </InfoValue>
//                 </div>
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
//             {t("offerCard.goods-details", "Goods Details")}{" "}
//             <FeatherIcon icon="info" color="#5F63F2" size={18} />
//           </SectionHeader>
//           <div className="flex-gap40 mt12">
//             <div style={{ flex: 1 }}>
//               <div style={{ display: "flex" }}>
//                 <InfoLabel style={{ whiteSpace: "nowrap" }}>
//                   {t("offerCard.type-of-goods:", "Type of Goods:")}
//                 </InfoLabel>
//                 <InfoValue style={{ marginLeft: 4, whiteSpace: "normal" }}>
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
//                 <InfoLabel>
//                   {t("offerCard.ldm-per-item:", "LDM per item:")}
//                 </InfoLabel>
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
//             <div style={{ flex: 1 }}>
//               <InfoLabel>
//                 {t(
//                   "offerCard.possible-pick-up-date-range:",
//                   "Possible Pick-Up Date Range:"
//                 )}
//               </InfoLabel>
//               <InfoValue>{additionalInfo.pickupRange}</InfoValue>
//             </div>
//             <div style={{ flex: 1 }}>
//               <InfoLabel>
//                 {t(
//                   "offerCard.requested-delivery-date-range:",
//                   "Requested Delivery Date Range:"
//                 )}
//               </InfoLabel>
//               <InfoValue>{additionalInfo.dropoffRange}</InfoValue>
//             </div>
//           </div>
//           <div style={{ display: "flex" }}>
//             <InfoLabel>{t("offerCard.currency:", "Currency:")}</InfoLabel>
//             <InfoValue> {additionalInfo.currency}</InfoValue>
//           </div>
//         </Col>
//       </div>
//       <OfferFormBg>
//         <div>
//           <SectionHeader>
//             {t("offerCard.submit-your-offer:", "Submit your Offer:")}
//           </SectionHeader>
//         </div>
//         <div className="offer-form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
//           <Col xs={24} sm={24} md={8} lg={8} style={{marginBottom: "50px"}}>
//             <InfoLabel>{t("offerCard.net-price", "Net Price")}</InfoLabel>
//             <Input
//               disabled={isViewOnly}
//               value={form.netPrice}
//               // placeholder="Net Price EUR"
//               placeholder={netPricePlaceholder}
//               onChange={(e) => handleInputChange("netPrice", e.target.value)}
//               style={{ width: "100%" }}
//             />
//             {errors.netPrice && <ErrorText>{errors.netPrice}</ErrorText>}
//           </Col>
//           <Col xs={24} sm={24} md={8} lg={8}>
//             <InfoLabel>
//               {t("offerCard.validity-of-offer", "Validity of Offer")}
//             </InfoLabel>
//             <Input
//               disabled={isViewOnly}
//               value={form.validity}
//               type="text"
//               placeholder={`Minimum: ${minValidityHours} hours`}
//               onChange={(e) => {
//                 let val = e.target.value;
//                 val = val.replace(",", ".");
//                 if (/^\d*\.?\d*$/.test(val)) {
//                   handleInputChange("validity", val);
//                 }
//               }}
//               style={{ width: "100%" }}
//             />
//             {/* {form.validity && Number(form.validity) < minValidityHours && (
//               <ErrorText>{`Minimum accepted validity: ${minValidityHours} hours`}</ErrorText>
//             )} */}
//           {(errors.validity || (form.validity && Number(form.validity) < minValidityHours)) && (
//             <ErrorText>
//               {errors.validity ||
//                 (form.validity && Number(form.validity) < minValidityHours
//                   ? `Minimum accepted validity: ${minValidityHours} hours`
//                   : null)}
//             </ErrorText>
//           )}
//           </Col>
//           <Col xs={24} sm={24} md={8} lg={8}>
//             <InfoLabel>{t("offerCard.truck-type", "Truck Type")}</InfoLabel>
//             <Select
//               disabled={isViewOnly}
//               placeholder={t(
//                 "submitOfferPage.trailertypePlaceholder",
//                 "Select Truck Type"
//               )}
//               value={form.truckType === "" ? undefined : form.truckType}
//               // value={form.truckType}
//               onChange={(value) => handleInputChange("truckType", value)}
//               style={{ width: "100%" }}
//               className="custom-select-dropdown"
//               size="large"
//             >
//               {trailertypeOptions.map((item: CodebookDto) => (
//                 <Select.Option key={item.id} value={item.id}>
//                   {item.name}
//                 </Select.Option>
//               ))}
//             </Select>

//             {errors.truckType && <ErrorText>{errors.truckType}</ErrorText>}
//           </Col>
          
//           <Col xs={24} sm={12} md={12} lg={12} >
//             <InfoLabel>
//               {t(
//                 "offerCard.possible-pick-up-date-&-time:",
//                 "Possible Pick-Up Date & Time:"
//               )}
//             </InfoLabel>
//              <div style={{ width: "100%", maxWidth: 620, overflow: "hidden" }}>
//             <DatePicker.RangePicker
//               disabled={isViewOnly}
//               showTime={{ format: "HH:mm" }}
//               format="DD.MM.YYYY HH:mm"
//               style={{ width: "100%" }}
//               value={form.pickupDateTimeRange}
//               onChange={(val) => handleInputChange("pickupDateTimeRange", val)}
//               getPopupContainer={(trigger) => trigger.parentElement!}
//             />
//             </div>
//           </Col>
//           <Col xs={24} sm={12} md={12} lg={12}>
          
//             <InfoLabel>
//               {t(
//                 "offerCard.requested-delivery-date-&-time:",
//                 "Requested Delivery Date & Time:"
//               )}
//             </InfoLabel>
//             <div style={{ width: "100%", maxWidth: 620 }}>
//             <DatePicker.RangePicker
//               disabled={isViewOnly}
//               showTime={{ format: "HH:mm" }}
//               format="DD.MM.YYYY HH:mm"
//               style={{ width: "100%" }}
//               value={form.dropoffDateTimeRange}
//               onChange={(val) => handleInputChange("dropoffDateTimeRange", val)}
//               getPopupContainer={(trigger) => trigger.parentElement!}
//             />
//            </div>
//             {errors.dropoffDateTime && (
//               <ErrorText>{errors.dropoffDateTime}</ErrorText>
//             )}
//           </Col>
//         </div>
//         {!isViewOnly && (
//           <div style={{ display: 'flex', justifyContent: 'center', marginTop: 25, marginBottom: 10, gap: '12px' }}>
//             <Col>
//               <Button type="primary" onClick={() => handleSubmit(itemId)}>
//                 {t("offerCard.submit", "Submit")}
//               </Button>
//             </Col>
//             <Col>
//               <Popconfirm
//                 title={t(
//                   "institutions.reject-offer",
//                   "Are you sure reject this offer?"
//                 )}
//                 onConfirm={isViewOnly ? undefined : () => handleCancel(itemId)}
//                 okText={t("global.yes", "Yes")}
//                 cancelText={t("global.no", "No")}
//               >
//                 <Button style={{ marginLeft: 12 }}>
//                     {t("offerCard.cancel", "Cancel")}
//                 </Button>
//               </Popconfirm>
//             </Col>
//           </div>
//         )}
//       </OfferFormBg>
//     </OfferCardStyled>
//   );
// }


// import {
//   Card,
//   Col,
//   DatePicker,
//   Input,
//   Row,
//   Button,
//   Select,
//   Pagination,
//   Typography,
//   Popconfirm,
// } from "antd";
// import { useEffect, useState } from "react";
// import { useCallback, useMemo } from "react";
// import styled from "styled-components";
// import moment from "moment";
// import {
//   Main,
//   Main as MainBase,
//   Panel,
//   OfferCardStyled,
//   OfferFormBg,
//   OfferFormRow,
//   SectionHeader,
//   InfoLabel,
//   InfoValue,
//   ErrorText,
// } from "container/styled";
// //@ts-ignore
// import FeatherIcon from "feather-icons-react";
// import { AutoComplete } from "components/autoComplete/autoComplete";
// import { Link } from "react-router-dom";
// import { ProjectSorting } from "pages/localization/email/style";
// import {
//   CodebookDto,
//   ListRequestDtoPaginatedList,
//   UserFilterType,
//   VehicleFleetRequestStatus,
// } from "api/models";
// import { useTranslation } from "react-i18next";
// import { useAuthorization } from "hooks/useAuthorization";
// import { RequestsApi } from "api/api";
// import { SubmitOfferTransportManageDto } from "api/models/submit-offer-transport-manage-dto";
// import openNotificationWithIcon from "utility/notification";
// import { CodebookApi } from "api/api";
// import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";
// import { Cards } from "components/cards/frame/cards-frame";
// import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";
// import { OfferCard } from "./OfferCard";

// const requestsApi = new RequestsApi();
// const codebooksApi = new CodebookApi();

// export const SubmitOfferPage = () => {

//     const { t } = useTranslation();
//   const { hasPermission } = useAuthorization();

//   const getAccessibilityDescription = useCallback((accessibility: number | undefined) => {
//     switch (accessibility) {
//       case 1:
//         return "Commercial with ramp but with lift";
//       case 2:
//         return "Commercial without ramp but with forklift";
//       case 3:
//         return "Commercial without forklift or ramp";
//       default:
//         return "No Access Info";
//     }
//   }, []);

//    const [forms, setForms] = useState<Record<string, any>>({});
//   const [errors, setErrors] = useState<Record<string, any>>({});
//   const [trailertypeOptions, setTrailertypeOptions] = useState<CodebookDto[]>([]);
//   const [transportDetails, setTransportDetails] =
//     useState<ListTransportManagementDtoPaginatedList | null>(null);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [routeInfos, setRouteInfos] = useState<Record<string, any>>({});
//   const [goodsInfos, setGoodsInfos] = useState<Record<string, any>>({});
//   const [additionalInfos, setAdditionalInfos] = useState<Record<string, any>>({});


//   const inputWidth = 220;

//   const [request, setRequest] = useState<{
//     status: VehicleFleetRequestStatus;
//     search: string;
//     pageNumber: number;
//     pageSize: number;
//     pickupDate: any;
//     dropOffDate: any;
//     pickupPostalCode: string;
//     dropOffPostalCode: string;
//     pickupDateRange: [moment.Moment, moment.Moment] | null;
//     dropOffDateRange: [moment.Moment, moment.Moment] | null;
//   }>({
//     status: VehicleFleetRequestStatus.ALL,
//     search: "",
//     pageNumber: 1,
//     pageSize: 2,
//     pickupDate: null,
//     dropOffDate: null,
//     pickupPostalCode: "",
//     dropOffPostalCode: "",
//     pickupDateRange: null,
//     dropOffDateRange: null,
//   });

//   const { RangePicker } = DatePicker;

//   const truckTypeList = [
//     { label: "Road Train", value: "Road Train" },
//     { label: "Frigo Trailer", value: "Frigo Trailer" },
//     { label: "7.5t", value: "7.5t" },
//     { label: "12t", value: "12t" },
//     { label: "Flexible Trailer", value: "Flexible Trailer" },
//   ];


//   const validate = useCallback((form: any, additionalInfo: any) => {
//     const e: { [k: string]: string } = {};
//     if (!form.netPrice) e.netPrice = "*Net Price is required";
//     if (!form.truckType) e.truckType = "*Truck Type is required";
//     if (!form.validity) e.validity = "*Validity of Offer is required";

//     // Check pickup Date Range
//     // if (!form.pickupDateTimeRange || !form.pickupDateTimeRange[0] || !form.pickupDateTimeRange[1]) {
//     //   e.pickupDateTime = "*Required";
//     // }

//     // Check delivery Date Range
//     // if (!form.dropoffDateTimeRange || !form.dropoffDateTimeRange[0] || !form.dropoffDateTimeRange[1]) {
//     //   e.dropoffDateTime = "*Required";
//     // }

//     // Compare pickup and delivery ranges if both present
//     if (
//       form.pickupDateTimeRange &&
//       form.pickupDateTimeRange[1] &&
//       form.dropoffDateTimeRange &&
//       form.dropoffDateTimeRange[0]
//     ) {
//       if (form.pickupDateTimeRange[1].isAfter(form.dropoffDateTimeRange[0])) {
//         e.dropoffDateTime =
//           "Delivery start date/time cannot be before pickup end date/time.";
//       }
//     }

//     const now = moment();
//     const minValidityHours = now.diff(additionalInfo.createdAt, "hours") + 2;
//     const validHours = Number(form.validity);
//     if (form.validity && validHours < minValidityHours) {
//       e.validity = `Minimum accepted validity: ${minValidityHours} hours`;
//     }

//     return e;
//   }, []);


//   const defaultRouteInfo = useMemo(() => ({
//     pickup: "",
//     dropoff: "",
//     distance: "",
//     access: "",
//   }), []);

//   const defaultGoodsInfo = useMemo(() => ({
//     type: "",
//     quantity: 0,
//     dims: "",
//     ldm: "",
//     special: "",
//   }), []);

//   const defaultAdditionalInfo = useMemo(() => ({
//     pickupRange: "",
//     dropoffRange: "",
//     currency: "",
//     // requestDateTime: moment(),
//   }), []);

//   //  Memoize fetchRequestDetails
//   const fetchRequestDetails = useCallback(async (params: any) => {
//     setLoadingDetails(true);
//     try {
//       const response = await requestsApi.apiTransportManagementCarrierListGet(params);
//       setTransportDetails(response.data);
//     } catch (error) {
//       // Handle error
//     } finally {
//       setLoadingDetails(false);
//     }
//   }, []);

//   //  Memoize fetchCodebooks
//   const fetchCodebooks = useCallback(async () => {
//     try {
//       const { data } = await codebooksApi.apiCodebookGet();
//       setTrailertypeOptions(data.TrailerType || []);
//     } catch (e) {
//       // handle error
//     }
//   }, []);

//   //  Fetch codebooks only once
//   useEffect(() => {
//     fetchCodebooks();
//   }, [fetchCodebooks]);

//   //  Memoize request params
//   const requestParams = useMemo(() => ({
//     search: request.search,
//     pageNumber: request.pageNumber,
//     pageSize: request.pageSize,
//     status: request.status,
//     pickupDate: request.pickupDateRange
//       ? request.pickupDateRange[0].format("YYYY-MM-DD")
//       : undefined,
//     dropOffDate: request.dropOffDateRange
//       ? request.dropOffDateRange[0].format("YYYY-MM-DD")
//       : undefined,
//     pickupPostalCode: request.pickupPostalCode || undefined,
//     dropOffPostalCode: request.dropOffPostalCode || undefined,
//   }), [
//     request.search,
//     request.pageNumber,
//     request.pageSize,
//     request.status,
//     request.pickupDateRange,
//     request.dropOffDateRange,
//     request.pickupPostalCode,
//     request.dropOffPostalCode,
//   ]);

//   //  Single useEffect for fetching
//   useEffect(() => {
//     fetchRequestDetails(requestParams);
//   }, [requestParams, fetchRequestDetails]);

//   //  Process transport details - ONLY depend on transportDetails
//   useEffect(() => {
//     if (!transportDetails?.items?.length) return; 

//     const newRouteInfos: Record<string, any> = {};
//     const newGoodsInfos: Record<string, any> = {};
//     const newAdditionalInfos: Record<string, any> = {};

//     transportDetails.items.forEach((item) => {
//       // ... your existing processing code ...
//       const pickup = item.transportPickup?.length ? item.transportPickup[0] : null;
//       const dropoff = item.transportDelivery?.length ? item.transportDelivery[0] : null;

//       newRouteInfos[item.id as string] = {
//         pickup: pickup
//           ? `${pickup.city ?? ""}, ${pickup.postalCode ?? ""}, ${pickup.countryName ?? ""}`
//           : "",
//         dropoff: dropoff
//           ? `${dropoff.city ?? ""}, ${dropoff.postalCode ?? ""}, ${dropoff.countryName ?? ""}`
//           : "",
//         distance: `${item.totalDistance ?? 0} km`,
//         access: getAccessibilityDescription(item.accessibility),
//       };

//       const goods = item.transportGoods?.length ? item.transportGoods[0] : undefined;
//       if (goods) {
//         const length = goods.length || 0;
//         const width = goods.width || 0;
//         const height = goods.height || 0;
//         const ldmValue = length && width && height ? (length * width * height).toFixed(2) : "0";

//         newGoodsInfos[item.id as string] = {
//           type: goods.typeOfGoodsName ?? "N/A",
//           quantity: goods.quantity ?? 0,
//           dims: `Length: ${length}m, Width: ${width}m, Height: ${height}m, Weight: ${goods.weight ?? 0}kg`,
//           ldm: ` ${ldmValue} m³`,
//           special: [
//             goods.isIncludesAdrGoods ? "ADR Included" : "",
//             goods.isCargoNotStackable ? "Cargo items are not stackable" : "",
//           ].filter(Boolean).join(", "),
//         };
//       } else {
//         newGoodsInfos[item.id as string] = defaultGoodsInfo;
//       }

//       const transportInformation = item.transportInformation?.length
//         ? item.transportInformation[0]
//         : null;
//       if (transportInformation) {
//         const pickupFrom = moment(transportInformation.pickupDateFrom).format("DD.MM.YYYY");
//         const pickupTo = moment(transportInformation.pickupDateTo).format("DD.MM.YYYY");
//         const pickupFromTime = transportInformation.pickupTimeFrom
//           ? moment(transportInformation.pickupTimeFrom, "HH:mm").format("HH:mm")
//           : "";
//         const pickupToTime = transportInformation.pickupTimeTo
//           ? moment(transportInformation.pickupTimeTo, "HH:mm").format("HH:mm")
//           : "";
//         const dropoffFrom = moment(transportInformation.deliveryDateFrom).format("DD.MM.YYYY");
//         const dropoffTo = moment(transportInformation.deliveryDateTo).format("DD.MM.YYYY");
//         const dropoffFromTime = transportInformation.deliveryTimeFrom
//           ? moment(transportInformation.deliveryTimeFrom, "HH:mm").format("HH:mm")
//           : "";
//         const dropoffToTime = transportInformation.deliveryTimeTo
//           ? moment(transportInformation.deliveryTimeTo, "HH:mm").format("HH:mm")
//           : "";

//         newAdditionalInfos[item.id as string] = {
//           pickupRange:
//             pickupFrom === pickupTo
//               ? pickupFrom
//               : `${pickupFrom} - ${pickupTo}` +
//                 (pickupFromTime || pickupToTime ? `\n${pickupFromTime} - ${pickupToTime}`.trim() : ""),
//           dropoffRange:
//             dropoffFrom === dropoffTo
//               ? dropoffFrom
//               : `${dropoffFrom} - ${dropoffTo}` +
//                 (dropoffFromTime || dropoffToTime ? `\n${dropoffFromTime} - ${dropoffToTime}`.trim() : ""),
//           currency: transportInformation.currencyName || "EUR",
//         };
//       } else {
//         newAdditionalInfos[item.id as string] = defaultAdditionalInfo;
//       }
//     });

//     setRouteInfos(newRouteInfos);
//     setGoodsInfos(newGoodsInfos);
//     setAdditionalInfos(newAdditionalInfos);
//   }, [transportDetails, defaultRouteInfo, defaultGoodsInfo, defaultAdditionalInfo, getAccessibilityDescription]); // ✅ Only transportDetails and memoized defaults

//   //  Memoize filtered items
//   const filteredItems = useMemo(() => {
//     return (transportDetails?.items ?? []).filter((item) => {
//       let pickupMatch = true;
//       let dropoffMatch = true;
//       let pickupPostalMatch = true;
//       let dropoffPostalMatch = true;

//       if (request.pickupDate && item.transportInformation?.[0]?.pickupDateFrom) {
//         pickupMatch = moment(item.transportInformation[0].pickupDateFrom).isSame(
//           request.pickupDate,
//           "day"
//         );
//       }

//       if (request.dropOffDate && item.transportInformation?.[0]?.deliveryDateFrom) {
//         dropoffMatch = moment(item.transportInformation[0].deliveryDateFrom).isSame(
//           request.dropOffDate,
//           "day"
//         );
//       }

//       if (request.pickupPostalCode && item.transportPickup?.[0]?.postalCode) {
//         pickupPostalMatch = item.transportPickup[0].postalCode.includes(
//           request.pickupPostalCode
//         );
//       }

//       if (request.dropOffPostalCode && item.transportDelivery?.[0]?.postalCode) {
//         dropoffPostalMatch = item.transportDelivery[0].postalCode.includes(
//           request.dropOffPostalCode
//         );
//       }

//       return pickupMatch && dropoffMatch && pickupPostalMatch && dropoffPostalMatch;
//     });
//   }, [
//     transportDetails?.items,
//     request.pickupDate,
//     request.dropOffDate,
//     request.pickupPostalCode,
//     request.dropOffPostalCode,
//   ]);

//   //  Stable handleInputChange
//   const handleInputChange = useCallback((itemId: string, field: string, value: any) => {
//     if (!itemId) return;

//     setForms((prev) => ({
//       ...prev,
//       [itemId]: {
//         ...prev[itemId],
//         [field]: value,
//       },
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       [itemId]: {
//         ...prev[itemId],
//         [field]: "",
//       },
//     }));
//   }, []); //  No dependencies - uses functional setState

//   //  Stable handleSubmit - remove forms/additionalInfos from dependencies
//   const handleSubmit = useCallback(async (itemId: string, itemData: any) => {
//     // Access forms and additionalInfos directly from closure
//     setForms((currentForms) => {
//       setAdditionalInfos((currentAdditionalInfos) => {
//         const form = currentForms[itemId] || {};
//         const e = validate(form, currentAdditionalInfos[itemId] || defaultAdditionalInfo);
        
//         setErrors((prev) => ({ ...prev, [itemId]: e }));
        
//         if (Object.keys(e).length > 0) return currentAdditionalInfos;

//         const dto: SubmitOfferTransportManageDto = {
//           id: itemData?.transportCarrier[0]?.id,
//           price: form.netPrice,
//           offerValidityDate: Number(form.validity),
//           estimatedPickupDateTimeFrom: form.pickupDateTimeRange
//             ? moment(form.pickupDateTimeRange[0]).toISOString()
//             : null,
//           estimatedPickupDateTimeTo: form.pickupDateTimeRange
//             ? moment(form.pickupDateTimeRange[1]).toISOString()
//             : null,
//           estimatedDeliveryDateTimeFrom: form.dropoffDateTimeRange
//             ? moment(form.dropoffDateTimeRange[0]).toISOString()
//             : null,
//           estimatedDeliveryDateTimeTo: form.dropoffDateTimeRange
//             ? moment(form.dropoffDateTimeRange[1]).toISOString()
//             : null,
//           truckTypeId: form.truckType,
//         };

//         requestsApi
//           .apiTransportManagementIdSubmitOfferPut({
//             transportRequestId: itemData?.id || "",
//             submitOfferTransportManageDto: dto,
//           })
//           .then(() => {
//             openNotificationWithIcon(
//               "success",
//               t("offerCard.success", "Offer submitted successfully")
//             );
//             fetchRequestDetails(requestParams);
//           })
//           .catch((error) => {
//             console.error(error);
//             openNotificationWithIcon(
//               "error",
//               t("offerCard.error", "Failed to submit offer")
//             );
//           });

//         return currentAdditionalInfos;
//       });
//       return currentForms;
//     });
//   }, [requestParams, fetchRequestDetails, t, defaultAdditionalInfo, validate]);

//   //  Stable handleCancel
//   const handleCancel = useCallback(async (itemId: string, itemData: any) => {
//     const rejectdto: SubmitOfferTransportManageDto = {
//       id: itemData?.transportCarrier[0]?.id,
//     };
//     try {
//       await requestsApi.apiTransportManagementIdRejectOfferPut({
//         transportRequestId: itemId,
//         submitOfferTransportManageDto: rejectdto,
//       });
//       openNotificationWithIcon(
//         "success",
//         t("offerCard.cancelSuccess", "Offer rejected successfully")
//       );

//       fetchRequestDetails(requestParams);
//     } catch (error) {
//       console.error(error);
//       openNotificationWithIcon(
//         "error",
//         t("offerCard.cancelError", "Failed to reject offer")
//       );
//     }
//   }, [requestParams, fetchRequestDetails, t]);

//   //  Memoize onSearchChange
//   const onSearchChange = useCallback((value: any) => {
//     setRequest((prev) => ({ ...prev, search: value }));
//   }, []);


//   return (
//     <Main>
//       <div
//         style={{
//           fontWeight: 600,
//           fontSize: 22,
//           paddingTop: 20,
//           paddingBottom: 20,
//         }}
//       >
//         {t("submitOfferPage.submit-an-offer", "Submit an Offer")}
//       </div>
//       <Row gutter={25}>
//         <Col xs={24}>
//           <ProjectSorting>
//             <div className="project-sort-bar">
//               <div className="project-sort-search">
//                 <AutoComplete
//                   onSearch={(value) => onSearchChange(value)}
//                   patterns
//                   placeholder={t(
//                     "global.auto-complete-placeholder",
//                     "Search..."
//                   )}
//                 />
//               </div>
//             </div>
//           </ProjectSorting>
//           <Cards headless>
//             <Row gutter={[15, 0]} justify="center" align="middle">
//               <Col flex="70px">
//                 <Typography.Text strong>
//                   {t("requests.filters", "Filters :")}
//                 </Typography.Text>
//               </Col>
//               <Col flex="1 1 0">
//                 <DatePicker
//                   style={{ width: "100%" }}
//                   format="DD.MM.YYYY"
//                   placeholder={t("requests.pickupDate", "Pickup Date")}
//                   onChange={(date) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       pickupDate: date,
//                       pageNumber: 1,
//                     }))
//                   }
//                 />
//                 {/* <RangePicker
//                   format="DD.MM.YYYY"
//                   style={{ width: "100%" }}
//                   onChange={(date) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       pickupDate: date,
//                       pageNumber: 1,
//                     }))
//                   }
//                 /> */}
//               </Col>
//               <Col flex="1 1 0">
//                 <Input
//                   style={{ width: "100%" }}
//                   placeholder={t(
//                     "requests.pickupPostalCode",
//                     "Pickup Postal Code"
//                   )}
//                   onChange={(e) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       pickupPostalCode: e.target.value,
//                       pageNumber: 1,
//                     }))
//                   }
//                   allowClear
//                 />
//               </Col>
//               <Col flex="1 1 0">
//                 <DatePicker
//                   style={{ width: "100%" }}
//                   format="DD.MM.YYYY"
//                   placeholder={t("requests.dropOffDate", "Drop-off Date")}
//                   onChange={(date) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       dropOffDate: date,
//                       pageNumber: 1,
//                     }))
//                   }
//                 />
//                 {/* <RangePicker
//                   format="DD.MM.YYYY"
//                   style={{ width: "100%" }}
//                   onChange={(date) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       dropOffDate: date,
//                       pageNumber: 1,
//                     }))
//                   }
//                 /> */}
//               </Col>
//               <Col flex="1 1 0">
//                 <Input
//                   style={{ width: "100%" }}
//                   placeholder={t(
//                     "requests.dropOffPostalCode",
//                     "Drop-off Postal Code"
//                   )}
//                   onChange={(e) =>
//                     setRequest((prev) => ({
//                       ...prev,
//                       dropOffPostalCode: e.target.value,
//                       pageNumber: 1,
//                     }))
//                   }
//                   allowClear
//                 />
//               </Col>
//             </Row>
//           </Cards>
//         </Col>
//       </Row>
//       <Panel>
//         {filteredItems.map((item) => {
//           if (!item.id) return null;

//           return (
//             <OfferCard
//               key={item.id}
//               itemId={item.id}
//               createdAt={item.createdAt}
//               ordinalNumber={item.requestId}
//               routeInfo={routeInfos[item.id] || defaultRouteInfo}
//               goodsInfo={goodsInfos[item.id] || defaultGoodsInfo}
//               additionalInfo={additionalInfos[item.id] || defaultAdditionalInfo}
//               form={forms[item.id] || {}}
//               errors={errors[item.id] || {}}
//               handleInputChange={(field: any, v: any) =>
//                 handleInputChange(item.id as string, field, v)
//               }
//               handleSubmit={() => handleSubmit(item.id as string, item)}
//               handleCancel={() => handleCancel(item.id as string, item)}
//               truckTypeList={truckTypeList}
//               inputWidth={inputWidth}
//               trailertypeOptions={trailertypeOptions}
//             />
//           );
//         })}
//       </Panel>
//       {transportDetails && (
//         <div style={{ textAlign: "right", margin: "24px 0" }}>
//           <Pagination
//             current={request.pageNumber}
//             pageSize={request.pageSize}
//             total={transportDetails.totalCount}
//             showSizeChanger
//             pageSizeOptions={["10", "20", "50", "100"]}
//             onChange={(page, pageSize) =>
//               setRequest({ ...request, pageNumber: page, pageSize: pageSize })
//             }
//           />
//         </div>
//       )}
//     </Main>
//   );
// };

// export default SubmitOfferPage;
