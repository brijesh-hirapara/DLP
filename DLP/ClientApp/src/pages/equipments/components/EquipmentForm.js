import { Button, Col, DatePicker, Divider, Form, Input, PageHeader, Popconfirm, Row, Select, Spin, Tooltip } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { CodebookApi, EquipmentsApi, RefrigerantTypesApi } from "api/api";
import { UploadOutlined } from '@ant-design/icons';
import { BasicFormWrapper } from "container/styled";
import FeatherIcon from 'feather-icons-react';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { CompanyBranchApi } from "api/clients/company-branch-api";
import moment from "moment";
import { base64ToFile, downloadFilesFromBase64 } from "utility/dowloadFiles";
import openNotificationWithIcon from "utility/notification";
import { useNavigate } from "react-router-dom";
import Alert from "components/alerts/alerts";
import { CodebookTypeEnum } from "api/models";
const { Option } = Select;

const equipmentsApi = new EquipmentsApi();
const companyBranchesApi = new CompanyBranchApi();
const codebooksApi = new CodebookApi();
const refrigerantTypeApi = new RefrigerantTypesApi();

export const EquipmentViewMode = {
    VIEW: 'VIEW',
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
}

const Loader = styled.div`
    display: flex; 
    height: 400px;
    width: ${props => props.readOnlyMode ? '800px !important' : '100%'}; 
    justify-content: center; 
    justifyItems: center; 
    align-items: center
`

