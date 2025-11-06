import { Col, PageHeader, Row } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { CardToolbox, Main } from "container/styled";
import { useTranslation } from "react-i18next";
import EquipmentForm, { EquipmentViewMode } from "./components/EquipmentForm";

const CreateEquipmentPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <CardToolbox>
        <PageHeader title={t("equipments:add-new", "Register Equipment")} />
      </CardToolbox>
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <Cards headless>
              <EquipmentForm mode={EquipmentViewMode.CREATE} />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default CreateEquipmentPage;
