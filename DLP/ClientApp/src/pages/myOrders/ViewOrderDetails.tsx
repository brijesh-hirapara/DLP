import { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Button, Spin, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { OrganizationsApi, RequestsApi } from "api/api";
import PhoneInput from 'react-phone-input-2';
import {   Loader,
  StyledModal,
  ModalCardSection,
  ModalHeader,
  FooterButtons, } from "container/styled";
import { FaExchangeAlt } from "react-icons/fa";
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import {  Divider } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { AssignTruckShipmentsDto } from "api/models/assign-truck-shipments-dto";
import openNotificationWithIcon from "utility/notification";

const requestsApi = new RequestsApi();
const organizationsApi = new OrganizationsApi();

type ViewOrderDetailsProps = {
  visible: boolean;
  onCancel: () => void;
  user: any;
  activeSection: "view" | "assignTruck" | "uploadPod";
  refreshOrders: () => void; 
};

const ViewOrderDetails = ({
  visible,
  onCancel,
  user,
  activeSection,
  refreshOrders
}: ViewOrderDetailsProps) => {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
  if (user) {
    setLoading(false);
    form.setFieldsValue({
      requestId: user.requestId,
      price: user.transportCarrier?.[0]?.adminApprovedPrice || "",
      documents: "", 
      estimatedPickup: user.transportCarrier?.[0] 
        ? `${new Date(user.transportCarrier[0].estimatedPickupDateTimeFrom).toLocaleString()} - ${new Date(user.transportCarrier[0].estimatedPickupDateTimeTo).toLocaleString()}`
        : "",
      estimatedDropoff: user.transportCarrier?.[0] 
        ? `${new Date(user.transportCarrier[0].estimatedDeliveryDateTimeFrom).toLocaleString()} - ${new Date(user.transportCarrier[0].estimatedDeliveryDateTimeTo).toLocaleString()}`
        : "",
    });
  }
}, [user, form]);

const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    const dto: AssignTruckShipmentsDto = {
      truckDriverFirstName: values.driverFirstName,
      truckDriverLastName: values.driverLastName,
      phoneNumber: values.driverPhone,
      passportId: values.passportId || "",
      truckNumber: values.truckNumber,
    };

    await requestsApi.apiShipmentsIdAssignTruckPost({
      shipmentId: user?.id || "",
      assignTruckShipmentsDto: dto,
    });
     refreshOrders();
    openNotificationWithIcon("success", t("assign-truck.success", "Offer submitted successfully"));
    onCancel();
  } catch (error) {
    openNotificationWithIcon("error", t("assign-truck.error", "Failed to assign truck"));
  }
};


const handleUploadSubmit = async () => {
  try {
    if (!uploadedFiles.length) {
      message.error("Please upload at least one file");
      return;
    }
    // Call your API method here with shipmentId and files
    await requestsApi.apiShipmentsUploadIdPost({
      shipmentId: user?.id || "",
      files: uploadedFiles
    });
    openNotificationWithIcon("success", t("upload-pod.success", "POD uploaded successfully"));
    refreshOrders();
    onCancel();
  } catch (error) {
    openNotificationWithIcon("error", t("upload-pod.error", "Failed to upload POD"));
  }
};


  return (
    <StyledModal
      title={null}
      footer={null}
      onCancel={onCancel}
      open={visible}
      width={800}
      bodyStyle={{ padding: "30px 20px" }}
      centered
      closable={false}
    >
      {loading ? (
        <Loader>
          <Spin />
        </Loader>
      ) : (
        <>
          <ModalHeader>
            {t("my-orders.order-details", "Order Details")}{" "}
          </ModalHeader>
          <ModalCardSection style={{ marginBottom: "20px" }}>
            <Form layout="vertical" form={form}>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("my-orders.request-id", "Request ID")}
                    name="requestId"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("my-orders.booked-price", "Booked Price")}
                    name="price"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("my-orders.documents", "Documents")}
                    name="documents"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={24} lg={11}>
                  <Form.Item
                    label={t("my-orders.possible-pick-up", "Possible Pick-Up")}
                    name="estimatedPickup"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={2}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    marginTop: "45px",
                  }}
                >
                  {/* Centered exchange icon only */}
                  <FaExchangeAlt size={18} color="#6366f1" />
                </Col>

                <Col xs={24} sm={24} md={24} lg={11}>
                  <Form.Item
                    label={t(
                      "my-orders.requested-delivery",
                      "Requested Delivery"
                    )}
                    name="estimatedDropoff"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </ModalCardSection>

