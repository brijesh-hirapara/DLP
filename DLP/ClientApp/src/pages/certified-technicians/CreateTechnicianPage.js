import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Card,
  PageHeader,
  Row,
  Col,
} from "antd";
import { WizardWrapper, WizardFour } from "../style";
import { Steps } from "../../components/steps/steps";
import openNotificationWithIcon from "utility/notification";
import { useNavigate } from "react-router-dom";
import { CertifiedTechniciansApi, UsersApi } from "api/api";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "hooks/useDebouncedValue";
import { useOrganization } from "utility/useOrganization";
import QualificationForm from "./components/QualificationForm";
import TechnicianProfile from "./components/TechnicianProfile";
import { CardToolbox, Main } from "container/styled";
import moment from "moment";

const techniciansApi = new CertifiedTechniciansApi();
const usersApi = new UsersApi();

function CreateTechnicianPage() {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const {institution} = useOrganization();

  const [request, setRequest] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAlreadyExists, setUserAlreadyExists] = useState();

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
            errors: [t("validations.user-email-already-exists", "User email already exists!")],
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
      validateUser();
  }, [emailDebouncedValue]);

  useEffect(() => {
    if (institution) {
      form.setFieldValue("organization", institution?.name);
    }
  }, [institution])

  const onFinish = async (data) => {
    if (userAlreadyExists)
      return;

    if (currentStep === 0) {
      setRequest(data);
      setCurrentStep(currentStep + 1);
      return;
    }

    data.dateOfExam = data.dateOfExam ? moment(data.dateOfExam, "DD.MM.yyyy").format("MM/DD/yyyy") : '';
    data.certificateDuration = data.certificateDuration ? moment(data.certificateDuration, "DD.MM.yyyy").format("MM/DD/yyyy") : '';

    await submitNewTechician({ ...data, ...request });
  };

  const submitNewTechician = async (data) => {
    data.organizationId = institution?.id;
    setIsSaving(true);
    try {
      const response = await techniciansApi.apiCertifiedTechniciansPost(data);
      if (response.status === 200) {
        navigate("/registers/certified-technicians");
        openNotificationWithIcon("success", "New Technician Created",  "New Technician has been successfully created!");
      }
    } catch (err) {
      openNotificationWithIcon("error", "Technician Creation Failed", "Technician couldn't be created!");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      <CardToolbox>
        <PageHeader title={t('certified-technicians:add', "Add New Service Technician")} />
      </CardToolbox>
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <Card>
              <WizardWrapper>
                <WizardFour>

                  <Steps
                    key={currentStep}
                    isvertical
                    isswitch
                    current={currentStep}
                    direction="vertical"
                    steps={[
                      {
                        title: "Profile",
                        content: (
                          <TechnicianProfile
                            form={form}
                            onFinish={onFinish} />
                        ),
                      },
                      {
                        title: "Current Qualification",
                        content: (
                          <QualificationForm
                            form={form}
                            disabled={userAlreadyExists}
                            isSaving={isSaving}
                            onFinish={onFinish}
                            onOtherButtonClick={() => setCurrentStep(0)} />
                        ),
                      },
                    ]}
                    isfinished={true} />
                </WizardFour>
              </WizardWrapper>
            </Card>
          </Col>
        </Row>
      </Main>
    </>

  );
}

export default CreateTechnicianPage;
