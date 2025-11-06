import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Divider,
} from "antd";
import FeatherIcon from "feather-icons-react";
import Heading from "../../../components/heading/heading";
import { BasicFormWrapper, DatePickerWrapper } from "../../../container/styled";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import moment from "moment";
import { CodebookTypeEnum } from "api/models";
import Dragger from "antd/lib/upload/Dragger";
import { CodebookApi, EquipmentsApi, RefrigerantTypesApi } from "api/api";
import { useTranslation } from "react-i18next";
import EquipmentActivities from "./EquipmentActivities";
const { Option } = Select;

const codebooksApi = new CodebookApi();
const equipmentsApi = new EquipmentsApi();
const refrigerantsApi = new RefrigerantTypesApi();

const CreateEquipmentActivity = ({ onFinish, onCancel, equipmentId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [isSaving, setIsSaving] = useState();
  const [isLoading, setIsLoading] = useState();
  const [fileList, setFileList] = useState([]);
  const [newCoolants, setNewCoolants] = useState();
  const [typeOfChanges, setTypeOfChanges] = useState();
  const [showNameOfOperatorInput, setShowNameOfOperatorInput] = useState();
  const [technician, setTechnician] = useState();
  const [showInvalidLicenseNumber, setShowInvalidLicenseNumber] = useState();
 
  const handleOnFinish = async (request) => {
    request.files = fileList;
    request.equipmentId = equipmentId;
    request.dateOfChange = moment(request.dateOfChange, "DD.MM.yyyy").format(
      "MM/DD/yyyy"
    );
    try {
      const { data } = await equipmentsApi.apiEquipmentsCreateActivityPost(
        request
      );
      setIsSaving(true);
      onFinish(data);
    } catch (ex) {
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchTypeOfChange = async () => {
      const {
        data: { items },
      } = await codebooksApi.apiCodebookByTypeGet({
        type: CodebookTypeEnum.TypeOfEquipmentModification,
      });
      setTypeOfChanges(items);
    };

    const fetchNewCoolants = async () => {
      const { data } = await refrigerantsApi.apiRefrigerantTypesGet({
        pageSize: -1,
      });
      setNewCoolants(data?.items);
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTypeOfChange(), fetchNewCoolants()]);

      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  const onSelctTypeOfChange = (id) => {
    const type = typeOfChanges?.find(x => x.id === id);

    const isNewOperator = type.internalCode === 'NEW_OPERATOR';
    setShowNameOfOperatorInput(isNewOperator);

    if (!isNewOperator) {
      form.setFieldValue("newOperatorName", "");
    }
  };

  const handleOnFetchTechnicianDetails = async () => {
    if (technician) {
      setTechnician(null);

      form.setFieldsValue({
        fullName: "",
        email: "",
        authorizedRepairerPhoneNumber: "",
      });
    } else {
      try {
        const licenseNumber = form.getFieldValue("technicianCertificateNumber");
        const { data } =
          await equipmentsApi.apiEquipmentsIdTechnicianCertificateNumberCertificateNumberGet(
            {
              id: equipmentId,
              certificateNumber: licenseNumber,
            }
          );
        setShowInvalidLicenseNumber(!data);
        if (data) {
          form.setFieldsValue(data);
          setTechnician(data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <BasicFormWrapper className="basic-form-inner">
      <div className="atbd-form-checkout">
        <Row justify="center">
          <Col xs={24}>
            <div className="create-account-form">
              <Heading as="h4">
                {t("equipment-activities:add-new-activity", "Add New Activity")}
              </Heading>
              <Form
                form={form}
                name="activities"
                requiredMark
                onFinish={handleOnFinish}
              >
                <Row gutter={60}>
                  <Col span={12}>
                    <Form.Item
                      name="dateOfChange"
                      label={t(
                        "equipment-activities:date-of-change-label",
                        "Date of Purchase"
                      )}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "validations.date-of-change",
                            "Please select the Date of Change"
                          ),
                        },
                      ]}
                    >
                      <DatePicker
                        placeholder={t(
                          "equipments:date-of-change-placeholder",
                          "Select Date of Change"
                        )}
                        format={"DD.MM.YYYY"}
                      />
                    </Form.Item>
                    <Form.Item
                      name="typeOfChangeId"
                      required
                      label={t(
                        "equipment-activities.type-of-change",
                        "Type of Change"
                      )}
                      requiredMark
                      rules={[
                        {
                          required: true,
                          message: t(
                            "validations.type-of-change",
                            "Please select Type of Change"
                          ),
                        },
                      ]}
                    >
                      <Select
                        className="sDash_fullwidth-select"
                        aria-required
                        onChange={onSelctTypeOfChange}
                        style={{ color: "rgb(90, 95, 125)" }}
                      >
                        {typeOfChanges &&
                          typeOfChanges?.map((item) => (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                    {showNameOfOperatorInput && (
                      <>
                        <Form.Item
                          name="newOperatorName"
                          label={t(
                            "equipment-activities:new-operator-name-label",
                            "New Operator Name"
                          )}
                          requiredMark
                        >
                          <Input
                            placeholder={t(
                              "equipment-activities:new-operator-name-label",
                              "New Operator Nam"
                            )}
                            required
                          />
                        </Form.Item>
                      </>
                    )}

                    {!showNameOfOperatorInput && (
                      <Form.Item
                        name="newCoolantId"
                        required
                        label={t(
                          "equipment-activities.new-coolant",
                          "New Coolant"
                        )}
                        requiredMark
                        rules={[
                          {
                            required: !showNameOfOperatorInput,
                            message: t(
                              "validations.new-coolant",
                              "Please select Type of Coolant"
                            ),
                          },
                        ]}
                      >
                        <Select
                          className="sDash_fullwidth-select"
                          aria-required
                          onChange={(e) => console.log(e, "<==")}
                          style={{ color: "rgb(90, 95, 125)", width: "100%" }}
                        >
                          {newCoolants &&
                            newCoolants?.map((item) => (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    )}

                    <Form.Item
                      name="technicianCertificateNumber"
                      label={t(
                        "equipment-activities:technician-license-number",
                        "Technician License Number"
                      )}
                      required
                      requiredMark
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex" }}>
                          <Input
                            placeholder={t(
                              "equipment-activities:technician-license-number-placeholder",
                              "Technician License Number"
                            )}
                            disabled={technician}
                          />
                          <Button
                            style={{
                              height: 50,
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                            }}
                            type={`${technician ? "danger" : "primary"}`}
                            onClick={handleOnFetchTechnicianDetails}
                          >
                            <FeatherIcon
                              icon={`${technician ? "x" : "search"}`}
                              size={20}
                            />
                          </Button>
                        </div>
                        <div>
                          {showInvalidLicenseNumber && (
                            <div>
                              <span style={{ color: "red" }}>
                                {t(
                                  "equipment-activities:technician-not-assigned-to-company",
                                  "This license number isn't asigned to any Technician of this Company"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label={t(
                        "equipment-activities:technician-fullName",
                        "Technician's Name and Surname"
                      )}
                    >
                      <Input
                        disabled
                        placeholder={t(
                          "equipment-activities:technician-fullName-placeholder",
                          "Technician's Name and Surname"
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      disabled
                      name="email"
                      label={t(
                        "equipment-activities:technician-email",
                        "Technician's Email"
                      )}
                    >
                      <Input
                        disabled
                        placeholder={t(
                          "equipment-activities:technician-email-placeholder",
                          "Technician's Email"
                        )}
                      />
                    </Form.Item>

                    <Form.Item
                      name="authorizedRepairerPhoneNumber"
                      label={t(
                        "equipment-activities:repairer-phoneNumber",
                        "Authorized Repairer's Phone Number"
                      )}
                      required={false}
                    >
                      <Input
                        disabled
                        placeholder={t(
                          "equipment-activities:repairer-phoneNumber-placeholder",
                          "Authorized Repairer's Phone Number"
                        )}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Dragger
                        beforeUpload={(file) => {
                          setFileList([...fileList, file]);
                          return false; // prevent auto uploading
                        }}
                        onRemove={(file) => {
                          const index = fileList.indexOf(file);
                          const newFileList = fileList.slice();
                          newFileList.splice(index, 1);
                          setFileList(newFileList);
                        }}
                      >
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                          {t(
                            "equipment-activities:drag-files",
                            "Click or drag file(s) to this area to upload"
                          )}
                        </p>
                      </Dragger>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="comments"
                      label={t(
                        "equipment-activities:comments-label",
                        "Comments"
                      )}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder={t(
                          "equipment-activities:comments-placeholder",
                          "Enter Comments"
                        )}
                      />
                    </Form.Item>

                    <div
                      className="steps-action"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button type="link" onClick={onCancel}>
                        {t("equipment-activities:cancel", "Cancel")}
                      </Button>
                      <Button
                        className="btn-next"
                        type="primary"
                        disabled={!technician || showInvalidLicenseNumber}
                        loading={isSaving}
                        htmlType="submit"
                        style={{ height: 50, padding: "10px 20px" }}
                      >
                        {t("general:submit", "Submit")}
                        <FeatherIcon icon="check" size={16} />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </BasicFormWrapper>
  );
};

export default CreateEquipmentActivity;
