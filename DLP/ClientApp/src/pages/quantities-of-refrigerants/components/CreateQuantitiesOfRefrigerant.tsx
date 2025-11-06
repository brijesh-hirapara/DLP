import { BasicFormWrapper } from "container/styled";
import { Form, Input, PageHeader, Row, Col } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { Button } from "components/buttons/buttons";
import { Main } from "container/styled";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import DataOnPurchasedSection from "./DataOnPurchasedSection";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f2f2f2;
    text-align: left;
  }

  td {
    background-color: #ffffff;
  }
`;


const CreateQuantitiesOfRefrigerant = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {

    }

    return (
        <>
            <PageHeader
                ghost
                title={t("side-bar:reports.prilog", "PRILOG")}
            />
            <Main>
                <Row gutter={25}>
                    <Col sm={24} xs={24}>
                        <Cards headless>
                            <BasicFormWrapper className="basic-form-inner">
                                <div className="">
                                    <Form
                                        form={form}
                                        name="guaranteedPrice"
                                        onFinish={handleSubmit}
                                    >
                                        <StyledTable>
                                            <thead>
                                                <tr>
                                                    <th colSpan={6}>
                                                        {t('form:general-info', 'General information about the authorized service provider')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={3}>
                                                        <Form.Item
                                                            label={t("global.name-of-legal-entity", "Name of legal entity or entrepreneur")}
                                                            name="nameOfLegalEntity"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-name-of-legal-entity",
                                                                        "Please write the name of the legal entity or entrepreneur!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={3}>
                                                        <Form.Item
                                                            label={t("global.registration-number", "Registration number")}
                                                            name="registrationNumber"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-registration-number",
                                                                        "Please write the registration number!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.phone", "Tel / Тел")}
                                                            name="phone"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-phone",
                                                                        "Please write the phone number!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.fax", "Fax / Факс")}
                                                            name="fax"
                                                            rules={[
                                                                {
                                                                    required: false,
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.email", "Email / Емаил")}
                                                            name="email"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-email",
                                                                        "Please write the email address!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.canton", "Kanton / Canton")}
                                                            name="canton"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-canton",
                                                                        "Please write the canton!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.entity", "Entitet / Entity")}
                                                            name="entity"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-entity",
                                                                        "Please write the entity!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.authorized-person", "Name and surname of authorized person")}
                                                            name="authorizedPerson"
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "consumer-auctions:validations.write-authorized-person",
                                                                        "Please write the name and surname of the authorized person!"
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </StyledTable>
                                            {/* <DataOnPurchasedSection /> */}
                                        <div className="setting-form-actions float-end">
                                            <Button
                                                htmlType="submit"
                                                type="primary"
                                                loading={loading}
                                            >
                                                {t("global.submit", "Submit")}
                                            </Button>
                                            <Link to="/get-guarantee-price">
                                                <Button htmlType="button" className="ms-2" type="light">
                                                    {t("cancel:button", "Cancel")}
                                                </Button>
                                            </Link>
                                        </div>

                                    </Form>
                                </div>
                            </BasicFormWrapper>
                        </Cards>
                    </Col>
                </Row>
            </Main>
        </>
    );
};

export default CreateQuantitiesOfRefrigerant;
