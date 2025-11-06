import { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Button, Spin, Upload } from "antd";
import { useTranslation } from "react-i18next";
import { OrganizationsApi } from "api/api";
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


const organizationsApi = new OrganizationsApi();

type ViewOrderDetailsProps = {
  visible: boolean;
  onCancel: () => void;
  user: any;
  activeSection: "view" | "assignTruck" | "uploadPod";
};

const ViewOrderDetails = ({
  visible,
  onCancel,
  user,
  activeSection,
}: ViewOrderDetailsProps) => {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    let timer: any;
    const setUser = async () => {
      const tempUser = { ...user };
      tempUser["institution"] = await getInstitution(user?.organizationId);
      tempUser["fullName"] = user.firstName + " " + user.lastName;
      form.setFieldsValue(tempUser);
      timer = setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    if (user) setUser();
    return () => clearTimeout(timer);
  }, [user]);

  const getInstitution = async (id: any) => {
    if (!id) return "";
    try {
      const { data } = await organizationsApi.apiOrganizationsIdGet({ id });
      return data.name;
    } catch {
      return "";
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
        {/* {activeSection === "view" && (
  <>
          <ModalHeader>
            {t("my-orders.upload-pod", "Upload POD")}
          </ModalHeader>
          <ModalCardSection style={{ marginBottom: "20px" }}>
            <Form layout="vertical" form={form}>
<Row
  gutter={0}
  style={{
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #ececec",
    maxWidth: 700,
    margin: "0 auto",
    padding: "24px",
    minHeight: 380
  }}
>
  <Col xs={24} md={14} style={{ borderRight: "1px solid #ececec" }}>
    <div>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 18
      }}>Shipments Details</div>
        <div style={{ display: "flex", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 18,
            height: 18,
            background: "#6366f1",
            borderRadius: 12,
            marginRight: 14,
            border: "5px solid #f4f4f4",
            marginTop: 1
          }}></div>
          <div style={{ marginBottom: 15, marginTop: -2 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:18</div>
            <div>
              <span style={{ fontWeight: 500 }}>Proof Of Delivery (POD) Uploaded</span>
              <Button
                type="primary"
                size="small"
                style={{
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  padding: "0 18px",
                  marginLeft: 16,
                  height: 28,
                  borderRadius: 6,
                  background: "#6366f1",
                  border: "none"
                }}
              >CONFIRM POD</Button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:17</div>
            <div>Proof Of Delivery | POD Uploaded</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:16</div>
            <div>Requested Delivery</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:15</div>
            <div>Possible Pick-Up</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:14</div>
            <div>Truck Assigned</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:13</div>
            <div>Offer Booked</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{
            width: 14,
            height: 14,
            background: "#fff",
            border: "2px solid #6366f1",
            borderRadius: "50%",
            marginRight: 17,
            marginTop: 4
          }}></div>
          <div>
            <div style={{ fontWeight: 500 }}>Fri, 19.08.2025, 18:12</div>
            <div>Request Created</div>
          </div>
        </div>
      </div>
  </Col>
  <Col xs={24} md={10} style={{ paddingLeft: 32 }}>
    <div>
      <div style={{
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 18
      }}>Truck & Driver Information</div>
      <div style={{
        fontSize: 15,
        marginBottom: 8
      }}>
        <b>Truck Driver First Name:</b> John
      </div>
      <div style={{
        fontSize: 15,
        marginBottom: 8
      }}>
        <b>Truck Driver Last Name:</b> Doe
      </div>
      <div style={{
        fontSize: 15,
        marginBottom: 8
      }}>
        <b>Phone Number:</b> +389 77 235876
      </div>
      <div style={{
        fontSize: 15,
        marginBottom: 8
      }}>
        <b>Passport ID:</b> 123456
      </div>
      <div style={{
        fontSize: 15,
        marginBottom: 8
      }}>
        <b>Truck Number:</b> 879
      </div>
      <Button
        type="primary"
        style={{
          width: 100,
          fontWeight: 600,
          letterSpacing: 0.2,
          background: "#6366f1",
          borderColor: "#6366f1",
          borderRadius: 8,
          marginTop: 18
        }}
      >Close</Button>
    </div>
  </Col>
</Row>
</Form>
</ModalCardSection>
</>
)} */}

          <ModalHeader>
            {t("my-orders.order-details", "Order Details")}{" "}
          </ModalHeader>
          <ModalCardSection style={{ marginBottom: "20px" }}>
            <Form layout="vertical" form={form}>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("my-orders.request-id", "Request ID")}
                    name="id"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>
                  <Form.Item
                    label={t("my-orders.booked-price", "Booked Price")}
                    name="bookedPrice"
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
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder={t("my-orders.truck-driver-first-name", "Truck Driver First Name")} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label={<span>{t("my-orders.truck-driver-last-name", "Truck Driver Last Name")}</span>}
                    name="driverLastName"
                    rules={[{ required: true, message: "Required" }]}
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
                    rules={[{ required: true, message: "Required" }]}
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
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder={t("my-orders.truck-number", "Truck Number")}/>
                  </Form.Item>
                </Col>
              </Row>
              <FooterButtons>
                <Button type="primary" htmlType="submit">
                 {t("my-orders.assign", "Assign")}
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
                    label={
                      <span>
                        {t("my-orders.upload-document", "Upload Document")}
                      </span>
                    }
                    name="uploadedFile"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) return e;
                      return e?.fileList;
                    }}
                    rules={[
                      { required: true, message: "Please upload a file" },
                    ]}
                  >
                    <Upload.Dragger
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      beforeUpload={(file) => {
                        const isPdfOrDoc =
                          file.type === "application/pdf" ||
                          file.type ===
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                          file.type === "application/msword";
                        if (!isPdfOrDoc) {
                          message.error(
                            `${file.name} is not a valid document file`
                          );
                        }
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error("File must be smaller than 5MB");
                        }
                        return isPdfOrDoc && isLt5M;
                      }}
                      multiple={false}
                      maxCount={1}
                      showUploadList={{ showRemoveIcon: true }}
                    >
                      <Button icon={<UploadOutlined />}>
                        {t(
                          "my-orders.click-to-upload",
                          "Click or drag file to upload"
                        )}
                      </Button>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
              </Row>
              <FooterButtons>
                <Button type="primary" htmlType="submit">
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
