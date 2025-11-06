import { BasicFormWrapper } from "container/styled";
import { Form, Input, PageHeader, Row, Col, Select } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { Button } from "components/buttons/buttons";
import { Main } from "container/styled";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import DataOnPurchasedSection from "pages/quantities-of-refrigerants/components/DataOnPurchasedSection";
import DataOnImportExportOfSubstances from "./DataOnImportExportOfSubstances";
import TextArea from "antd/lib/input/TextArea";
import { RegistersApi, ReportsApi, UsersApi } from "api/api";
import { Option } from "antd/lib/mentions";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import { OrganizationStatus } from "api/models";
import moment from "moment";
import openNotificationWithIcon from "utility/notification";

const userApi = new UsersApi();
const registersApi = new RegistersApi();
const reportsApi = new ReportsApi();


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

const SignatureArea = styled.div`
  margin-top: 32px;
`;

const SignatureLine = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ExplanationNotes = styled.div`
  margin-top: 32px;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f9f9f9;
  padding: 16px;
  border: 1px solid #ddd;
`;



const ViewMVTEOImportExportSubstances = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<any>(new Date().getFullYear());
    const [_municipalityId, setMunicipalityId] = useState(0);
    const [_entityId, setEntityId] = useState<any>(0);
    const [initialValues, setInitialValues] = useState<any>({});
    const [isCompanyActive, setIsCompanyActive] = useState(true);
    const [yearData, setYearData] = useState<number[]>([]);
    const [details, setDetails] = useState<any>({});
    const token = useDecodeJWT();
    const [organizationId,setOrganizationId] = useState<any>(token?.organizationId);
    const loginPerson = token?.fullName;
    const [responsiblePerson,setResponsiblePerson] = useState<any>(loginPerson);
    const newDate = new Date();
    const submitedDateModify = moment(newDate).format("MM.DD.yyyy");
    const [dataOnAcquired, setDataOnAcquired] = useState<any>({});
    const [editData, setEditData] = useState<any>();
    const navigate = useNavigate();
    const { id } = useParams();
    const [editMode, setEditMode] = useState(false);
    // Destructure other properties from commonData
    const {
        cantons = [],
        stateEntities = [],
        isLoading: loadingCommonData = false,
    }: {
        cantons?: any[];
        stateEntities?: any[];
        isLoading?: boolean;
    } = {};


    const handleDataFromChild = (data: any) => {
        // Handle data received from the child component
        // Update state with the received data
        setDataOnAcquired(data);
    };


    const handleYearChange = (value: any) => {
        // Check if the value is defined and has the 'value' property
        if (value && value.value) {
            // Access the 'value' property safely
            const selectedYear = value.value;

        } else {
            // Handle the case where the value or value.value is undefined
            console.error("Invalid year value:", value);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDataById();
            setEditMode(true);
        }
    }, [id])

    useEffect(()=>{
        fetchYear();
    },[])


    const fetchYear = async () => {
        try {
            setLoading(true);
            const response = await registersApi.apiYearImportExportGet();

            if (response.data && Array.isArray(response.data.year)) {
                setYearData(response.data.year);
            } else {
                console.error('Fetched data is not in expected format', response.data);
                setYearData([]); // Ensure `yearData` is set to an empty array if the format is incorrect
            }
        } catch (error) {
            console.error('Error fetching year data:', error);
            setYearData([]); // Ensure `yearData` is set to an empty array if there is an error
        } finally {
            setLoading(false);
        }
    };


    const fetchDataById = async () => {
        try {
            setLoading(true);
            const { data } = await reportsApi.apiAnnualReportOnImportExportSubstancesGetById({ id: id as string });
            setEditData(data?.importExportSubstancesAnnualReport);
            setOrganizationId(data?.organizationId);
            setResponsiblePerson(data.responsiblePerson);
            form.setFieldsValue(data)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await registersApi.apiRegistersIdGet({ id: organizationId as string });
                setIsCompanyActive(response.data.status === OrganizationStatus.NUMBER_1);
                setDetails(response.data);
                const {
                    companyName,
                    companyIdNumber,
                    companyPhoneNumber,
                    companyEmail,
                    companyMunicipality,
                    companyCanton,
                    companyEntity,
                    companyContactPerson,
                    // Add other fields here...
                } = response.data;

                // Set initial values for form fields
                setInitialValues({
                    companyName,
                    companyIdNumber,
                    companyPhoneNumber,
                    companyEmail,
                    companyMunicipality,
                    companyCanton,
                    companyEntity,
                    companyContactPerson,
                    // Add other fields here...
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (organizationId)
            fetchDetails();
    }, [organizationId]);


    useEffect(() => {
        if (details) {
            form.setFieldsValue({
                companyName: details.companyName,
                registrationNumber: details.companyIdNumber,
                companyPhoneNumber: details.companyPhoneNumber,
                companyEmail: details.companyEmail,
                companyMunicipality: details.companyMunicipality,
                companyCanton: details.companyCanton,
                companyEntity: details.companyEntity,
                companyContactPerson: details.companyContactPerson,
                companyAddress: details.companyAddress,
                submitedDate: new Date(),
                responsiblePerson:responsiblePerson
                // Add other fields here...
            });
        }
    }, [details]);



    const handleSubmit = async (values: any) => {
        try {
            // Extract form values
            const {
                year,
                companyContactPerson,
                submitedDate,
                companyMunicipality,
                companyCanton,
                companyEntity,
                refrigerantData,
            } = values;

            // Prepare the form data object
            const formData = {
                id: id || "",
                year: year || 0, // Set default value if year is undefined
                responsiblePerson: responsiblePerson || "", // Set default value if companyContactPerson is undefined
                submitedDate: submitedDate,
                organizationId: organizationId || "", // Assuming organizationId is already defined
                userId: organizationId || "", // Assuming userId is retrieved from the token
                importExportSubstancesAnnualReport: dataOnAcquired.map((item: any) => ({
                    refrigerantTypeId: item.refrigerantTypeId,
                    refrigerantTypeName: item.refrigerantTypeName, // Set default value if purchased quantity is undefined
                    refrigerantTypeASHRAEDesignation: item.refrigerantTypeASHRAEDesignation, // Set default value if collected quantity is undefined
                    refrigerantTypeChemicalFormula: item.refrigerantTypeChemicalFormula , // Set default value if renewed quantity is undefined
                    tariffNumber: item.tariffNumber || 0, // Set default value if sold quantity is undefined
                    import: item.import || 0, // Set default value if used1 quantity is undefined
                    ownConsumption: item.ownConsumption || 0, // Set default value if used2 quantity is undefined
                    salesOnTheBiHMarket: item.salesOnTheBiHMarket || 0, // Set default value if used3 quantity is undefined
                    totalExportedQuantity: item.totalExportedQuantity || 0, // Set default value if used4 quantity is undefined
                    // stateoOfSubstance: item.stateoOfSubstance || "", // Set default value if stateoOfSubstance is undefined
                    stockBalanceOnTheDay: item.stockBalanceOnTheDay || 0,
                    endUser: item.endUser || "", // Set default value if stockBalance is undefined
                })),
            };
            if (id) {
                const dataId = id;
                const { data } = await reportsApi.apiAnnualReportOnImportExportSubstancesIdPut({ id: dataId, updateUserCommand: formData });
                // Log the prepared form data
                openNotificationWithIcon(
                    "success",
                    t("annual-report-on-import-export-substances.success.update", "Annual Report On Import Export Substances Update successfully")
                );
                navigate("/reports/annual-report-on-import-export-substances");

            } else {
                const { data } = await reportsApi.apiImportExportSubstancesReportPost(formData);
                // Log the prepared form data
                openNotificationWithIcon(
                    "success",
                    t("annual-report-on-import-export-substances.success.add", "Annual Report On Import Export Substances Add successfully")
                );
                navigate("/reports/annual-report-on-import-export-substances");
            }

        } catch (error) {
            // Handle API call errors
            console.error("API error:", error);

            // Display an error message to the user
            openNotificationWithIcon(
                "error",
                t("annual-report-on-import-export-substances.error.api", "An error occurred while processing the request. Please try again later.")
            );
        }
    };

    return (
        <>
            <PageHeader
                ghost
                title={t("side-bar:reports.annual-report-import-export-of-ozone-depleting-substance", "Annual Report On Import/Export Of Ozone Depleting Substance")}
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
                                                        {t('form:general-data-on-importer-exporter-substances', 'General data on importer/exporter of substances')}
                                                    </th>
                                                </tr>
                                                <th>
                                                    <Form.Item
                                                        label={t("global.year", "Year")}
                                                        name="year"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t("validation:please-select-year", "Please select a year"),
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            showSearch
                                                            placeholder={t("global.year", "Year")}
                                                            // value={selectedYear}
                                                            disabled={true}
                                                            onChange={handleYearChange}
                                                            filterOption={(input: any, option: any) =>
                                                                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                            }
                                                        // Set disabled to true to disable the field
                                                        >
                                                            {yearData.map((year: any) => (
                                                                <Option key={year} value={year}>
                                                                    {year}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </th>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.company-name-of-imp-exp-of-sub", "Company name of importer/exporter of substances:")}
                                                            name="companyName"
                                                           
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.identification-number-of-the-imp-exp", "Identification number of the importer/exporter:")}
                                                            name="companyPhoneNumber"
                                                          
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={3}>
                                                        <Form.Item
                                                            label={t("global.address-place-street-number", "Address: (place, street, number)")}
                                                            name="companyAddress"
                                                            
                                                        >
                                                            <TextArea disabled={true} />
                                                        </Form.Item>
                                                    </td>

                                                </tr>
                                                <tr>

                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.phone", "Tel / Тел")}
                                                            name="companyPhoneNumber"
                                                            
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.fax", "Fax / Факс")}
                                                            name="companyFax"
                                                          
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.email", "Email / Емаил")}
                                                            name="companyEmail"
                                                            
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.authorized-person", "Name and surname of authorized person")}
                                                            name="companyContactPerson"
                                                           
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </StyledTable>
                                        <DataOnImportExportOfSubstances viewMode={false} editData={editData} onDataReceived={handleDataFromChild}/>
                                        <SignatureArea>
                                            <SignatureLine>
                                            <span>
                                                    <Form.Item
                                                        label={t("global.y", "Y")}
                                                        name="submitedDate"
                                                        className="d-none"
                                                        initialValue={submitedDateModify}
                                                    >
                                                        <Input disabled={true} />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={t("global.y", "Y")}
                                                        name="submitedDateModify"

                                                        initialValue={submitedDateModify}
                                                    >
                                                        <Input disabled={true} />
                                                    </Form.Item>
                                                </span>
                                                <span>М. П. </span>
                                                <div>

                                                    <span>
                                                        <Form.Item
                                                            label={t("global.responsible-person-firstname-lastname", "Responsible person (First and last name)")}
                                                            name="responsiblePerson"
                                                           initialValue={responsiblePerson}
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </span>
                                                    <br />

                                                </div>
                                            </SignatureLine>
                                        </SignatureArea>
                                        <ExplanationNotes>
                                        <h5>{t("data-on-import-export-substances-for-year.title", 'Data on import/export of substances for the year')}</h5> <br />
 <p>{t("data-on-import-export-substances-for-year-paragraph1.title", '(1) Data are entered according to the terminology and labels of substances, listed in Annex 1 of this regulation.')}</p>
 <p>
 {t("data-on-import-export-substances-for-year-paragraph2.title", '(2) Data on the end user of the sold substances include: name of legal entity / entrepreneur, address, contact phone. Note: Certified detailed specifications of imported quantities of substances, by imported ones, are attached to the Report contingents (with data for each contingent: bill of lading number, customs declaration number and date customs clearance), types of substances that damage the ozone layer, substitute substances and their users (own consumption and/or sales to production and service organizations on the market of Bosnia and Herzegovina) i the amount of substances that damage the ozone layer and substitute substances remaining and stored by the importer (inventories) on 31 December of the previous (reporting) year.')}
 </p>


                                        </ExplanationNotes>
                                        <div className="setting-form-actions float-end">
                                           
                                                <Button htmlType="button" className="ms-2" type="light" onClick={()=>{navigate(-1)}}>
                                                    {t("cancel:button", "Cancel")}
                                                </Button>
                                           
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

export default ViewMVTEOImportExportSubstances;
