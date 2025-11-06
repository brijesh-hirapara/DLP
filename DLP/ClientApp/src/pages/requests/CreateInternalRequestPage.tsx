import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Row,
    Col,
    Form,
    Input,
    Card,
    Divider,
    Select,
    Button,
    DatePicker,
    Upload,
    Checkbox,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { PageHeader } from "../../components/page-headers/page-headers";
import { BasicFormWrapper, DatePickerWrapper, TagInput, CardToolbox, Main } from "../../container/styled";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAccessLevel } from "hooks/useAccessLevel";
import { AccessLevelType, CantonDto, CodebookDto, MunicipalityDto, OrganizationDto, RequestStatus, RequestType, StateEntityDto } from "api/models";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { OrganizationsApi, RequestsApi, CodebookApi } from "api/api";
import { useOrganization } from "hooks/useOrganization";
import { UploadOutlined } from '@ant-design/icons';
import { Button as Btn } from "components/buttons/buttons";
import { Tag } from 'components/tags/tags';
import openNotificationWithIcon from "utility/notification";
import { UploadChangeParam, UploadFile } from "antd/lib/upload";
import { useParams } from "react-router-dom";
import { AreaOfExpertise, AreaOfExpertiseDescriptions } from "api/models/area-of-expertise-enum";
import { CodebookTypeEnum } from "api/models";
import moment from "moment";
import { RequestCompanyType } from "api/models/request-company-type";
import { showServerErrors } from "utility/showServerErrors";
const { Option } = Select;

const organizationApi = new OrganizationsApi();
const requestsApi = new RequestsApi();
const codebooksApi = new CodebookApi();

type RequestTypeDescriptions = {
    [key in RequestType]: [string, string];
};

export const RequestTypeDescriptions: RequestTypeDescriptions = {
    [RequestType.RegistrationOfOwnersAndOperators]: ["requests:request-type-1-title-key", "Create Request for registration of owners and operators of KGH equipment."],
    [RequestType.RegistrationAndLicensingOfServiceCompanies]: ["requests:request-type-2-title-key", "Create Request for registration and licensing of KGH service companies/entrepreneurs."],
    [RequestType.RegistrationAndLicensingOfImportersExporters]: ["requests:request-type-3-title-key", "Create Request for registration and licensing of importers/exporters of KGH equipment."],
    [RequestType.RequestForExtensionOfLicenseOfServiceCompanies]: ["requests:request-type-4-title-key", "Create Request for extension of the license of KGH service companies/entrepreneurs."]
};

