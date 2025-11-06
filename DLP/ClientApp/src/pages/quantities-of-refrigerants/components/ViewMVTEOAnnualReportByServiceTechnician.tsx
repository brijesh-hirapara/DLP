import { BasicFormWrapper } from "container/styled";
import { Form, Input, PageHeader, Row, Col, Select } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { Button } from "components/buttons/buttons";
import { Main } from "container/styled";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import DataOnPurchasedSection from "pages/quantities-of-refrigerants/components/DataOnPurchasedSection";
import TextArea from "antd/lib/input/TextArea";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import { Option } from "antd/lib/mentions";
import { RegistersApi, ReportsApi, UsersApi } from "api/api";
import openNotificationWithIcon from "utility/notification";

import { OrganizationStatus } from "api/models";
import moment from "moment";
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
interface CommonData {
    municipalities: any;
    cantons: any;
    stateEntities: any;
    isLoading: boolean;
}

// Assume commonData is defined somewhere
const commonData: any = {
    municipalities: [], // Add actual data here
    cantons: [], // Add actual data here
    stateEntities: [], // Add actual data here
    isLoading: false, // Add actual data here
};




// const generateYearOptions = (): number[] => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let year = currentYear - 1; year >= 2021; year--) {
//         years.push(year);
//     }
//     return years;
// };


const ViewMVTEOAnnualReportByServiceTechnician = () => {
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
    const [editData,setEditData] =  useState<any>();
    const navigate = useNavigate();
    const {id} = useParams();
    const [editMode,setEditMode]=useState(false);
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
        if(id){
            fetchDataById();
            setEditMode(true);
        }
    },[id])

    useEffect(()=>{
        fetchYear();
    },[])


    const fetchYear = async () => {
        try {
            setLoading(true);
            const response = await registersApi.apiYearGet();

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
            const { data } = await reportsApi.apiReportsTechniciansByTrainingCenterGetById({ id: id as string });
            setEditData(data?.serviceTechnicianAnnualReport);
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
            id:id || "",
            year: year || 0, // Set default value if year is undefined
            responsiblePerson: companyContactPerson || "", // Set default value if companyContactPerson is undefined
            submitedDate: submitedDate,
            organizationId: organizationId || "", // Assuming organizationId is already defined
            userId: organizationId || "", // Assuming userId is retrieved from the token
            serviceTechnicianAnnualReport: dataOnAcquired.map((item: any) => ({
                refrigerantTypeId: item.refrigerantTypeId,
                purchased: item.purchased || 0, // Set default value if purchased quantity is undefined
                collected: item.collected || 0, // Set default value if collected quantity is undefined
                renewed: item.renewed || 0, // Set default value if renewed quantity is undefined
                sold: item.sold || 0, // Set default value if sold quantity is undefined
                used1: item.used1 || 0, // Set default value if used1 quantity is undefined
                used2: item.used2 || 0, // Set default value if used2 quantity is undefined
                used3: item.used3 || 0, // Set default value if used3 quantity is undefined
                used4: item.used4 || 0, // Set default value if used4 quantity is undefined
                // stateoOfSubstance: item.stateoOfSubstance || "", // Set default value if stateoOfSubstance is undefined
                stateOfSubstanceId:item.stateOfSubstanceId || "",
                stockBalance: item.stockBalance || "", // Set default value if stockBalance is undefined
            })),
        };
        if(id){
            const dataId = id;
            const { data } = await reportsApi.apiReportsTechniciansByIdPut({id: dataId, updateUserCommand: formData});
            // Log the prepared form data
            openNotificationWithIcon(
                "success",
                t("annual-report-on-import-export-substances.success.update", "Annual Report By Service Technician Update successfully")
            );
            navigate("/reports/annual-report-service-technician");

        }else{
            const { data } = await reportsApi.apiAnnualReportByServiceTechnicianPost(formData);
        // Log the prepared form data
        openNotificationWithIcon(
            "success",
            t("annual-report-by-service-technician.success.add", "Annual Report By Service Technician Add successfully")
        );
        navigate("/reports/annual-report-service-technician");
        }
        

    };

    return (
        <>
            <PageHeader
                ghost
                title={t("side-bar:reports.annual-report-on-collected-substances", "Annual Report On Collected Substances")}
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
                                                            label={t("global.name-of-legal-entity", "Name of legal entity or entrepreneur")}
                                                            name="companyName"

                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.registration-number", "Registration number")}
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
                                                            label={t("global.phone", "Tel")}
                                                            name="companyPhoneNumber"

                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.fax", "Fax")}
                                                            name="fax"

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
                                                            label={t("global.municipality", "Municipality:")}
                                                            name="companyMunicipality"

                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.canton", "Kanton / Canton")}
                                                            name="companyCanton"

                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <Form.Item
                                                            label={t("global.entity", "Entitet / Entity")}
                                                            name="companyEntity"

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
                                        <DataOnPurchasedSection viewMode={false} editData={editData} onDataReceived={handleDataFromChild} />
                                        <SignatureArea>
                                            <SignatureLine>
                                                <span>
                                                    <Form.Item
                                                        label={t("global.u/y", "U / У")}
                                                        name="submitedDate"
                                                        className="d-none"  
                                                        initialValue={submitedDateModify}
                                                    >
                                                        <Input disabled={true} />
                                                    </Form.Item>
                                                    <Form.Item
                                                        label={t("global.u/y", "U / У")}
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
                                        <h5>{t("data-on-acquired-used-substances.title", 'Data on acquired/used substances for')}</h5>
                                        <br />
<p>{t("data-on-acquired-used-substances-paragraph1.title", '(*) Quantities used in the reporting year (kg) for / Quantities used in the reporting year (kg) for:')}</p>
<p>{t("data-on-acquired-used-substances-paragraph2.title", '(1) Charging/Recharging of Refrigeration and Air Conditioning Equipment and Heat Pumps / Charging/Recharging of Refrigeration and Air Conditioning Equipment and Heat Pumps')}</p>
<p>{t("data-on-acquired-used-substances-paragraph3.title", '(**) Condition of the substance: a) used for the first time; b) collected; c) collected and renewed / Condition of the substance: a) used for the first time; b) collected; c) collected and restored')}</p>

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

export default ViewMVTEOAnnualReportByServiceTechnician;
