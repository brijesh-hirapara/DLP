import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Form,
    Card,
    PageHeader,
    Row,
    Col,
    Spin,
} from "antd";
import { WizardWrapper, WizardFour } from "../style";
import { Steps } from "../../components/steps/steps";
import openNotificationWithIcon from "utility/notification";
import { useNavigate, useParams } from "react-router-dom";
import { CertifiedTechniciansApi } from "api/api";
import { useTranslation } from "react-i18next";
import TechnicianProfile from "./components/TechnicianProfile";
import { CardToolbox, Main } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import styled from "styled-components";
import TechnicianQualifications from "./components/TechnicianQualifications";
import { ClickableSteps } from "components/steps/customSteps";

const techniciansApi = new CertifiedTechniciansApi();

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 250px;
`;

function UpdateTechnicianPage() {
    const commonData = useContext(CommonDataContext);
    const { municipalities, isLoading: loadingCommonData } = commonData;
    const [isLoading, setIsLoading] = useState();
    const [currentStep, setCurrentStep] = useState(0);

    const params = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const fetchTechnicianData = async () => {
            const { data } = await techniciansApi.apiCertifiedTechniciansIdGet({ id: params.id })
            const municipality = municipalities.find((item) => item.id == data.municipalityId);
            form.setFieldsValue({ ...data, cantonId: municipality?.cantonId, stateEntityId: municipality?.stateEntityId });
            setIsLoading(false);
        }

        if (params.id) {
            fetchTechnicianData();
        }
    }, [params.id])

    const onFinish = async (data) => {
        setIsSaving(true);
        try {
            const response = await techniciansApi.apiCertifiedTechniciansIdPut({
                id: params.id,
                updateUserCommand: { ...data, id: params.id, isCertifiedTechnician: true }
            });
            if (response.status === 200) {
                navigate("/registers/certified-technicians");
                openNotificationWithIcon("success", "Technician is Updated", "Technician's informations have been updated");
            }
        } catch (err) {
            openNotificationWithIcon("error", "Update Failed!", "Technician couldn't be updated!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <CardToolbox>
            <PageHeader title={t('certified-technicians:update', "Update Service Technician")} />
            </CardToolbox>
            {isLoading || loadingCommonData ? <StyledContainer><Spin/> </StyledContainer> :
                <Main>
                    <Row gutter={25}>
                        <Col sm={24} xs={24}>
                            <Card>
                                <WizardWrapper>
                                    <WizardFour>

                                        <ClickableSteps
                                            key={'step1'}
                                            isvertical
                                            current={currentStep}
                                            isfinished={true}
                                            isswitch={true}
                                            onChange={(step) => setCurrentStep(step)}
                                            direction="vertical"
                                            steps={[
                                                {
                                                    title: "Profile",
                                                    content: (
                                                        <TechnicianProfile
                                                            form={form}
                                                            submitText={t("technicians.form:submit-button-text", 'Submit')}
                                                            onFinish={onFinish}
                                                            icon="user-check"
                                                            isSaving={isSaving}
                                                            onEditMode={true} />
                                                    ),
                                                },
                                                {
                                                    title: "Qualifications",
                                                    content: <TechnicianQualifications id={params.id} />,
                                                  },
                                            ]}  />
                                    </WizardFour>
                                </WizardWrapper>
                            </Card>
                        </Col>
                    </Row>
                </Main>}
        </>

    );
}

export default UpdateTechnicianPage;
