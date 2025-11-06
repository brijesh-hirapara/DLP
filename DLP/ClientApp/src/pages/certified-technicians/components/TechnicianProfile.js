import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Row,
    Col,
    Form,
    Input,
    Select,
    Button,
    Spin,
} from "antd";
import FeatherIcon from "feather-icons-react";
import Heading from "../../../components/heading/heading";
import { BasicFormWrapper } from "../../../container/styled";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "hooks/useDebouncedValue";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { UsersApi } from "api/api";
import styled from "styled-components";
import { handleNumericInput, handleNumericInputChange, handleNumericInputKeyPress } from "utility/utility";

const { Option } = Select;

const usersApi = new UsersApi();

const Loader = styled.div`
    display: flex; 
    height: 400px;
    width: 600px; 
    justify-content: center; 
    text-
    justifyItems: center; 
    align-items: center
`

function TechnicianProfile({ form, readOnly, onEditMode, onFinish, isSaving, isLoading, submitText = 'Next', icon = 'arrow-right' }) {
    const { t } = useTranslation();
    const commonData = useContext(CommonDataContext);
    const { languages, municipalities, cantons, stateEntities } = commonData;

    const [userAlreadyExists, setUserAlreadyExists] = useState();

    const onMunicipalityChange = (value) => {
        const municipality = municipalities.find((item) => item.id === value);
        if (municipality) {
            form.setFieldsValue({
                cantonId: municipality.cantonId,
                stateEntityId: municipality.stateEntityId,
            });
        }
    };

    const emailDebouncedValue = useDebouncedValue({ delay: 300, value: Form.useWatch("email", form) });

    const validateUser = useCallback(async () => {
        try {
            const email = form.getFieldValue("email")?.trim();
            if (!email) return;

            const response = await usersApi.usersAvailableEmailGet({ email });

            if (!response.data) {
                setUserAlreadyExists(true);
                form.setFields([
                    {
                        name: "email",
                        errors: [t("validations.technician-email-already-exists", "Technican email already exists!")],
                    },
                ]);
                return;
            }

            setUserAlreadyExists(false);
        } catch (err) {
            console.error(err);
        }
    }, [form, setUserAlreadyExists, t]);

    useEffect(() => {
        if (!onEditMode && !readOnly)
            validateUser();
    }, [onEditMode, readOnly, emailDebouncedValue]);

    return (
        <>
            {isLoading ? <Loader ><Spin /> </Loader> :

                <BasicFormWrapper className="basic-form-inner">
                    <div className="atbd-form-checkout">
                        <Row justify="center">
                            <Col xs={24}>
                                <div className="create-account-form">
                                    <Heading as="h4">Technician's Profile</Heading>
                                    <Form
                                        form={form}
                                        name="account"
                                        requiredMark
                                        onFinish={onFinish}
                                    >
                                        <Form.Item
                                            name="email"
                                            required
                                            label="Email Address"
                                            tooltip="This email will be used for logging into the app"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t(
                                                        "users.create:email-validation",
                                                        "Email is required"
                                                    ),
                                                    pattern:
                                                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                },
                                            ]}
                                        >
                                            <Input
                                                prefix={<FeatherIcon icon="mail" size={14} />}
                                                placeholder="Email Address"
                                                required
                                                disabled={onEditMode || readOnly}
                                            />
                                        </Form.Item>

                                        <Form.Item name="personalNumber" required label="JMB Number">
                                            <Input
                                                disabled={userAlreadyExists || readOnly}
                                                placeholder="JMB Number*"
                                                prefix={
                                                    <FeatherIcon icon="book" size={14} />
                                                }
                                                required
                                                onChange={handleNumericInputChange}
                                                onKeyPress={handleNumericInputKeyPress}
                                            />
                                        </Form.Item>

                                        <Form.Item name="firstName" required
                                            label="First Name">
                                            <Input
                                                placeholder="First Name*"
                                                required
                                                disabled={userAlreadyExists || readOnly}
                                                prefix={<FeatherIcon icon="user" size={14} />}
                                            />
                                        </Form.Item>

                                        <Form.Item name="lastName" required label="Last Name">
                                            <Input
                                                disabled={userAlreadyExists || readOnly}
                                                placeholder="Last Name*"
                                                prefix={
                                                    <FeatherIcon icon="users" size={14} />
                                                }
                                                required
                                            />
                                        </Form.Item>

                                        <Form.Item name="address" label="Address">
                                            <Input
                                                disabled={userAlreadyExists || readOnly}
                                                placeholder="Address"
                                                prefix={
                                                    <FeatherIcon icon="navigation" size={14} />
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item name="placeOfBirth" label="Place">
                                            <Input
                                                disabled={userAlreadyExists || readOnly}
                                                placeholder="Place"
                                                prefix={
                                                    <FeatherIcon icon="map-pin" size={14} />
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item name="organization" required label="Training Center">
                                            <Input
                                                readOnly={true}
                                                prefix={<FeatherIcon icon="server" size={14} />}
                                                required
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="municipalityId"
                                            label={t(
                                                "global.select-municipality",
                                                "Select Municipality"
                                            )}
                                            required
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t(
                                                        "validations.select-municipality",
                                                        "Please select Municipality"
                                                    ),
                                                },
                                            ]}
                                        >
                                            <Select
                                                disabled={userAlreadyExists || readOnly}
                                                showSearch
                                                filterOption={(input, option) =>
                                                    option.props.children
                                                        ?.toLowerCase()
                                                        .indexOf(input?.toLowerCase()) >= 0
                                                }
                                                className="sDash_fullwidth-select"
                                                style={{ color: "rgb(90, 95, 125)" }}
                                                aria-required
                                                onChange={onMunicipalityChange}
                                            >
                                                {municipalities &&
                                                    municipalities.map((item) => (
                                                        <Option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name="cantonId"
                                            required
                                            label={t(
                                                "global.select-canton",
                                                "Select Canton"
                                            )}
                                        >
                                            <Select
                                                className="sDash_fullwidth-select"
                                                aria-required
                                                style={{ color: "rgb(90, 95, 125)" }}
                                                disabled
                                            >
                                                {cantons &&
                                                    cantons.map((item) => (
                                                        <Option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name="stateEntityId"
                                            required
                                            label={t(
                                                "global.select-entity",
                                                "Select Entity"
                                            )}
                                            requiredMark
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t(
                                                        "validations.select-entity",
                                                        "Please select Entity"
                                                    ),
                                                },
                                            ]}
                                        >
                                            <Select
                                                className="sDash_fullwidth-select"
                                                aria-required
                                                style={{ color: "rgb(90, 95, 125)" }}
                                                disabled
                                            >
                                                {stateEntities &&
                                                    stateEntities.map((item) => (
                                                        <Option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name="languageId"
                                            required
                                            label="Default Language"
                                            requiredMark
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please select language",
                                                },
                                            ]}
                                        >
                                            <Select
                                                className="sDash_fullwidth-select"
                                                aria-required
                                                style={{ color: "rgb(90, 95, 125)" }}
                                                disabled={userAlreadyExists || readOnly}

                                            >
                                                {languages &&
                                                    languages.map((item) => (
                                                        <Option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </Option>
                                                    ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="comments" label="Comments">
                                            <Input.TextArea
                                                rows={3}
                                                disabled={userAlreadyExists || readOnly}
                                                placeholder={'Comments'}
                                            />
                                        </Form.Item>
                                        {!readOnly && <div className="steps-action">
                                            <Button
                                                className="btn-next"
                                                type="primary"
                                                loading={isSaving}
                                                htmlType="submit"
                                                disabled={userAlreadyExists}
                                                style={{ height: 50, padding: "10px 20px" }}
                                            >
                                                {submitText}
                                                <FeatherIcon icon={icon} size={16} />
                                            </Button>
                                        </div>}
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </BasicFormWrapper>}
        </>
    );

}

export default TechnicianProfile;
