import { Button, Checkbox, Divider, Form, Input, Modal, Select } from "antd"
import { CertifiedTechniciansApi } from "api/api";
import { ButtonStyled } from "components/buttons/styled";
import { AddProfile, BasicFormWrapper } from "container/styled"
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import FeatherIcon from "feather-icons-react";
import { t } from "i18next"
import { useContext, useState } from "react";
import openNotificationWithIcon from "utility/notification";

const techniciansApi = new CertifiedTechniciansApi();

const SearchCompanyTechnicianModal = ({ onCancel, onFinish }) => {
    const [form] = Form.useForm();
    
    const [technician, setTechnician] = useState();
    const [showInvalidLicenseNumber, setShowInvalidLicenseNumber] = useState();

    const handleOnCancel = () => {
        onCancel();
    }

 
    const handleOnFetchTechnicianDetails = async () => {
        if (technician) {
            setTechnician(null);

        } else {
            try {
                const serialNumber = form.getFieldValue("technicianCertificateNumber");
                const { data } = await techniciansApi.apiCertifiedTechniciansBySerialNumberSerialNumberGet({
                    serialNumber: serialNumber
                });
                 
                setShowInvalidLicenseNumber(!data);
                if (data) {
                    form.setFieldsValue(data);
                    setTechnician(data);
                }

                
            } catch (err) {
                console.log(err)
            }
        }
    }
    const handleSubmit = async () => {

        try {

            await techniciansApi.apiCertifiedTechniciansIdRecordEmploymentPost({
                id: technician.id,
                recordEmploymentDto: {
                    startDate: ''
                }
            })

            openNotificationWithIcon("success", `${t("company-technicians.modal.success", "Technician Added Successfully")}` , `${t("company-technicians.modal.success-subtext", "Technician is added successfully to your company")}`);
            onFinish();
        } catch (e) {

            openNotificationWithIcon("error", `${t("company-technicians.modal.failed", "Failed to Add")}` , `${t("company-technicians.modal.failed-subtext", "Couldn't add technician to the company! Please try again later")}`);
            console.log(e)
        }
 
    }

    return (
        <Modal

            title={t("company-technicians.modal.title", "Add Technician")}
            open={true}
            footer={null}
            onCancel={handleOnCancel}
        >
            <div className="project-modal">
                <AddProfile>
                    <BasicFormWrapper>
                        <Form 
                        form={form}
                        name="company-technicians"
                        requiredMark>

                            <Form.Item name="technicianCertificateNumber" label={t("equipment-activities:technician-license-number", "Technician License Number")} >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex' }}>
                                        <Input placeholder={t("company-technicians:technician-license-number-placeholder", "Technician License Number")} disabled={technician} />
                                        <ButtonStyled style={{ height: 50, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -4 }} type={`${technician ? 'light' : 'primary'}`} onClick={handleOnFetchTechnicianDetails}>
                                            <FeatherIcon icon={`${technician ? 'x' : 'search'}`} size={20} /> &nbsp; {!technician ? t("company-technicians:search", "Search") : t("company-technicians:clear", "Clear")}
                                        </ButtonStyled>
                                    </div>
                                    <div>
                                        {showInvalidLicenseNumber && <div><span style={{ color: 'red' }}>{t("company-technicians:invalid-license-number", "This license number isn't assigned to any available Technicians")}</span></div>}
                                    </div>
                                </div>
                            </Form.Item>
                            {technician ? (
                                <div>
                                    <div>{t("company-technicians:fullName", "Full Name")}: <strong>{technician?.firstName} {technician?.lastName}</strong></div>
                                    <div>{t("company-technicians:personalNumber", "Personal Number")}: <strong>{technician?.personalNumber}</strong></div>
                                    <div>{t("company-technicians:email", "Email")}: <strong>{technician?.email}</strong></div>
                                    <div>{t("company-technicians:municipality", "Municipality")}: <strong>{technician?.municipality}</strong></div>
                                    <div>{t("company-technicians:address", "Address")}: <strong>{technician?.address}</strong></div>
                                    <div>{t("company-technicians:placeOfBirth", "Place of Birth")}: <strong>{technician?.placeOfBirth}</strong></div>
                                    <div>{t("company-technicians:comments", "Comments")}: <strong>{technician?.comments}</strong></div>

                                    <Divider />

                                    <ButtonStyled style={{ height: 50, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -4, width: '100%' }} type={'primary'} onClick={handleSubmit}>
                                            <FeatherIcon icon={'check'} size={30} />  {t("company-technicians:claim", "Claim Technician")}
                                    </ButtonStyled>
                                </div>
                            ): null}
                        </Form>

                    </BasicFormWrapper>
                </AddProfile>
            </div>
        </Modal>
    )
}

export default SearchCompanyTechnicianModal;