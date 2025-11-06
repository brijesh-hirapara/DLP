import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Row,
    Col,
    Form,
    Input,
    Select,
    Button,
    DatePicker,
    Alert,
} from "antd";
import FeatherIcon from "feather-icons-react";
import Heading from "../../../components/heading/heading";
import { BasicFormWrapper } from "../../../container/styled";
import { UploadOutlined } from '@ant-design/icons';
import { CodebookTypeEnum } from "api/models";
import Dragger from "antd/lib/upload/Dragger";
import { CodebookApi } from "api/api";
import { useTranslation } from "react-i18next";
import { base64ToFile } from "utility/dowloadFiles";
import moment from "moment";
const { Option } = Select;

const codebooksApi = new CodebookApi();

export const QualificationViewMode = {
    VIEW: 'VIEW',
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
}

const QualificationForm = ({ form, disabled, mode, files = [], title, onFinish, finishText = 'Complete Registration', hideTitle = false, isSaving, onOtherButtonClick, otherButtonText = 'Go Back' }) => {
    const [fileList, setFileList] = useState([]);
    const [qualificationTypes, setQualificationTypes] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const { t } = useTranslation();

    const isUpdateMode = mode === QualificationViewMode.UPDATE;

    const handleOnFinish = (data) => {
        data.files = fileList;
        if (isUpdateMode) {
            data.existingFileNames = [...existingFiles].filter(x => !x.deleted).map(x => x.fileName);
            data.toBeDeletedFileNames = [...existingFiles].filter(x => x.deleted).map(x => x.fileName);
        }
        
        onFinish(data);
    }

    useEffect(() => {
        if (mode === QualificationViewMode.UPDATE) {
            setExistingFiles(files?.map(file => ({ fileName: file.fileName })) ?? []);
            setFileList(files.map(base64ToFile));
        }
    }, [mode])

    const disabledDate = (current) => {
        // Can not select days before Date of Exam and today
        const dateOfExam = form.getFieldValue('dateOfExam');
        const threeMonthsAfterExam = moment(dateOfExam).add(3, 'months').startOf('day');

        return current && (current < moment().startOf('day') || current < threeMonthsAfterExam);
    };

    useEffect(() => {
        const fechQualifications = async () => {
            const { data: { items } } = await codebooksApi.apiCodebookByTypeGet({
                type: CodebookTypeEnum.TypeOfQualifications
            })
            setQualificationTypes(items);
        }

        fechQualifications();

    }, []);

    const onDateChange = (date, key) => {
        form.setFieldValue(key, date);
    };

    return (<BasicFormWrapper className="basic-form-inner">

        <div className="atbd-form-checkout">
            <Row justify="center">
                <Col xs={24}>
                    {disabled && <Alert type="error" banner={true} message={<strong>Locked Qualification!</strong>}
                        description="This qualification is already in use by a Service Company or Equipment Activity therefore can't be updated!"
                        closeText="Go back" onClose={onOtherButtonClick} />}

                    <div className="create-account-form">

                        {!hideTitle && <Heading as="h4" >
                            {title ?? 'Add Qualification'}
                        </Heading>}
                        <Form
                            form={form}
                            name="qualifications"
                            requiredMark
                            onFinish={handleOnFinish}
                        >
                            <Form.Item name="certificateNumber" required label="Certificate Number">
                                <Input
                                    placeholder="Certificate Number*"
                                    required
                                    disabled={disabled}
                                    prefix={<FeatherIcon icon="hash" size={14} />}
                                />
                            </Form.Item>
                            <Form.Item
                                name="qualificationTypeId"
                                required
                                label={t(
                                    "global.qualification-type",
                                    "Qualification Type"
                                )}
                                requiredMark
                                rules={[
                                    {
                                        required: true,
                                        message: t(
                                            "validations.qualification-type",
                                            "Please select Qualification Type"
                                        ),
                                    },
                                ]}
                            >
                                <Select
                                    className="sDash_fullwidth-select"
                                    aria-required
                                    disabled={disabled}
                                    onChange={e => console.log(e, '<==')}
                                    style={{ color: "rgb(90, 95, 125)" }}
                                >
                                    {qualificationTypes &&
                                        qualificationTypes?.map((item) => (
                                            <Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>
                            <Row justify="spaces-between">
                                <Form.Item name="dateOfExam" label="Date of Exam" required={true} requiredMark={true}
                                    rules={[
                                        {
                                            required: true,
                                            message: t(
                                                "certified-technicans.date-ofexam",
                                                "Certificate Date of Exam is required"
                                            ),
                                        }]}>
                                    <DatePicker
                                        onChange={(data) => onDateChange(data, 'dateOfExam')}
                                        disabled={disabled}
                                        aria-required={true}
                                        suffixIcon={<FeatherIcon icon="calendar" size={14} />}
                                        aria-placeholder="Date of Exam"
                                        format={"DD.MM.YYYY"}
                                    />
                                </Form.Item>
                                <Form.Item style={{ marginLeft: 15 }} name="certificateDuration" label="Valid to Date" required={true} requiredMark={true}
                                    rules={[
                                        {
                                            required: true,
                                            message: t(
                                                "certified-technicans.valid-to-date-required",
                                                "Certificate Valid-To Date is required"
                                            ),
                                        }
                                    ]}>
                                    <DatePicker
                                        disabled={disabled}
                                        onChange={(data) => onDateChange(data, 'certificateDuration')}
                                        suffixIcon={<FeatherIcon icon="calendar" size={14} />}
                                        aria-required={true}
                                        disabledDate={disabledDate}
                                        aria-placeholder="Valid to Date"
                                        format={"DD.MM.YYYY"}
                                    />
                                </Form.Item>
                            </Row>

                            <Form.Item required rules={[
                                {
                                    required: true,
                                    disabled: disabled,
                                    message: t(
                                        "certified-technicans.attachments",
                                        "Please upload the certificate attachment"
                                    ),
                                }]}>
                                <Dragger disabled={disabled} fileList={fileList} beforeUpload={file => {
                                    setFileList([...fileList, file]);
                                    return false;  // prevent auto uploading
                                }}
                                    onRemove={file => {
                                        if (isUpdateMode){ 
                                            let $files = [...existingFiles];

                                            setExistingFiles($files.map(x => {
                                                if (x.fileName.includes(file.name)){
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

                            <div
                                className="steps-action"
                                style={{ display: "flex", gap: 20 }}
                            >
                                {onOtherButtonClick && <Button
                                    type="default"
                                    style={{ height: 50, padding: "10px 20px" }}
                                    onClick={onOtherButtonClick}
                                >
                                    {otherButtonText}{" "}
                                </Button>}
                                <Button
                                    className="btn-next"
                                    type="primary"
                                    loading={isSaving}
                                    htmlType="submit"
                                    disabled={!fileList.length || disabled}
                                    style={{ height: 50, padding: "10px 20px" }}
                                >
                                    {finishText} {' '}
                                    <FeatherIcon icon="check" size={16} />
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    </BasicFormWrapper>)
}

export default QualificationForm;