{activeSection === "assignTruck" && (
            <>
          <ModalHeader>
            {t("my-orders.assign-truck", "Assign Truck")}
          </ModalHeader>
          <ModalCardSection>
            <Form layout="vertical" form={form}>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<span>{t("my-orders.truck-driver-first-name", "Truck Driver First Name")}</span>}
                    name="driverFirstName"
                    rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("my-orders.driver-first-name", "Truck Driver First Name"),
                      defaultValue: "Truck Driver First Name is required!",
                    }),
                  },
                  ]}
                  >
                    <Input placeholder={t("my-orders.truck-driver-first-name", "Truck Driver First Name")} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<span>{t("my-orders.truck-driver-last-name", "Truck Driver Last Name")}</span>}
                    name="driverLastName"
                    rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("my-orders.driver-last-name", "Truck Driver Last Name"),
                      defaultValue: "Truck Driver Last Name is required!",
                    }),
                  },
                  ]}
                  >
                    <Input placeholder={t("my-orders.truck-driver-last-name", "Truck Driver Last Name")}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("global.phone-number", "Phone Number")}
                    name="driverPhone"
                    rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("my-orders.phone-number", "Phone Number"),
                      defaultValue: "Phone Number is required!",
                    }),
                  },
                  ]}
                  >
                    <PhoneInput placeholder={t("global.phone-number", "Phone Number")} country="us" inputStyle={{ width: "100%", paddingBottom: 25, paddingTop: 20 }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={<span>{t("my-orders.passport-id", "Passport Id")}</span>}
                    name="passportId"
                  >
                    <Input placeholder={t("my-orders.passport-id", "Passport Id")}/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={<span>{t("my-orders.truck-number", "Truck Number")}</span>}
                    name="truckNumber"
                    rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("my-orders.truck-number", "Truck Number"),
                      defaultValue: "Truck Number is required!",
                    }),
                  },
                  ]}
                  >
                    <Input placeholder={t("my-orders.truck-number", "Truck Number")}/>
                  </Form.Item>
                </Col>
              </Row>
              <FooterButtons>
                <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                 {t("my-orders.assign-confirm", "Confirm")}
                </Button>
                <Button onClick={onCancel}>{t("global.cancel", "Cancel")}</Button>
              </FooterButtons>
            </Form>
          </ModalCardSection>
           </>
          )}
           {activeSection === "uploadPod" && (
            <>
          <ModalHeader>
            {t("my-orders.upload-pod", "Upload POD")}
          </ModalHeader>
          <ModalCardSection>
            <Form layout="vertical" form={form}>
              <Row gutter={24}>
               <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  label={t("my-orders.upload-document", "Upload Document")}
                  name="uploadedFile"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e;
                    return e?.fileList;
                  }}
                  rules={[{
                    required: true,
                    message: t("upload-pod-file.upload-pod-file", "Please upload a file"),
                  }]}
                >
                  <Upload.Dragger
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg"
                    multiple
                    beforeUpload={(file) => {
                      const validTypes = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "image/jpeg",
                      ];
                      const isAccepted = validTypes.includes(file.type);

                      if (!isAccepted) {
                        openNotificationWithIcon("error", t("upload-pod-valid.error", `${file.name} is not a valid file type`));
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        openNotificationWithIcon("error", t("upload-pod-smaller.error", "File must be smaller than 5MB"));
                      }
                      if (isAccepted && isLt5M) {
                        setUploadedFiles((prev) => [...prev, file]);
                      }
                      return false; 
                    }}
                    onRemove={(file) => {
                      setUploadedFiles((prev) => prev.filter((f) => !(f.name === file.name && f.size === file.size)));
                    }}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("my-orders.click-to-upload", "Click or drag files to upload")}
                    </Button>
                  </Upload.Dragger>
                </Form.Item>


              </Col>
              </Row>
              <FooterButtons>
                <Button type="primary" htmlType="submit" onClick={handleUploadSubmit}>
                  {t("my-orders.upload", "Upload")}
                </Button>
                <Button onClick={onCancel}>
                  {t("global.cancel", "Cancel")}
                </Button>
              </FooterButtons>
            </Form>
          </ModalCardSection>
           </>
          )}
        </>
      )}
    
    </StyledModal>
  );
};

export default ViewOrderDetails;

