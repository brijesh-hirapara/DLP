import { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Input, Spin } from "antd";
import FeatherIcon from "feather-icons-react";
import { HorizontalFormStyleWrap } from "../style";
import { BasicFormWrapper } from "../../container/styled";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { OrganizationsApi } from "api/api";
import TextArea from "antd/lib/input/TextArea";
import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';

const organizationsApi = new OrganizationsApi();

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const ViewUserDetais = ({ visible, onCancel, user }) => {
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const isCertifiedTechnician = user?.isCertifiedTechnician;

  useEffect(() => {
    let timer;

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

    return () => {
      clearTimeout(timer);
    };
  }, [user]);

  // const getInstitution = async (id) => {
  //   const { data } = await organizationsApi.apiOrganizationsIdGet({ id });
  //   return data.name;
  // };

  const getInstitution = async (id) => {
    if (!id) {
      return ""; // or return some default/fallback string
    }
    try {
      const { data } = await organizationsApi.apiOrganizationsIdGet({ id });
      return data.name;
    } catch (error) {
      console.error("Failed to get institution:", error);
      return ""; // fallback or error display text
    }
  };


  return (
    <Modal
      type="primary"
      title={
        isCertifiedTechnician
          ? t("user-view-details.technician-title", "Technician's Details")
          : t("user-view-details.title", "User Details")
      }
      footer={null}
      onCancel={onCancel}
      open={visible}
    >
      {loading ? (
        <Loader>
          <Spin />
        </Loader>
      ) : (
        <BasicFormWrapper>
          <HorizontalFormStyleWrap>
            <Form form={form} name="horizontal-icno-from" layout="horizontal">
              <Row align="middle" aria-disabled>
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="fullName">
                    {t("user-view-details.fullname", "Full Name")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  <Form.Item name="fullName">
                    <Input
                      prefix={<FeatherIcon icon="user" size={14} />}
                      readOnly={true}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row align="middle">
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="fullName">
                    {t("user-view-details.email", "Email Address")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  <Form.Item name="email">
                    <Input
                      prefix={<FeatherIcon icon="mail" size={14} />}
                      readOnly={true}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row align="middle">
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="institution">
                    {t("user-view-details.companies", "Companies")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  <Form.Item name="institution">
                    <Input
                      prefix={<FeatherIcon icon="home" size={14} />}
                      readOnly={true}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row align="middle">
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="phoneNumber">
                    {t("user-view-details.phoneNumber", "PhoneNumber")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  {/* <Form.Item name="phoneNumber">
                    <Input
                      prefix={<FeatherIcon icon="phone" size={14} />}
                      readOnly={true}
                    />
                  </Form.Item> */}
                    <Form.Item name="phoneNumber" >
                      <PhoneInput
                        country="us"
                        // preferredCountries={['us', 'in', 'gb']}
                        // disabled={true}
                        inputProps={{
                          name: 'phone',
                          readOnly: true,
                          // disabled: userAlreadyExists,
                          placeholder: t("global.phone-number", "Phone Number"),
                        }}
                        onChange={(value) => form.setFieldsValue({ phoneNumber: value })}
                        value={form.getFieldValue('phoneNumber')}
                        containerStyle={{ width: '100%' }}
                        inputStyle={{ width: '100%' }}
                      />
                    </Form.Item>
                </Col>
              </Row>

              {/* {isCertifiedTechnician && (
                <>
                  <Row align="middle">
                    <Col lg={8} md={9} xs={24}>
                      <label htmlFor="currentQualification">
                        {t(
                          "user-view-details.currentQualification",
                          "Current Qualification"
                        )}
                      </label>
                    </Col>
                    <Col lg={16} md={15} xs={24}>
                      <Form.Item name="currentQualification">
                        <Input
                          prefix={<FeatherIcon icon="award" size={14} />}
                          readOnly={true}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row align="middle">
                    <Col lg={8} md={9} xs={24}>
                      <label htmlFor="municipality">
                        {t("user-view-details.municipality", "Municipality")}
                      </label>
                    </Col>
                    <Col lg={16} md={15} xs={24}>
                      <Form.Item name="municipality">
                        <Input
                          prefix={<FeatherIcon icon="map-pin" size={14} />}
                          readOnly={true}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )} */}
{/* 
            <Row align="middle">
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="roleName">
                    {t("user-view-details.comments", "Comments")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  <Form.Item name="comments">
                    <TextArea
                      prefix={<FeatherIcon icon="chat" size={14} />}
                      readOnly={true}
                      rows={3}
                      wrap="true"
                    />
                  </Form.Item>
                </Col>
              </Row> */}

              <Row align="middle">
                <Col lg={8} md={9} xs={24}>
                  <label htmlFor="roleName">
                    {t("user-view-details.roleName", "User Group")}
                  </label>
                </Col>
                <Col lg={16} md={15} xs={24}>
                  <Form.Item name="roleName">
                    <TextArea
                      prefix={<FeatherIcon icon="users" size={14} />}
                      readOnly={true}
                      rows={3}
                      wrap="true"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </HorizontalFormStyleWrap>
        </BasicFormWrapper>
      )}
    </Modal>
  );
};

export default ViewUserDetais;
