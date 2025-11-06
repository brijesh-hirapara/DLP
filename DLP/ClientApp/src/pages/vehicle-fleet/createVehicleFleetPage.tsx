import { Card, Row, Col, Form, Input, Select, Divider, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { CardToolbox } from "container/styled";
import { PageHeader } from "components/page-headers/page-headers";
import { Button } from "components/buttons/buttons";
import { CodebookApi, RequestsApi } from "api/api";
import { useEffect, useState } from "react";
import { CodebookDto, RequestDetailsDto, VehicleFleetRequestStatus } from "api/models";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import openNotificationWithIcon from "utility/notification";
import { TransformVehicleFleetRequestFormData } from "./TransformRequestFormData";

const codebooksApi = new CodebookApi();

const { Option } = Select;
const requestsApi = new RequestsApi();
interface AddVehicleFleetProps {
  viewKey?: string;
}

export const AddVehicleFleet:React.FC<AddVehicleFleetProps> = ({ viewKey }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const [requestLoading, setRequestLoading] = useState(false);
  const [isInPendingStatus, setIsInPendingStatus] = useState(false);
  const [requestData, setRequestData] = useState<RequestDetailsDto>({});
  const [codebooks, setCodebooks] = useState<{
  Country: CodebookDto[];
  TrailerType: CodebookDto[];
  Certificate: CodebookDto[];
  GoodsType: CodebookDto[];
  CemtPermit: CodebookDto[];
  License: CodebookDto[];
  OperatingCountry: CodebookDto[];
}>({
  Country: [],
  TrailerType: [],
  Certificate: [],
  GoodsType: [],
  CemtPermit: [],
  License: [],
  OperatingCountry: [],
});
const validateNumericInput = (value: string): string => {
  // Remove any negative signs
  if (value.includes("-")) {
    value = value.replace("-", "");
  }

  // Remove leading zeros
  if (value && value !== "0") {
    value = value.replace(/^0+/, "");
  }

  // If the value is empty or non-numeric, set it to "0"
  if (value === "" || isNaN(Number(value))) {
    value = "0";
  }

  return value;
};


useEffect(() => {
  const fetchDetails = async () => {
    try {
      setRequestLoading(true);
      const response = await requestsApi.apiVehicleFleetRequestsIdGet({ id: params.id as string });
      const responseData = response.data;
      setRequestData(responseData);
      setIsInPendingStatus(responseData.status === VehicleFleetRequestStatus.PENDING);
  
      // Bind questionnaire to form
      if (responseData?.questionnaires?.length) {
        const q = responseData.questionnaires;
  
        const question1 = q.find(x => x.questionNo === 1);
        const question_1_values = question1 ? question1.values : undefined;
  
        const trailers = q
          .filter(x => x.questionNo === 2)
          .map(x => ({
            question_2_codebookId: x.codebookId || undefined,
            question_2_trailerQTY: x.trailerQTY || 0,
          }));
  
        const cemtPermits = q
          .filter(x => x.questionNo === 3)
          .map(x => ({
            question_3_codebookId: x.codebookId || undefined,
            question_3_countryId: x.countryId || undefined,
          }));
  
        const question_4_codebookId = q
          .filter(x => x.questionNo === 4 && x.codebookId)
          .map(x => x.codebookId);
  
        const question_5_countryId = q
          .filter(x => x.questionNo === 5 && x.countryId)
          .map(x => x.countryId);
  
        form.setFieldsValue({
          question_1_values,
          trailers: trailers.length ? trailers : [{}],
          cemtPermits: cemtPermits.length ? cemtPermits : [{}],
          question_4_codebookId,
          question_5_countryId,
        });
      }
  
    } catch (error) {
      console.error(error);
    } finally {
      setRequestLoading(false);
    }
  };
  

  if (params.id)
      fetchDetails();
}, [params.id]);


  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const payload = TransformVehicleFleetRequestFormData(data);
      const response = params.id ?
        await requestsApi.apiVehicleFleetRequestsIdPut({
          vehicleFleetRequestId: params.id,
          questionnaireListJson: JSON.stringify(payload.QuestionnaireListJson)
        })
        : await requestsApi.apiVehicleFleetRequestsPost({ questionnaireListJson: payload.QuestionnaireListJson });
      if (response.status === 200) {
        params.id ? openNotificationWithIcon(
          "success",
          t(
            "vehicle-fleet.success.update",
            " Vehicle Fleet Updated Successfully"
          )
        ) :
          openNotificationWithIcon(
            "success",
            t(
              "vehicle-fleet.success.add",
              " Vehicle Fleet Added Successfully"
            )
          );
        setIsSubmitting(false);
        navigate("/vehicle-fleet");
      }

    } catch (err) {
      // showServerErrors(err);
    }
  };
   
  const groupStyle = {
    background: " #FFFFFF",
    borderRadius: 4,
    minHeight: 250,
    marginBottom: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    border: "none",
    marginLeft: 6,
  };

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
    });
  };
  fetchCodebooks();
  if (!params.id)
  fetchLastApproveDetails();
  
}, []);


