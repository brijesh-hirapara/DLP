import { Card, Col, Form, PageHeader, Row } from "antd";
import { CertifiedTechniciansApi } from "api/api";
import { ClickableSteps } from "components/steps/customSteps";
import { CardToolbox, Main } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WizardFour, WizardWrapper } from "../style";
import TechnicianProfile from "./components/TechnicianProfile";
import TechnicianQualifications from "./components/TechnicianQualifications";
import TechniciansEmploymentHistory from "./components/TechniciansEmploymentHistory";
import { t } from "i18next";

const techniciansApi = new CertifiedTechniciansApi();

function ViewTechnicianDetails() {
  const commonData = useContext(CommonDataContext);
  const { municipalities } = commonData;

  const params = useParams();

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchTechnicianData = async () => {
      const { data } = await techniciansApi.apiCertifiedTechniciansIdGet({
        id: params.id,
      });
      const municipality = municipalities.find(
        (item) => item.id == data.municipalityId
      );
      form.setFieldsValue({
        ...data,
        cantonId: municipality?.cantonId,
        stateEntityId: municipality?.stateEntityId,
      });
      setIsLoading(false);
    };

    if (params.id) {
      fetchTechnicianData();
    }
  }, [params.id]);

  return (
    <>
      <CardToolbox>
      <PageHeader title={t('certified-technicians:details', "Technician's Details")} />
      </CardToolbox>

      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <Card>
              <WizardWrapper>
                <WizardFour>
                  <ClickableSteps
                    key={currentStep}
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
                            isLoading={isLoading}
                            readOnly={true}
                          />
                        ),
                      },
                      {
                        title: "Employment History",
                        content: (
                          <TechniciansEmploymentHistory id={params.id} />
                        ),
                      },
                    ]}
                  />
                </WizardFour>
              </WizardWrapper>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ViewTechnicianDetails;
