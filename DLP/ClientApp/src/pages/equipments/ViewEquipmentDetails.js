import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  PageHeader,
} from "antd";
import { WizardWrapper, WizardFour } from "../style";
import { useParams } from "react-router-dom";
import { EquipmentsApi } from "api/api";
import { ClickableSteps } from "components/steps/customSteps";
import { CardToolbox, Main } from "container/styled";
import EquipmentForm, { EquipmentViewMode } from "./components/EquipmentForm";
import EquipmentActivities from "./components/EquipmentActivities";
import Alert from "components/alerts/alerts";
import { t } from "i18next";

const equipmentsApi = new EquipmentsApi();

function ViewEquipmentDetails({ equipmentId = null }) {
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [equipment, setEquipment] = useState();

  const equipmentIdParam = params.id || equipmentId;
  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      const { data } = await equipmentsApi.apiEquipmentsIdGet({ id: equipmentIdParam });
      setEquipment(data);
    }

    if (equipmentIdParam)
      fetchEquipmentDetails();

  }, [equipmentIdParam])

  return (
    <>
      <CardToolbox>
      <PageHeader title={t('equipment:details', "Equipment Details")} />
      </CardToolbox>

      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>

            <Card>
              <div style={{display:'flex',justifyContent:'space-between',width:'80%',padding:'1%'}}>
                <span >
                 <h5> {t('equipments:company','Company Name')} : {equipment?.companyName} </h5>
                </span>
                <span>
                <h5>{t('equipments:tax','Tax Number')} : {equipment?.taxNumber}</h5>
                  </span>
              </div>
              <WizardWrapper>
                <WizardFour style={{justifyContent: 'flex-start'}}>
                  <ClickableSteps
                    key={currentStep}
                    isvertical
                    current={currentStep}
                    isfinished={true}
                    isswitch={equipment !== null}
                    onChange={(step) => setCurrentStep(step)}
                    direction="vertical"
                    steps={[
                      {
                        title: "Details",
                        content: (
                          <EquipmentForm mode={EquipmentViewMode.VIEW} equipment={equipment} />
                        ),
                      },
                      {
                        title: "Activities",
                        content: (
                          <EquipmentActivities equipment={equipment} />
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

export default ViewEquipmentDetails;
