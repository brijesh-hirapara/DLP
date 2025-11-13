import { Divider, Form, Input, Row, Col, Select, Spin } from "antd";
import { Button } from "components/buttons/buttons";
import { useNavigate } from "react-router-dom";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { EMAIL_REGEX_PATTERN } from "constants/constants";
import { showServerErrors } from "utility/showServerErrors";
import { CodebookApi, OrganizationsApi } from "api/api";
import { CodebookDto, OrganizationDto, OrganizationRequest } from "api/models";
import { hasPermission } from "utility/accessibility/hasPermission";
import { QuestionnairesDto } from "api/models/questionnaires-dto";
// import countryList from 'react-select-country-list';

const { Option } = Select;
const codebooksApi = new CodebookApi();

interface CompanyInfoFormProps {
    id: string | undefined;
    isVisible: boolean;
    institutionToEdit?: OrganizationDto | null;
    onHide: () => void;
    onSubmitSuccess: () => void;
    currentUserIsCompany: boolean;
}

const organizationApi = new OrganizationsApi();

const defaultValues = {
    name: "",
    idNumber: "",
    taxNumber: "",
    responsiblePersonFullName: "",
    responsiblePersonFunction: "",
    address: "",
    place: "",
    email: "",
    municipalityId: "",
    stateEntityId: "",
    phoneNumber: "",
    websiteUrl: "",
    contactPersonFirstName: "",
    contactPersonLastName: "",
    contactPersonEmail: "",
    postCode: "",
};