const fetchLastApproveDetails = async () => {
  try {
    setRequestLoading(true);
    const response = await codebooksApi.apiVehicleFleetLatestGet();
    const responseData = response.data;
    setRequestData(responseData);
  
    // Bind questionnaire to form
    if (responseData?.questionnaires?.length) {
      const q = responseData.questionnaires;

      const question1 = q.find(x => x.questionNo === 1);
      const question_1_values = question1 ? question1.values : undefined;

      const trailers = q
        .filter(x => x.questionNo === 2)
        .map(x => ({
          question_2_codebookId: x.codebookId || undefined,
          question_2_trailerQTY: x.trailerQTY || 0,
        }));

      const cemtPermits = q
        .filter(x => x.questionNo === 3)
        .map(x => ({
          question_3_codebookId: x.codebookId || undefined,
          question_3_countryId: x.countryId || undefined,
        }));

      const question_4_codebookId = q
        .filter(x => x.questionNo === 4 && x.codebookId)
        .map(x => x.codebookId);

      const question_5_countryId = q
        .filter(x => x.questionNo === 5 && x.countryId)
        .map(x => x.countryId);

      form.setFieldsValue({
        question_1_values,
        trailers: trailers.length ? trailers : [{}],
        cemtPermits: cemtPermits.length ? cemtPermits : [{}],
        question_4_codebookId,
        question_5_countryId,
      });
    }

  } catch (error) {
    console.error(error);
  } finally {
    setRequestLoading(false);
  }
};


  const handleCancel = (e: any) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="fleet-form-container">
      <CardToolbox style={{ marginLeft: "-20px" }}>
        <PageHeader
          ghost
          title={t("add-new-vehicle-fleet.title", "Add New Vehicle Fleet")}
        />
      </CardToolbox>
      <>
      {/* <Card className="fleet-main-card fleet-main-card-body"> */}
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
      ) :(
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div
                className="fleet-form-label"
                style={{ height: 40, overflow: "hidden" }}
              >
                {/* {t(
                  "add-vehicle-fleet.goods-to-ship-label",
                  "1. What goods are you planning to ship ?"
                )} */}
                {t(
                  "add-new-vehicle-fleet.total-vehicles-label",
                  "1. What is the total number of vehicles in your fleet?"
                )}
              </div>

              <div
                style={{
                  width: "calc(100% + 32px)",
                  height: 1,
                  background: "#e8e8e8",
                  marginBottom: 16,
                  marginLeft: -16,
                  marginTop: 10,
                }}
              />

              <Input.Group compact>
                <Form.Item name="question_1_values" noStyle>
                  {/* <Select
                    placeholder={t(
                      "add-vehicle-fleet.select-goods",
                      "Select Goods"
                    )}
                    className="fleet-select"
                    style={{ marginBottom: 12 }}
                  >
                    {codebooks.GoodsType.map((item: CodebookDto) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select> */}
                   <Input
                      placeholder={t(
                        "add-vehicle-fleet.total-vehicles-placeholder",
                        "0"
                      )}
                      min={0}
                      className="fleet-input"
                      type="number"
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const inputValue = (e.target as HTMLInputElement).value;
                        // Validate the input value using the reusable function
                        (e.target as HTMLInputElement).value = validateNumericInput(inputValue);
                      }}
                    />
                  {/* <Input
                    placeholder={t(
                      "add-vehicle-fleet.total-vehicles-placeholder",
                      "5"
                    )}
                    min={0}
                    className="fleet-input"
                  /> */}
                </Form.Item>
              </Input.Group>
            </Card>
          </Col>
          {/* Box 2: Trailers Grid */}
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div
                className="fleet-form-label"
                style={{ height: 40, overflow: "hidden" }}
              >
                {t(
                  "add-vehicle-fleet.trailer-type-question",
                  "2. How many trailers do you operate by trailer type?"
                )}
              </div>
              <div
                style={{
                  width: "calc(100% + 32px)",
                  height: 1,
                  background: "#e8e8e8",
                  marginBottom: 16,
                  marginLeft: -16,
                  marginTop: 10,
                }}
              />

              <Row gutter={8}>
                <Form.List name="trailers" initialValue={[{}]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Form.Item
                              {...restField}
                              name={[name, "question_2_codebookId"]}
                              noStyle
                            >
                              <Select
                                placeholder={t(
                                  "add-vehicle-fleet.trailer-type-placeholder",
                                  "Trailer Type"
                                )}
                                className="fleet-select"
                                size="large"
                                style={{ width: "100%", height: 40 }}
                              >
                                {codebooks.TrailerType.map(
                                  (item: CodebookDto) => (
                                    <Option key={item.id} value={item.id}>
                                      {item.name}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Form.Item
                              {...restField}
                              name={[name, "question_2_trailerQTY"]}
                              noStyle
                            >
                              <Input
                                placeholder={t(
                                  "add-vehicle-fleet.trailers-counts-placeholder",
                                  "0"
                                )}
                                type="number"
                                min={0}
                                size="large"
                                style={{ width: "70%", height: 40 }}
                               
                              />
                            </Form.Item>
                          </div>
                          <div
                            style={{
                              width: 80,
                              display: "flex",
                              gap: 8,
                              justifyContent: "flex-end",
                              minWidth: 80,
                              marginLeft: 20,
                            }}
                          >
                            {index > 0 ? (
                              <Button
                                type="text"
                                className="btn-delete-red"
                                onClick={() => remove(name)}
                               
                              >
                                <DeleteOutlined />
                              </Button>
                            ) : (
                              <span
                                style={{ width: 40, display: "inline-block" }}
                              />
                            )}
                            {index === fields.length - 1 ? (
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                className="btn-plus-color"
                               
                              >
                                <PlusOutlined />
                              </Button>
                            ) : (
                              <span
                                style={{ width: 40, display: "inline-block" }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </Row>
            </Card>
          </Col>
          {/* Box 3: CEMT Grid */}
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div
                className="fleet-form-label"
                style={{ height: 40, overflow: "hidden" }}
              >
                {t(
                  "add-vehicle-fleet.cemt-permits-question",
                  "3. How many CEMT permits do you possess, and for which countries?"
                )}
              </div>
              <div
                style={{
                  width: "calc(100% + 32px)",
                  height: 1,
                  background: "#e8e8e8",
                  marginBottom: 16,
                  marginLeft: -16,
                  marginTop: 10,
                }}
              />

              <Row gutter={8}>
                <Form.List name="cemtPermits" initialValue={[{}]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Form.Item
                              {...restField}
                              name={[name, "question_3_codebookId"]}
                              noStyle
                            >
                              <Select
                                placeholder={t(
                                  "add-vehicle-fleet.cemt-permits-placeholder",
                                  "CEMT permits"
                                )}
                                className="fleet-select"
                                size="large"
                                style={{ width: "100%", height: 40 }}
                               
                              >
                                {codebooks.CemtPermit.map(
                                  (item: CodebookDto) => (
                                    <Option key={item.id} value={item.id}>
                                      {item.name}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Form.Item
                              {...restField}
                              name={[name, "question_3_countryId"]}
                              noStyle
                            >
                              <Select
                                placeholder={t(
                                  "add-vehicle-fleet.country-placeholder",
                                  "Country"
                                )}
                                className="fleet-select"
                                size="large"
                                style={{ width: "70%", height: 40 }}
                               
                              >
                                {codebooks.Country.map((item: CodebookDto) => (
                                  <Option key={item.id} value={item.id}>
                                    {item.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                          <div
                            style={{
                              width: 80,
                              display: "flex",
                              gap: 8,
                              justifyContent: "flex-end",
                              minWidth: 80,
                              marginLeft: 20,
                            }}
                          >
                            {index > 0 ? (
                              <Button
                                type="text"
                                className="btn-delete-red"
                                onClick={() => remove(name)}
                               
                              >
                                <DeleteOutlined />
                              </Button>
                            ) : (
                              <span
                                style={{ width: 40, display: "inline-block" }}
                              />
                            )}
                            {index === fields.length - 1 ? (
                              <Button
                                type="dashed"
                                onClick={() => add()}
                                className="btn-plus-color"
                               
                              >
                                <PlusOutlined />
                              </Button>
                            ) : (
                              <span
                                style={{ width: 40, display: "inline-block" }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </Form.List>
              </Row>
            </Card>
          </Col>
        </Row>
        {/* Bottom Row: Licenses and Countries */}
        <Row gutter={24}>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div
                className="fleet-form-label"
                style={{ height: 40, overflow: "hidden" }}
              >
                {t(
                  "add-vehicle-fleet.certifications-question",
                  "4. Which certifications and licenses does your company hold?"
                )}
              </div>
              <div
                style={{
                  width: "calc(100% + 32px)",
                  height: 1,
                  background: "#e8e8e8",
                  marginBottom: 16,
                  marginLeft: -16,
                  marginTop: 6,
                }}
              />

              <Input.Group compact>
                {/* <Form.Item name="certification" noStyle>
                  <Select
                    mode="multiple"
                    placeholder={t("add-vehicle-fleet.adr-placeholder", "ADR")}
                    className="fleet-select"
                    style={{
                      marginBottom: 12,
                    }}
                    maxTagCount={1}
                    maxTagTextLength={32}
                  >
                    {codebooks.Certificate.map((item: CodebookDto) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item> */}

                <Form.Item name="question_4_codebookId" noStyle>
                  <Select
                    mode="multiple"
                    placeholder={t(
                      "add-vehicle-fleet.certification-license-placeholder",
                      "Certification & License"
                    )}
                    className="fleet-input"
                    style={{
                      marginBottom: 12,
                    }}
                    maxTagCount={1}
                    maxTagTextLength={32}
                   
                  >
                    {codebooks.License.map((item: CodebookDto) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Input.Group>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div
                className="fleet-form-label"
                style={{ height: 40, overflow: "hidden" }}
              >
                {t(
                  "add-vehicle-fleet.countries-question",
                  "5. Which countries do you operate in?"
                )}
              </div>
              <div
                style={{
                  width: "calc(100% + 32px)",
                  height: 1,
                  background: "#e8e8e8",
                  marginBottom: 16,
                  marginLeft: -16,
                  marginTop: 6,
                }}
              />

              <Input.Group compact>
                {/* <Form.Item name={["operatingCountries", 0]} noStyle>
                  <Select
                    placeholder={t(
                      "add-vehicle-fleet.macedonia-placeholder",
                      "Macedonia"
                    )}
                    className="fleet-select"
                    style={{ marginBottom: 12 }}
                  >
                    <Option value="mk">
                      {t("add-vehicle-fleet.macedonia", "Macedonia")}
                    </Option>
                  </Select>
                </Form.Item> */}
                <Form.Item name="question_5_countryId" noStyle>
                  <Select
                    mode="multiple"
                    placeholder={t(
                      "add-vehicle-fleet.country-placeholder",
                      "Country"
                    )}
                    className="fleet-select"
                    maxTagCount={3}
                   
                  >
                    {codebooks.OperatingCountry.map((item: CodebookDto) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Input.Group>
            </Card>
          </Col>

          {/* <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card bodyStyle={{ padding: 16 }} style={groupStyle}>
              <div style={{ marginTop: 12 }}>
                <Form.Item
                  label="Approve Comments"
                  name="approveComments"
                  style={{ marginBottom: 16 }}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter comments..."
                    style={{
                      width: "100%",
                      resize: "vertical",
                      marginBottom: 16,
                    }}
                  />
                </Form.Item>
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  <Button
                    type="success"
                    htmlType="button"
                  >
                    {t('requests:details.approve', 'Approve')}
                  </Button>
                  <Button
                    type="danger"
                    htmlType="button"
                  >
                    {t('requests:details.reject', 'Reject')}
                  </Button>
                </div>
              </div>
            </Card>
          </Col> */}
        </Row>
        <Row className="fleet-btn-row">
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              className="fleet-btn fleet-btn-submit"
              loading={isSubmitting}
            >
              {params.id ? t("add-vehicle-fleet.update", "Update") : t("add-vehicle-fleet.submit", "Submit") }
            </Button>
          </Col>
          <Col>
            <Button
              className="fleet-btn fleet-btn-cancel"
              onClick={handleCancel}
              
            >
              {t("global.cancel", "Cancel")}
            </Button>
          </Col>
        </Row>
      </Form>
      )}
      </>
      {/* </Card> */}
    </div>
  );
};