export const CreateInternalRequestPage = () => {
    const [searchParams] = useSearchParams();
    const { type } = useParams();
    const parsedType = parseInt(type ?? '0') as RequestType;
    const isFromPublic = searchParams.get('isFromPublic') === 'true';
    const navigate = useNavigate();

    if (![
        RequestType.RegistrationOfOwnersAndOperators,
        RequestType.RegistrationAndLicensingOfServiceCompanies,
        RequestType.RegistrationAndLicensingOfImportersExporters,
        RequestType.RequestForExtensionOfLicenseOfServiceCompanies,
    ].includes(parsedType)) {
        navigate('/');
    }

    const { t } = useTranslation();
    const [form] = Form.useForm();
    const accessLevel = useAccessLevel();
    const commonData = useContext(CommonDataContext) as any;
    const {
        municipalities,
        cantons,
        stateEntities,
    } = commonData;

    const [certificateNumbers, setCertificateNumbers] = useState<string[]>([]);
    const [certificateNumbersExpanded, setCertificateNumbersExpanded] = useState<string[]>([]);
    const [certificateNumberValidity, setCertificateNumberValidity] = useState<{ checking: boolean, valid: boolean, errorMessage: string }>({ checking: false, valid: true, errorMessage: '' });
    const isRegistrationOfServiceCompany = parsedType === RequestType.RegistrationAndLicensingOfServiceCompanies;
    const isRegistrationOfImportersExporters = parsedType === RequestType.RegistrationAndLicensingOfImportersExporters;
    const isRequestForLicenseExtension = parsedType === RequestType.RequestForExtensionOfLicenseOfServiceCompanies;
    const [titleKey, titleDescription] = RequestTypeDescriptions[parsedType];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchedCompanyData, setSearchedCompanyData] = useState<OrganizationDto>({});
    const [businessActivities, setBusinessActivities] = useState<CodebookDto[] | null | undefined>([]);

    const loggedAsCompany = accessLevel === AccessLevelType.NUMBER_1;
    const companyData = useOrganization();
    useEffect(() => {
        if (companyData && Object.keys(companyData).length) {
            if (loggedAsCompany) {
                form.setFieldsValue({ ...companyData, stateEntityId: companyData.entityId });
            }
        }
    }, [accessLevel, companyData]);

    useEffect(() => {
        const fetchBusinessActivities = async () => {
            const { data: { items } } = await codebooksApi.apiCodebookByTypeGet({
                type: CodebookTypeEnum.Certificates,
                pageSize: -1
            })
            if(items){
                const sortedItems = items.sort((a:any, b:any) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                setBusinessActivities(sortedItems);
            }
       
          
        }

        fetchBusinessActivities();
    }, []);

    const onMunicipalityChange = (value: string | undefined) => {
        const municipality = municipalities.find((item: MunicipalityDto) => item.id === value);
        if (municipality) {
            form.setFieldsValue({
                cantonId: municipality.cantonId,
                stateEntityId: municipality.stateEntityId ?? companyData.entityId,
            });
        }
    };

    const onFinish = async (data: any) => {
        const attachments = form.getFieldValue('attachments');
        if (!attachments || attachments.length === 0) {
            openNotificationWithIcon(
                "error",
                t('global:attachments-required', 'Attachments are required')
            );
            return;
        }

        try {
            setIsSubmitting(true);
            await requestsApi.apiRequestsPost({
                ...form.getFieldsValue(),
                idNumber: loggedAsCompany ? companyData.idNumber : form.getFieldValue('idNumber'),
                companyId: loggedAsCompany ? companyData.id : searchedCompanyData.id,
                companyName: form.getFieldValue('name'),
                companyEmailAddress: form.getFieldValue('email'),
                companyPhoneNumber: form.getFieldValue('phoneNumber'),
                languageId: form.getFieldValue('languageId'),
                isFromPublic,
                stateEntityId: form.getFieldValue('stateEntityId'),
                type: parsedType,
                status: form.getFieldValue('status') as RequestStatus,
                certificationNumbers: certificateNumbers,
            });
            navigate("/requests");
            openNotificationWithIcon(
                "success",
                t("requests:create-success", "Request created successfully")
            );
        }
        catch (error) {
            showServerErrors(error);
        }
        finally {
            setIsSubmitting(false);
        }

    };

    const searchForCompany = async () => {
        const idNumber = form.getFieldValue('idNumber');
        if (idNumber && idNumber.toString().length === 13) {
            const { data: responseData } = await organizationApi.apiOrganizationsIdNumberIdNumberGet({ idNumber });
            if (!responseData)
                openNotificationWithIcon('error',
                    t('requests:create.company-not-found', 'Company with id number {{dynamicValue}} not found', { dynamicValue: idNumber }));
            else {
                if(responseData != null){
                    form.setFieldsValue({ ...responseData, companyId: responseData.id });
                    setSearchedCompanyData({ ...responseData });
                }
             
            }
        }else {
            openNotificationWithIcon('warning', t('requests:create.invalid-id-number', 'Please enter a valid 13-digit ID number.'));
        }
    }

    const handleFileUpload = (info: UploadChangeParam) => {
        form.setFieldValue('attachments', info.fileList.map(x => x.originFileObj));
    };

    const handleFileRemove = (fileToRemove: UploadFile) => {
        const currentFiles = form.getFieldValue('attachments') || [];
        const newFiles = currentFiles.filter((file: UploadFile) => file.uid !== fileToRemove.uid);
        form.setFieldValue('attachments', newFiles);
        // Return true to confirm the removal, or you can return a promise if you have asynchronous operations
        return true;
    };

    const onNewCertificateAdded = async (c: any) => {
        if (!c) return;
        try {
            setCertificateNumberValidity({
                checking: true,
                valid: true,
                errorMessage: ''
            });

            setCertificateNumbers(x => [...x, c]);

            const { data: responseData } = await requestsApi.apiRequestsCertificateNumbersValidityPost({
                checkCertificateNumberAvailabilityQuery: {
                    certificationNumbers: [c],
                    organizationId: loggedAsCompany ? companyData.id : null,
                }
            });
            const { isAvailable, certifiedTechnicianFullName } = responseData[0];
            setCertificateNumberValidity({
                checking: false,
                valid: isAvailable!,
                errorMessage: isAvailable
                    ? ''
                    : t('requests:create-certificate-number-exists-message', 'Certificate number {{dynamicValue}} is not available', { dynamicValue: responseData[0].certificateNumber })
            });

            if (!isAvailable) {
                setCertificateNumbers((c) => (c.slice(0, -1)));
            }

            setCertificateNumbersExpanded(x => [...x, `${c} (${certifiedTechnicianFullName})`]);
        } catch (error) {
            setCertificateNumberValidity(x => ({ ...x, valid: false, errorMessage: t('global.server-error', 'Unexpected server error') }));
        } finally {
            setCertificateNumberValidity(x => ({ ...x, checking: false }));
        }
    }

    const onDateChange = (date: any, key: any) => {
        const data = moment(date, "DD.MM.yyyy").format("MM/DD/yyyy");
        form.setFieldValue(key, data);
    };

    const handleCheckboxChange = (checked: any) => {
        form.setFieldValue('meetsEquipmentRegulations', checked);
    };

    return (
        <>
            <CardToolbox>
                <PageHeader title={t(titleKey, titleDescription)} />
            </CardToolbox>
            <Main>
                <BasicFormWrapper className="basic-form-inner">
                    <div className="atbd-form-checkout">
                        <Row gutter={25} justify="center">
                            <Col sm={24} xs={24}>
                                <Card>
                                    <Form
                                        form={form}
                                        name="request"
                                        requiredMark
                                        onFinish={onFinish}

                                    >
                                        <Row gutter={25}>
                                            <Col sm={8}>
                                                <Form.Item
                                                    name="name"
                                                    initialValue={companyData.name}
                                                    label={t('requests:create.company-name', 'Company Name')}
                                                    required>
                                                    <Input
                                                        required
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                                {!loggedAsCompany &&
                                                    <Form.Item
                                                        name="idNumber"
                                                        label={t('requests:create.id-number', 'ID Number')}
                                                        required
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('request:create-id-number-required-validation', 'ID Number is required'),
                                                            },
                                                            {
                                                                len: 13,
                                                                message: t('request:create-id-number-length-validation', 'ID Number should be Exact 13 characters'),
                                                            },
                                                        ]}>
                                                        <Input
                                                            suffix={
                                                                !loggedAsCompany &&
                                                                <FeatherIcon
                                                                    style={{ cursor: 'pointer' }}
                                                                    icon="search"
                                                                    size={14}
                                                                    onClick={() => searchForCompany()} />
                                                            }
                                                            required
                                                            maxLength={13}
                                                            disabled={loggedAsCompany}
                                                        />
                                                    </Form.Item>
                                                }
                                                <Form.Item
                                                    name="responsiblePersonFullName"
                                                    initialValue={companyData.responsiblePersonFullName}
                                                    label={t('requests:create.responsible-person', 'Responsible person (full name)')}
                                                    rules={[{
                                                        required: true, message: t(
                                                            "validations.responsible-person",
                                                            "Responsible person is required"
                                                        ),
                                                    }]}
                                                    required>
                                                    <Input
                                                        required
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="responsiblePersonFunction"
                                                    initialValue={companyData.responsiblePersonFunction}
                                                    label={t('requests:create.responsible-person-role', 'Responsible person function')}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: t(
                                                                "validations.responsible-person-function",
                                                                "Responsible person function is required"
                                                            ),
                                                        },
                                                    ]}
                                                    required
                                                >
                                                    <Input disabled={loggedAsCompany} />
                                                </Form.Item>
                                                <Form.Item
                                                    name="address"
                                                    initialValue={companyData.address}
                                                    label={t('global.address', 'Address')}>
                                                    <Input disabled={loggedAsCompany} />
                                                </Form.Item>
                                                <Form.Item
                                                    name="place"
                                                    initialValue={companyData.place}
                                                    label={t('global.place', 'Place')}>
                                                    <Input disabled={loggedAsCompany} />
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
                                                        value={companyData.municipalityId}
                                                        disabled={loggedAsCompany}
                                                        showSearch
                                                        filterOption={(input, option) =>
                                                            option!.props.children
                                                                ?.toLowerCase()
                                                                .indexOf(input?.toLowerCase()) >= 0
                                                        }
                                                        className="sDash_fullwidth-select"
                                                        style={{ color: "rgb(90, 95, 125)" }}
                                                        aria-required
                                                        onChange={onMunicipalityChange}
                                                    >
                                                        {municipalities &&
                                                            municipalities.map((item: MunicipalityDto) => (
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
                                                        value={companyData.cantonId}
                                                        className="sDash_fullwidth-select"
                                                        aria-required
                                                        style={{ color: "rgb(90, 95, 125)" }}
                                                        disabled
                                                    >
                                                        {cantons &&
                                                            cantons.map((item: CantonDto) => (
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
                                                        value={companyData.entityId}
                                                        className="sDash_fullwidth-select"
                                                        aria-required
                                                        style={{ color: "rgb(90, 95, 125)" }}
                                                        disabled
                                                    >
                                                        {stateEntities &&
                                                            stateEntities.map((item: StateEntityDto) => (
                                                                <Option key={item.id} value={item.id}>
                                                                    {item.name}
                                                                </Option>
                                                            ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col sm={8}>
                                                <Form.Item
                                                    required
                                                    name="taxNumber"
                                                    initialValue={companyData.taxNumber}
                                                    label={t('requests:create.tax-number', 'Tax Number')}
                                                    rules={[
                                                        {
                                                            len: 12,
                                                            message: t('request:create-tax-number-validation', 'Tax Number should be at Exact 12 characters'),
                                                        },
                                                    ]}>
                                                    <Input
                                                        required
                                                        disabled={loggedAsCompany}
                                                        maxLength={12} // Limit input length to 12 characters
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    initialValue={companyData.email}
                                                    name="email"
                                                    label="Company Email Address"
                                                    rules={[{ required: true, message: t('users.create:email-validation', 'Email is required'), pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i }]}
                                                    required
                                                >
                                                    <Input
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="phoneNumber"
                                                    initialValue={companyData.phoneNumber}
                                                    label={t('global.phone-number', 'Phone number')}>
                                                    <Input disabled={loggedAsCompany} />
                                                </Form.Item>
                                                <Form.Item
                                                    name="websiteUrl"
                                                    initialValue={companyData.websiteUrl}
                                                    label={t('global.website', 'Website url')}>
                                                    <Input disabled={loggedAsCompany} />
                                                </Form.Item>
                                                {(isRegistrationOfServiceCompany || isRegistrationOfImportersExporters || isRequestForLicenseExtension) && (
                                                    <Form.Item
                                                        name="areaOfExpertise"
                                                        label={t(
                                                            "global.select-areaOfExpertise",
                                                            "Select Area of Expertise"
                                                        )}
                                                        requiredMark
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t(
                                                                    "validations.select-area-of-experties",
                                                                    "Please select area of expertise"
                                                                ),
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            showSearch
                                                            filterOption={(input, option) =>
                                                                option!.props.children
                                                                    ?.toLowerCase()
                                                                    .indexOf(input?.toLowerCase()) >= 0
                                                            }
                                                            className="sDash_fullwidth-select"
                                                            style={{ color: "rgb(90, 95, 125)" }}
                                                            aria-required>
                                                            {Object.values(AreaOfExpertise).filter(value => typeof value === 'number').map((expertise) => {
                                                                const description = t(
                                                                    `requests:area-of-expertise.${expertise}`,
                                                                    AreaOfExpertiseDescriptions[expertise as AreaOfExpertise]);

                                                                if (typeof description !== 'string') {
                                                                    return null;  // or some other fallback
                                                                }

                                                                return (
                                                                    <Option key={expertise} value={expertise}>
                                                                        {description}
                                                                    </Option>
                                                                );
                                                            })}
                                                        </Select>
                                                    </Form.Item>
                                                )}
                                                {(isRegistrationOfServiceCompany || isRequestForLicenseExtension) && (
                                                    <Form.Item
                                                        name="businessActivityId"
                                                        required
                                                        label={t(
                                                            "global.business-activity",
                                                            "Business Activity"
                                                        )}
                                                        requiredMark
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t(
                                                                    "validations.business-activity",
                                                                    "Please select a Business Activity"
                                                                ),
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            value={companyData.businessActivityId}
                                                            className="sDash_fullwidth-select"
                                                            aria-required
                                                            style={{ color: "rgb(90, 95, 125)" }}
                                                        >
                                                            {businessActivities &&
                                                                businessActivities?.map((item: CodebookDto) => (
                                                                    <Option key={item.id} value={item.id}>
                                                                        {item.name}
                                                                    </Option>
                                                                ))}
                                                        </Select>
                                                    </Form.Item>
                                                )}
                                                {(isRegistrationOfServiceCompany || isRequestForLicenseExtension) && (
                                                    <>
                                                        <Form.Item
                                                            name="certificationNumbers"
                                                            label={t('requests:create-certificate-service-technicians', 'Certified service technicians')}
                                                            hasFeedback={certificateNumberValidity.checking}
                                                            validateStatus={!certificateNumberValidity.valid ? 'error' : certificateNumberValidity.checking ? 'validating' : undefined}
                                                            help={!certificateNumberValidity.valid
                                                                ? certificateNumberValidity.errorMessage
                                                                : certificateNumberValidity.checking
                                                                    ? t('requests:create-certificate-numbers-check-validity', 'Checking validity of {{dynamicValue}}', { dynamicValue: certificateNumbers.at(-1) })
                                                                    : undefined}
                                                        >
                                                            <TagInput>
                                                                <Tag
                                                                    animate
                                                                    onInsert={onNewCertificateAdded}
                                                                    data={certificateNumbersExpanded}
                                                                    lastTagValid={certificateNumberValidity.valid}
                                                                    isDoingServerCheck={certificateNumberValidity.checking}
                                                                    buttonLabel={t('requests:create-certificate-numbers-add', 'Click here to add certificate number and then press Enter.')}
                                                                />
                                                            </TagInput>
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="totalNumberOfServiceTechnians"
                                                            label={t('requests:create-total-service-technicians', 'Total number of service technians')}>
                                                            <Input type="number" />
                                                        </Form.Item>
                                                    </>
                                                )}
                                                <Form.Item
                                                    initialValue={companyData?.contactPersonFirstName}
                                                    name="contactPersonFirstName"
                                                    label={t('requests:create.contact-person-first-name', 'Contact Person First Name')}
                                                    required
                                                >
                                                    <Input
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    initialValue={companyData?.contactPersonLastName}
                                                    name="contactPersonLastName"
                                                    label={t('requests:create.contact-person-last-name', 'Contact Person Last Name')}
                                                    required
                                                >
                                                    <Input
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    initialValue={companyData.contactPersonEmail}
                                                    name="contactPersonEmail"
                                                    label={t('requests:create.contact-person-email', 'Contact Person Email')}
                                                    tooltip={t('requests:create.contact-person-email-to-login', 'This email will be used for logging into the app')}
                                                    rules={[{ required: true, message: t('users.create:email-validation', 'Email is required'), pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i }]}
                                                    required
                                                >
                                                    <Input
                                                        value={companyData.contactPersonEmail ?? ''}
                                                        disabled={loggedAsCompany}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col sm={8}>
                                                {(isRegistrationOfServiceCompany || isRegistrationOfImportersExporters || isRequestForLicenseExtension) && (
                                                    <Form.Item
                                                        name="companyType"
                                                        initialValue={companyData.type}
                                                        required
                                                        label={t(
                                                            "requests:create.company-type",
                                                            "Company Type"
                                                        )}
                                                        requiredMark
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t(
                                                                    "validations.select-company-type",
                                                                    "Please select company type"
                                                                ),
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            value={companyData.type as RequestCompanyType}
                                                            className="sDash_fullwidth-select"
                                                            aria-required
                                                            style={{ color: "rgb(90, 95, 125)" }}
                                                        >
                                                            {isRegistrationOfServiceCompany  && (
                                                                <>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_1}`} value={RequestCompanyType.NUMBER_1}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_1}}`, 'Company')}
                                                                    </Option>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_2}`} value={RequestCompanyType.NUMBER_2}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_2}}`, 'Entrepreneur')}
                                                                    </Option>
                                                                </>
                                                            )}
                                                              { isRequestForLicenseExtension && (
                                                                <>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_1}`} value={RequestCompanyType.NUMBER_1}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_1}}`, 'Company')}
                                                                    </Option>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_2}`} value={RequestCompanyType.NUMBER_2}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_2}}`, 'Entrepreneur')}
                                                                    </Option>
                                                                </>
                                                            )}
                                                            {isRegistrationOfImportersExporters && (
                                                                <>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_3}`} value={RequestCompanyType.NUMBER_3}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_3}}`, 'Importer')}
                                                                    </Option>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_4}`} value={RequestCompanyType.NUMBER_4}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_4}}`, 'Exporter')}
                                                                    </Option>
                                                                    <Option key={`company-type-${RequestCompanyType.NUMBER_5}`} value={RequestCompanyType.NUMBER_5}>
                                                                        {t(`requests:company-type.${RequestCompanyType.NUMBER_5}}`, 'Importer/Exporter')}
                                                                    </Option>
                                                                </>
                                                            )}
                                                        </Select>
                                                    </Form.Item>
                                                )}
                                                {(isRegistrationOfServiceCompany || isRegistrationOfImportersExporters) && !loggedAsCompany &&
                                                    (<>
                                                        <Form.Item
                                                            name="licenseId"
                                                            label={t('requests:create.license-id', 'License ID')}
                                                            required
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t("requests:create.license-id-validation", 'License ID is required'),
                                                                },
                                                                {
                                                                    message: t("requests:create.license-id-validation", 'License ID must be of XYZ-123 format'),
                                                                    pattern: /^[A-Z]{3}-\d{3}$/
                                                                }]}
                                                        >

                                                            <Input />
                                                        </Form.Item>
                                                        <Form.Item name="licenseDuration" label={t('requests:create.license-duration', 'License duration')} required={true} requiredMark={true}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: t(
                                                                        "requests:create.license-duration-validation",
                                                                        "License duration is required"
                                                                    ),
                                                                }]}>
                                                            <DatePickerWrapper>
                                                                <DatePicker
                                                                    onChange={(data) => onDateChange(data, 'licenseDuration')}
                                                                    aria-required={true}
                                                                    suffixIcon={<FeatherIcon icon="calendar" size={14} />}
                                                                    format={"DD.MM.YYYY"}
                                                                />
                                                            </DatePickerWrapper>
                                                        </Form.Item>
                                                    </>
                                                    )}
                                                {!loggedAsCompany && (
                                                    <Form.Item
                                                        name="status"
                                                        required
                                                        label={t(
                                                            "requests:create.status",
                                                            "Request status"
                                                        )}
                                                        requiredMark
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t(
                                                                    "validations.select-entity",
                                                                    "Please select status"
                                                                ),
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            className="sDash_fullwidth-select"
                                                            aria-required
                                                            style={{ color: "rgb(90, 95, 125)" }}
                                                        >
                                                            <Option key={`status-${RequestStatus.PENDING}`} value={RequestStatus.PENDING}>
                                                                {t(`requests:status.${RequestStatus.PENDING}`, 'Pending')}
                                                            </Option>
                                                            <Option key={`status-${RequestStatus.APPROVED}`} value={RequestStatus.APPROVED}>
                                                                {t(`requests:status.${RequestStatus.APPROVED}`, 'Approved')}
                                                            </Option>
                                                            <Option key={`status-${RequestStatus.REJECTED}`} value={RequestStatus.REJECTED}>
                                                                {t(`requests:status.${RequestStatus.REJECTED}`, 'Rejected')}
                                                            </Option>
                                                        </Select>
                                                    </Form.Item>
                                                )}
                                                <Form.Item
                                                    name="comments"
                                                    label={t('global.comment', 'Comment')}>
                                                    <TextArea
                                                        style={{ width: '100%' }}
                                                        rows={3}
                                                    />
                                                </Form.Item>
                                                    <Form.Item>
                                                        <Checkbox onChange={handleCheckboxChange} checked={true}>
                                                            {t("requests:details.has-needed-equipment-check",
                                                                "Has needed equipment according to the proper regulations")}
                                                        </Checkbox>
                                                    </Form.Item>
                                                <Form.Item
                                                    name="attachments"
                                                    label={t('requests:create.upload-attachments', 'Upload attachments')}
                                                    required>
                                                    <Upload
                                                        onChange={handleFileUpload}
                                                        onRemove={handleFileRemove}
                                                        beforeUpload={() => false}
                                                        multiple={true}>
                                                        <Btn className="btn-outlined" size="large" type="light" outlined>
                                                            <UploadOutlined /> {t('global.upload', 'Upload')}
                                                        </Btn>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={25} justify={'end'}>
                                            <div className="steps-action">
                                                <Button
                                                    className="btn-next"
                                                    type="primary"
                                                    htmlType="submit"
                                                    style={{ height: 50, padding: "10px 20px", marginRight: 15 }}
                                                    loading={isSubmitting}
                                                >
                                                    {t('requests:submit-button', 'Submit')}
                                                </Button>
                                                <Button
                                                    className="btn-next"
                                                    type="default"
                                                    disabled={isSubmitting}
                                                    htmlType="reset"
                                                    style={{ height: 50, padding: "10px 20px" }}
                                                >
                                                    {t('requests:create.cancel-button', 'Cancel')}
                                                </Button>
                                            </div>
                                        </Row>
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </BasicFormWrapper>
            </Main>
        </>
    );
}