export const CompanyInfoForm = ({
    id,
    isVisible,
    onSubmitSuccess,
    onHide,
    institutionToEdit,
    currentUserIsCompany = false,
}: CompanyInfoFormProps) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!institutionToEdit;
    const navigate = useNavigate();

    const commonData = useContext(CommonDataContext);
    const { municipalities, userGroups, stateEntities, cantons, isLoading: loadingCommonData } = commonData as any;
    const [country, setCountry] = useState<{ label: string; value: string } | null>(null);
    // const countryOptions = useMemo(() => countryList().getData(), []);
    const [codebooks, setCodebooks] = useState<{ [key: string]: CodebookDto[] }>({});
    const [questionnaires, setQuestionnaires] = useState<QuestionnairesDto[] | null>();


    const handleCountryChange = (value: { label: string; value: string } | null) => {
        if (value) {
            setCountry(value);
            form.setFieldsValue({ country: value.label });
        } else {
            setCountry(null);
            form.setFieldsValue({ country: '' });
        }
    };

    useEffect(() => {

        if (institutionToEdit) {
            setFieldsForEdit(institutionToEdit);
            setQuestionnaires(institutionToEdit?.questionnaires);
        }
    }, [institutionToEdit]);

    useEffect(() => {
        const fetchCodebooks = async () => {
            const { data } = await codebooksApi.apiCodebookGet();
            setCodebooks(data);
        };
        fetchCodebooks();
    }, []);

    const setFieldsForEdit = async (institution: OrganizationRequest) => {
        try {
            onMunicipalityChange(institution?.municipalityId);
            const {
                address,
                contactPersonFirstName,
                contactPersonLastName,
                contactPersonEmail,
                countryId,
                name,
                email,
                phoneNumber,
                municipalityId,
                place,
                city,
                postalCode,
                responsiblePersonFullName,
                responsiblePersonFunction,
                idNumber,
                taxNumber,
                websiteUrl,
                userGroups,
                postCode,
            } = institution;

            form.setFieldsValue({
                id,
                municipalityId,
                name,
                idNumber,
                taxNumber,
                countryId,
                city,
                email,
                responsiblePersonFullName,
                responsiblePersonFunction,
                address,
                place,
                phoneNumber,
                postalCode,
                websiteUrl,
                contactPersonFirstName,
                contactPersonLastName,
                contactPersonEmail,
                userGroups,
                postCode,
            });
        } catch (err) { }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            if (isEditMode) {
                await organizationApi.apiOrganizationsIdPut({
                    id: values.id,
                    organizationRequest: values,
                });
            } else {
                await organizationApi.apiOrganizationsPost({
                    organizationRequest: values,
                });
            }
            onSubmitSuccess()
            if (currentUserIsCompany) {
                openNotificationWithIcon(
                    "success",
                    t(
                        'company-info-updated',
                        `Data updated successfully!`
                    )
                );
            } else {
                openNotificationWithIcon(
                    "success",
                    t(
                        `company-info.success.${isEditMode ? "edit" : "add"}`,
                        `Company Info ${isEditMode ? "updated" : "created"} successfully!`
                    )
                );
            }

        } catch (err) {
            showServerErrors(err);
        } finally {
            setLoading(false);
        }
    };

    const onMunicipalityChange = (value: any) => {
        const municipality = municipalities.find((item: any) => item.id === value);
        if (municipality) {
            form.setFieldsValue({
                cantonId: municipality.cantonId,
                stateEntityId: municipality.stateEntityId,
            });
        }
    };

    const handleCancel = (e: any) => {
        e.preventDefault();
        // form.resetFields();
        navigate(-1);
    };


    const inputLabels = {
        name: t("global.company-name", "Company name"),
        // idNumber: t("global.id-number", "Id number"),
        taxNumber: t("global.tax-number", "Tax number"),
        country: t("global.country", "Country"),
        // responsiblePerson: t(
        //     "institution.responsible-person",
        //     "Responsible person"
        // ),
        // responsiblePersonFunction: t(
        //     "institution.responsible-person-function",
        //     "Function of the responsible person"
        // ),
        address: t("global.company-address", "Company Address"),
        city: t("global.city", "City"),
        postalCode: t("global.postal-code", "Postal Code"),
        // emailAddress: t("global.institution-email", "Institution email address"),
        // phoneNumber: t("global.institution-phone", "Institution phone"),
        // websiteUrl: t("global.website-url", "Website URL"),
        // contactPersonFirstName: t(
        //     "global.contact-person-first-name",
        //     "Contact person first name"
        // ),
        // contactPersonLastName: t(
        //     "global.contact-person-last-name",
        //     "Contact person last name"
        // ),
        // contactPersonEmail: t(
        //     "global.contact-person-email",
        //     "Contact person email"
        // ),
    };

    return (
        <>
            {loadingCommonData ? (
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
                // <Col>
                    // <Row style={{ justifyContent: 'center' }}>
                    <>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <BasicFormWrapper
                            style={{ width: "100%", maxWidth: 1200, }}
                        >
                            <Form
                                requiredMark
                                form={form}
                                name={isEditMode ? "editInstitution" : "addInstitution"}
                                onFinish={handleSubmit}
                                initialValues={defaultValues}
                                validateTrigger={["onChange", "onBlur", "onSubmit"]}
                                onFinishFailed={({ errorFields }) => {
                                  form.scrollToField(errorFields[0].name);
                                }}
                            >
                        <BasicFormWrapper
                            style={{ width: "50%", margin:"auto" }}
                        >
                                <Form.Item name="id" hidden>
                                    <Input placeholder="Id" />
                                </Form.Item>

                                <Form.Item
                                    required
                                    requiredMark
                                    rules={[
                                        {
                                            required: true,
                                            message: t("validations.required-field", {
                                                field: t("global.company-name", "Company name"),
                                                defaultValue: "{{field}} is required!",
                                            }),
                                        },
                                        {
                                            pattern: /^(?!\s)(?!.*\s$).+/,
                                            message: t("validations.no-whitespace", {
                                                field: t("global.company-name", "Company name"),
                                              defaultValue: "{{field}} cannot be empty or whitespace only."
                                            }),
                                          },
                                    ]}
                                    
                                    name={"name"}
                                    label={inputLabels.name}
                                >
                                    <Input
                                        required
                                        // disabled={isEditMode}
                                        placeholder={inputLabels.name}
                                        prefix={<FeatherIcon icon="user" size={14} />}
                                    />
                                </Form.Item>

                                <Form.Item name="taxNumber" label={inputLabels.taxNumber}
                                    required
                                    requiredMark
                                    rules={[
                                        {
                                            required: true,
                                            len: 12,
                                            message: t('create-institution:tax-number-validation', 'Tax Number should be at Exact 12 characters'),
                                        },
                                    ]}>
                                    <Input
                                        required
                                        prefix={<FeatherIcon icon="hash" size={14} />}
                                        placeholder={inputLabels.taxNumber}
                                        disabled={isEditMode}
                                        maxLength={12} // Limit input length to 12 characters
                                    />
                                </Form.Item>
                             
                                <Form.Item
                                    name="countryId"
                                    required
                                    label={inputLabels.country}
                                    // requiredMark
                                    rules={[
                                        {
                                            required: true,
                                            message: t("validations.required-select-field", {
                                                field: t("register:country", "Country"),
                                                defaultValue: "Please select {{field}}",
                                            }),
                                        },
                                    ]}
                                >
                                    <Select
                                        className="sDash_fullwidth-select"
                                        aria-required
                                        size="large"
                                        placeholder={inputLabels.country}
                                    // style={{ color: "rgb(90, 95, 125)/" }}
                                    >
                                        {codebooks["Country"] &&
                                            codebooks["Country"]?.map((item) => (
                                                <Option key={item.id} value={item.id}>
                                                    {item.name}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="place" label={inputLabels.city} required requiredMark
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
                                    <Input
                                        required
                                        placeholder={inputLabels.city}
                                        prefix={<FeatherIcon icon="map" size={14} />}
                                    />
                                </Form.Item>
                                <Form.Item name="address" label={inputLabels.address} required requiredMark 
                                  rules={[
                                    {
                                        required: true,
                                        message: t("validations.required-field", {
                                            field: t("global.address", "Address"),
                                            defaultValue: "{{field}} is required!",
                                        }),
                                    },
                                    {
                                        pattern: /^(?!\s)(?!.*\s$).+/,
                                        message: t("validations.no-whitespace", {
                                            field: t("global.address", "Address"),
                                          defaultValue: "{{field}} cannot be empty or whitespace only."
                                        }),
                                      },
                                ]}>
                                    <Input
                                        required
                                        prefix={<FeatherIcon icon="navigation" size={14} />}
                                        placeholder={inputLabels.address}
                                    />
                                </Form.Item>

                                <Form.Item name="postCode" label={inputLabels.postalCode} required requiredMark
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
                                ]}>
                                    <Input
                                        required
                                        placeholder={inputLabels.postalCode}
                                        prefix={<FeatherIcon icon="map-pin" size={14} />}
                                    />
                                </Form.Item>
                        </BasicFormWrapper>
                          
                    {/* </Row>


                    <Row> */}
                        {/* <BasicFormWrapper> */}
                        {hasPermission("profile:view-questionnaire") && (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 25 }}>
                                <div
                                    style={{
                                        // maxWidth: '900px',
                                        width: '100%',
                                        marginTop: 25
                                    }}
                                >
                                    <div
                                        style={{
                                            border: "2px solid rgb(250 250 250)",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            marginBottom: "24px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#FFFFFF",
                                                padding: "12px 16px",
                                                textAlign: "center",
                                                fontWeight: 600,
                                                borderBottom: "1px solid rgb(250 250 250)",
                                            }}
                                        >

                                            {t("profile:edit.questionnarie-responses", "Questionnarie Responses")}
                                        </div>

                                        <div
                                            style={{
                                                background: "rgb(245 245 245)",
                                                display: "flex",
                                                padding: "16px",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div style={{ width: "33%" }}>
                                                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                                                    {t("profile:edit.shipping-frequency", "1. How often do you ship?")}
                                                </p>

                                                {(() => {
                                                    const answer = questionnaires?.find(q => q.questionNo === 1)?.values;

                                                    if (answer === 1) {
                                                        return <p style={{ margin: 0, paddingLeft: 15 }}>I have only one shipment</p>;
                                                    } else if (answer === 2) {
                                                        return <p style={{ margin: 0, paddingLeft: 15 }}>I ship frequently</p>;
                                                    } else {
                                                        return <p style={{ margin: 0, paddingLeft: 15 }}>-</p>;
                                                    }
                                                })()}
                                            </div>

                                            <div style={{ width: "33%" }}>
                                                <p style={{ fontWeight: 600, marginBottom: 4 }}>{t("profile:edit.goods-planning-to-ship", "2. What goods are you planning to ship?")}</p>
                                                {(() => {
                                                    const goods = questionnaires?.filter(q => q.questionNo === 2) ?? [];

                                                    return goods.length
                                                        ? goods
                                                            .map(g => g.codebookName)
                                                            .filter(Boolean)
                                                            .map((name, idx) => (
                                                                <p key={idx} style={{ margin: 0, paddingLeft: 15 }}>
                                                                    {name}
                                                                </p>
                                                            ))
                                                        : <p style={{ margin: 0, paddingLeft: 15 }}>-</p>;
                                                })()}
                                            </div>

                                            <div style={{ width: "33%" }}>
                                                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                                                    {t("profile:edit.size-are-your-shipments", "3. What size are your shipments?")}
                                                </p>

                                                {(() => {
                                                    const sizes = questionnaires?.filter(q => q.questionNo === 3) ?? [];

                                                    const sizeLabels = sizes
                                                        .map(s => {
                                                            switch (s.trailerQTY) {
                                                                case 1: return "LTL";        // Less Than Truckload
                                                                case 2: return "Groupage";   // Optional intermediate
                                                                case 3: return "FTL";        // Full Truckload
                                                                default: return null;        // ignore invalid or 0 values
                                                            }
                                                        })
                                                        .filter(Boolean);

                                                    return sizeLabels.length
                                                        ? sizeLabels.map((label, idx) => (
                                                            <p key={idx} style={{ margin: 0, paddingLeft: 15 }}>
                                                                {label}
                                                            </p>
                                                        ))
                                                        : <p style={{ margin: 0, paddingLeft: 15 }}>-</p>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}


                             <BasicFormWrapper
                            style={{ width: "50%", margin:"auto" }}
                                >    
                            <div style={{ display: 'flex', justifyContent: 'left', width: '100%', margin: '30px 0 30px 0px' }}>
                                <Row style={{ gap: "20px" }}>
                                    <Button
                                        htmlType="submit"
                                        size="default"
                                        loading={loading}
                                        type="primary"
                                        key="submit"
                                    >
                                        {t("company.form.button", "Save Changes")}
                                    </Button>
                                    <Button size="default" onClick={handleCancel} type="light" outlined >
                                        Cancel
                                    </Button>
                                </Row>
                            </div>
                            </BasicFormWrapper>
                            </Form>
                        </BasicFormWrapper>
                            </div>
                       
                    {/* </Row> */}
                {/* // </Col> */}
                        </>
            )}
        </>
    );
};