const EquipmentForm = ({ mode, equipment, showArchiveButton = true }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [isSaving, setIsSaving] = useState();
    const [fileList, setFileList] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [branches, setBranches] = useState();
    const [codebooks, setCodebooks] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [refrigerantTypes, setRefrigerantTypes] = useState();

    const [showEquipmentOther, setShowEquipmentOther] = useState();
    const [showCoolingSystemOther, setShowCoolingSystemOther] = useState();

    const readOnlyMode = mode === EquipmentViewMode.VIEW;
    const isUpdateMode = mode === EquipmentViewMode.UPDATE;

    useEffect(() => {
        const mapEquipmentDetails = async () => {
            const { typeOfEquipmentId, typeOfEquipment, typeOfCoolingSystemId, typeOfCoolingSystemOther, typeOfEquipmentOther, refrigerantTypeId, massOfRefrigerantKg } = equipment;
            if (typeOfEquipment) {
                setCodebooks(prevState => {
                    if (prevState.TypeOfEquipment) {
                        prevState.TypeOfEquipment?.push({ id: typeOfEquipmentId, name: typeOfEquipment });
                        return prevState
                    } else {
                        return prevState
                    }
                })
            }
            equipment.typeOfCoolingSystemId = typeOfCoolingSystemId ?? (typeOfCoolingSystemOther ? -1 : null);
            equipment.typeOfEquipmentId = typeOfEquipmentId ?? (typeOfEquipmentOther ? -1 : null);
            equipment.dateOfPurchase = equipment.dateOfPurchase ? moment(equipment.dateOfPurchase) : '';
            equipment.commissioningDate = equipment.commissioningDate ? moment(equipment.commissioningDate) : '';
            equipment.yearOfProduction = equipment.yearOfProduction ? moment().year(equipment.yearOfProduction) : '';

            onRefrigerantChange(refrigerantTypeId);
            onChangeEquipmentType(equipment.typeOfEquipmentId);
            onChangeOfCoolingSystem(equipment.typeOfCoolingSystemId);
            onRefrigerantMassChange(massOfRefrigerantKg);

            setExistingFiles(equipment?.files?.map(file => ({ fileName: file.fileName })) ?? []);
            setFileList(readOnlyMode ? equipment?.files : equipment?.files.map(base64ToFile));

            form.setFieldsValue(equipment);
        }

        if (equipment) {
            mapEquipmentDetails();
        }
    }, [equipment, codebooks, refrigerantTypes, branches])


    const onRefrigerantChange = (id) => {
        const refrigerantType = refrigerantTypes?.find(x => x.id === id);
        form.setFieldValue('ashraeDesignation', refrigerantType?.ashraeDesignation);
        form.setFieldValue('globalWarmingPotential', refrigerantType?.globalWarmingPotential);
        form.setFieldValue('typeOfCoolingFluid', refrigerantType?.typeOfCoolingFluid);

        const gwp = form.getFieldValue('globalWarmingPotential');
        const value = form.getFieldValue('massOfRefrigerantKg');
        if(value){
        const CO2Equivalent = (value * gwp) / 1000;
        form.setFieldValue('CO2Equivalent', CO2Equivalent || 0);
        }
    }

    const onChangeEquipmentType = (type) => {
        setShowEquipmentOther(type === -1);
        if (type === -1) {
            form.setFieldValue('equipmentTypeOther', '');
        }
    }

    const onChangeOfCoolingSystem = (type) => {
        setShowCoolingSystemOther(type === -1);
        if (type === -1) {
            form.setFieldValue('coolingSystemOther', '');
        }
    }

    const onRefrigerantMassChange = (value) => {
        const gwp = form.getFieldValue('globalWarmingPotential');
        const CO2Equivalent = (value * gwp) / 1000;
        form.setFieldValue('CO2Equivalent', CO2Equivalent || 0);
    }

    useEffect(() => {
        const fetchCodebooks = async () => {
            const { data } = await codebooksApi.apiCodebookGet();
            setCodebooks(data);
        }

        const fetchRefrigerantTypes = async () => {
            const { data } = await refrigerantTypeApi.apiRefrigerantTypesGet({ pageSize: -1 });
            setRefrigerantTypes(data.items);
        }

        const fetchBranches = async () => {
            const response = await companyBranchesApi.apiCompanyBranchesGet({ pageSize: -1 });
            setBranches(response.data?.items);
        };

        const fetchAllData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchCodebooks(),
                fetchRefrigerantTypes(),
                fetchBranches()
            ]);

            setIsLoading(false);
        }

        fetchAllData();
    }, []);

    const onEquipmentSubmit = async (request) => {
        setIsSaving(true);
        request.dateOfPurchase = request.dateOfPurchase ? moment(request.dateOfPurchase, "DD.MM.yyyy").format("MM/DD/yyyy") : '';
        request.yearOfProduction = request.yearOfProduction ? moment(request.yearOfProduction, "DD.MM.yyyy").year() : '';
        request.commissioningDate = request.commissioningDate ? moment(request.commissioningDate, "DD.MM.yyyy").format("MM/DD/yyyy") : '';
        request.files = fileList;

        try {
            if (isUpdateMode) {
                request.id = equipment.id;
                request.existingFileNames = [...existingFiles].filter(x => !x.deleted).map(x => x.fileName);
                request.toBeDeletedFileNames = [...existingFiles].filter(x => x.deleted).map(x => x.fileName);
                await equipmentsApi.apiEquipmentsPut(request);
            } else {
                await equipmentsApi.apiEquipmentsPost(request);
            }

            openNotificationWithIcon(
                "success",
                isUpdateMode ? "Equipment Updated" : "Equipment Created",
                isUpdateMode
                    ? "Equipment's informations have been updated"
                    : "New Equipment has been successfully created!"
            );
            navigate("/equipments");
        } catch (err) {
            console.log(err)
            openNotificationWithIcon(
                "error",
                isUpdateMode ? "Equipment Update Failed" : "Equipment Creation Failed",
                isUpdateMode
                    ? "Equipment's informations failed to update"
                    : "New Equipment couldn't be created!"
            );
        } finally {
            setIsSaving(false);
        }
    }

    const handleOnArchive = async () => {
        try {
            await equipmentsApi.apiEquipmentsIdArchivePost({ id: equipment.id });
            openNotificationWithIcon("success", "Equipment Archived", "Equipment has been successfully archived!");
            navigate("/equipments");
        } catch (err) {
            openNotificationWithIcon("error", "Equipment Failed to Archive", "Equipment couldn't be archived at this moment!");
        }
    }

    return (
        <> {isLoading ? <Loader readOnlyMode={readOnlyMode}><Spin /> </Loader> :
            <BasicFormWrapper className="basic-form-inner" style={{ padding: 0, width: readOnlyMode ? 775 : undefined }}>
                {readOnlyMode && equipment?.isArchived && <Alert type={'warning'} message={'This equipmet was archived!'} />}
                <div className="atbd-form-checkout">
                    <Row justify="left">
                        <Col xs={24}>
                            <div className="create-account-form">
                                <Form
                                    form={form}
                                    name="register_equipment"
                                    requiredMark
                                    onFinish={onEquipmentSubmit}
                                >
                                    <Row gutter={60}>
                                        <Col span={12}>
                                            <Form.Item name="companyBranchId" label={t("equipments:branch-office-label", "Branch Office")}
                                                requiredMark
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: t(
                                                            "validations.select-branch",
                                                            "Please Select a Branch Office"
                                                        ),
                                                    },
                                                ]}>
                                                <Select
                                                    aria-required
                                                    disabled={readOnlyMode}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                      option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    placeholder={t("equipments:branch-office-placeholder", "Select a Branch Office")}>
                                                    {branches &&
                                                        branches?.map((item) => (
                                                            <Option key={item.id} value={item.id}>
                                                                {item.branchOfficeName}
                                                            </Option>))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                name="typeOfEquipmentId"
                                                label={t("equipments:type-of-equipment-label", "Type of Equipment")}
                                                requiredMark
                                                required
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: t(
                                                            "validations.select-equipment-type",
                                                            "Please Select Type of Equipment"
                                                        ),
                                                    },
                                                ]}>
                                                <Select
                                                      showSearch
                                                      filterOption={(input, option) =>
                                                        option.props.children
                                                          .toLowerCase()
                                                          .indexOf(input.toLowerCase()) >= 0
                                                      }
                                                    placeholder={t("equipments:type-of-equipment-placeholder", "Select a Type of Equipment")}
                                                    disabled={readOnlyMode}
                                                    onChange={onChangeEquipmentType} aria-required>
                                                    {codebooks['TypeOfEquipment'] &&
                                                        codebooks['TypeOfEquipment']?.map((item) => (
                                                            <Option key={item.id} value={item.id}>
                                                                {item.name}
                                                            </Option>))}
                                                    <Option key={'TypeOfEquipment-other'} value={-1}>
                                                        {t("equipments:other", "Other")}
                                                    </Option>
                                                </Select>

                                            </Form.Item>
                                            {showEquipmentOther &&
                                                <>
                                                    <Form.Item name="typeOfEquipmentOther" label={t("equipments:typeOfEquipment-label", "Type of Equipment (Other)")} >
                                                        <Input disabled={readOnlyMode} placeholder={t("equipments:typeOfEquipment-label", "Type of Equipment (Other)")} required />
                                                    </Form.Item>
                                                    <Divider />
                                                </>
                                            }
                                            <Form.Item
                                                name="typeOfCoolingSystemId"
                                                label={t("equipments:cooling-system-type-label", "Type of Cooling System")}>
                                                <Select
                                                    placeholder={t("equipments:cooling-system-type-placeholder", "Select a Cooling System Type")}
                                                    onChange={onChangeOfCoolingSystem}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                      option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    disabled={readOnlyMode}>
                                                    {codebooks['TypeOfCoolingSystem'] &&
                                                        codebooks['TypeOfCoolingSystem']?.map((item) => (
                                                            <Option key={item.id} value={item.id}>
                                                                {item.name}
                                                            </Option>))}
                                                    <Option key={'typeOfCoolingSystem-other'} value={-1}>
                                                        {t("equipments:other", "Other")}
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                            {showCoolingSystemOther &&
                                                <>
                                                    <Form.Item name="typeOfCoolingSystemOther" label={t("equipments:typeOfCoolingSystemOther-label", "Type of Cooling System (Other)")}>
                                                        <Input disabled={readOnlyMode} placeholder={t("equipments:typeOfCoolingSystemOther-label", "Type of Cooling System (Other)")} />
                                                    </Form.Item>
                                                    <Divider />
                                                </>
                                            }

                                            <Form.Item name="manufacturer" label={t("equipments:manufacturer-label", "Manufacturer")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:manufacturer-placeholder", "Manufacturer")} />
                                            </Form.Item>

                                            <Form.Item name="type" label={t("equipments:type-label", "Type")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:type-placeholder", "Type")} />
                                            </Form.Item>

                                            <Form.Item name="model" label={t("equipments:model-label", "Model")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:model-placeholder", "Model")} />
                                            </Form.Item>

                                            <Form.Item name="serialNumber" label={t("equipments:serial-number-label", "Serial Number")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:serial-number-placeholder", "Serial Number")} />
                                            </Form.Item>

                                            <Form.Item name="yearOfProduction" label={t("equipments:year-of-production-label", "Year of Production")} >
                                                <DatePicker
                                                    picker="year"
                                                    disabled={readOnlyMode}
                                                    placeholder={t("equipments:year-of-production-placeholder", "Year of Production")}
                                                />
                                            </Form.Item>

                                            <Form.Item name="dateOfPurchase" label={t("equipments:date-of-purchase-label", "Date of Purchase")}>
                                                <DatePicker
                                                    placeholder={t("equipments:date-of-purchase-placeholder", "Select Date of Purchase")}
                                                    format={"DD.MM.YYYY"}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="refrigerantTypeId"
                                                label={t("equipments:refrigerant-type-label", "Type of Refrigerant")}
                                                required
                                                requiredMark
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: t(
                                                            "validations.select-refrigerant-type",
                                                            "Please Select a Refrigerant Type"
                                                        ),
                                                    },
                                                ]}>
                                                <Select
                                                    placeholder={t("equipments:refrigerant-type-placeholder", "Select a Refrigerant Type")}
                                                    disabled={readOnlyMode}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                      option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    onChange={onRefrigerantChange}>
                                                    {refrigerantTypes &&
                                                        refrigerantTypes?.map((item) => (
                                                            <Option key={item.id} value={item.id}>
                                                                {item.name}
                                                            </Option>))}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item name="ashraeDesignation" label={t("equipments:ashrae-designation-label", "ASHRAE Refrigerant Designation")}>
                                                <Input placeholder={t("equipments:ashrae-designation-placeholder", "Autofilled")} disabled />
                                            </Form.Item>

                                            <Form.Item name="typeOfCoolingFluid" label={t("equipments:cooling-fluid-type-label", "Type of Cooling Fluid")}>
                                                <Input placeholder={t("equipments:cooling-fluid-type-placeholder", "Autofilled")} disabled />
                                            </Form.Item>
                                            <Form.Item name="globalWarmingPotential" label={t("equipments:gwp-label", "Global Warming Potential (GWP)")}>
                                                <Input disabled placeholder={t("equipments:gwp-placeholder", "Autofilled")} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>

                                            <Form.Item name="massOfRefrigerantKg" label={t("equipments:refrigerant-mass-label", "Mass of Refrigerant in the Device (kg)")} onChange={(e) => onRefrigerantMassChange(e.target.value)}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:refrigerant-mass-placeholder", "Mass of Refrigerant")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="CO2Equivalent" label={t("equipments:co2-equivalent-label", "CO2 Equivalent Tons")}>
                                                <Input placeholder={t("equipments:co2-equivalent-placeholder", "Autofilled")} disabled />
                                            </Form.Item>

                                            <Form.Item
                                                name="purposeOfEquipmentId"
                                                label={t("equipments:purpose-label", "Purpose of Equipment")}>
                                                <Select
                                                    disabled={readOnlyMode}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                      option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    placeholder={t("equipments:purpose-placeholder", "Select a Purpose")}>
                                                    {codebooks['EquipmentPurposes'] &&
                                                        codebooks['EquipmentPurposes']?.map((item) => (
                                                            <Option key={item.id} value={item.id}>
                                                                {item.name}
                                                            </Option>))}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item name="coolingTemperature" label={t("equipments:cooling-temperature-label", "Cooling Temperature (°C)")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:cooling-temperature-placeholder", "Cooling Temperature")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="coolingEffectKw" label={t("equipments:cooling-effect-label", "Cooling Effect (kW)")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:cooling-effect-placeholder", "Cooling Effect")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="compressorConnectionPowerKw" label={t("equipments:compressor-connection-power-label", "Compressor Connection Power (kW)")}>
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:compressor-connection-power-placeholder", "Compressor Connection Power")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="liquidCollectorVolume" label={t("equipments:liquid-collector-volume-label", "Liquid Collector Volume (L)")} >
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:liquid-collector-volume-placeholder", "Liquid Collector Volume")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="massAddedLastYearInKg" label={t("equipments:working-substance-mass-last-year-label", "Mass of Working Substance Added Last Year (kg)")} >
                                                <Input disabled={readOnlyMode} placeholder={t("equipments:working-substance-mass-last-year-placeholder", "Working Substance Mass Last Year")} type="number" />
                                            </Form.Item>

                                            <Form.Item name="commissioningDate" label={t("equipments:commissioning-date-label", "Commissioning Date")} >
                                                <DatePicker
                                                    disabled={readOnlyMode}
                                                    placeholder={t("equipments:commissioning-date-placeholder", "Select Commissioning Date")}
                                                    format={"DD.MM.YYYY"}
                                                />
                                            </Form.Item>

                                            <Form.Item name="comments" label={t("equipments:comments-label", "Comments")}>
                                                <Input.TextArea disabled={readOnlyMode} rows={3} placeholder={t("equipments:comments-placeholder", "Enter Comments")} />
                                            </Form.Item>
                                            {!readOnlyMode && <> <Form.Item>
                                                <Dragger fileList={fileList} beforeUpload={file => {
                                                    setFileList([...fileList, file]);
                                                    return false;
                                                }}
                                                    onRemove={file => {
                                                        if (isUpdateMode) {
                                                            setExistingFiles([...existingFiles].map(x => {
                                                                if (x.fileName.includes(file.name)) {
                                                                    x.deleted = true;
                                                                }
                                                                return x;
                                                            }));
                                                        }
                                                        const index = fileList.indexOf(file);
                                                        const newFileList = fileList.slice();
                                                        newFileList.splice(index, 1);
                                                        setFileList(newFileList);
                                                    }}>
                                                    <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                                    <p className="ant-upload-text">Click or drag file(s) to this area to upload</p>
                                                </Dragger>
                                            </Form.Item>
                                                <div className="steps-action">
                                                    <Button
                                                        className="btn-next"
                                                        type="primary"
                                                        loading={isSaving}
                                                        htmlType="submit"
                                                        style={{ height: 50, padding: "10px 20px", float: 'right' }}
                                                    >
                                                        <FeatherIcon icon="save" size={24} style={{ marginRight: 10 }} />
                                                        {isUpdateMode ? t("equipments:update-btn", "Update Equipment") : t("equipments:register-btn", "Register Equipment")}
                                                    </Button>
                                                </div>
                                            </>}
                                            {readOnlyMode && fileList?.length > 0 && <div style={{ marginBottom: 20 }}>
                                                <div>
                                                    <FeatherIcon icon="download-cloud" size={15} />{' '}
                                                    <span onClick={() => downloadFilesFromBase64(fileList)} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Download Files</span>
                                                </div>
                                            </div>}
                                            {showArchiveButton && readOnlyMode && !equipment?.isArchived && (
                                                <div>
                                                    {/* <Button style={{ height: 50, padding: "10px 20px", float: 'right' }} size="lg" type="danger" onClick={handleOnArchive}>
                                                        <FeatherIcon icon="archive" size={15} style={{ marginRight: 15 }} />{' '} {t("equipments:btn-archive-it", "Archive")}
                                                    </Button> */}

                                                    <Popconfirm
                                                        title={`${t(
                                                            "equipments:actions.send.confirmation.archive",
                                                            "Are you sure you want to archive",

                                                        )}`}
                                                        onConfirm={() => handleOnArchive()}
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <Tooltip title={t("equipments:btn-archive-it", "Archive")}>
                                                            <Button style={{ height: 50, padding: "10px 20px", float: 'right' }} size="lg" type="danger">
                                                                <FeatherIcon icon="archive" size={15} style={{ marginRight: 15 }} />{' '} {t("equipments:btn-archive-it", "Archive")}
                                                            </Button>
                                                        </Tooltip>
                                                    </Popconfirm>


                                                </div>)}
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </div>
            </BasicFormWrapper>}
        </>
    )
}

export default EquipmentForm;