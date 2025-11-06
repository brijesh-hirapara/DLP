import { Col, PageHeader, Row } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { CardToolbox, Main } from "container/styled";
import { useTranslation } from "react-i18next";
import EquipmentForm, { EquipmentViewMode } from "./components/EquipmentForm";
import { EquipmentsApi } from "api/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const equipmentsApi = new EquipmentsApi();

const UpdateEquipmentPage = () => {
    const { t } = useTranslation();
    const params = useParams();
    const [equipment, setEquipment] = useState();
 
    useEffect(() => {
      const fetchEquipmentDetails = async () => {
        const { data } = await equipmentsApi.apiEquipmentsIdGet({ id: params.id });
        setEquipment(data);
      }
  
      if (params.id)
        fetchEquipmentDetails();
  
    }, [params.id])

    return (
        <>
            <CardToolbox>
                <PageHeader title={t("equipments:update", "Update Equipment")} />
            </CardToolbox>
            <Main>
                <Row gutter={25}>
                    <Col sm={24} xs={24}>
                        <Cards headless>
                            <EquipmentForm mode={EquipmentViewMode.UPDATE} equipment={equipment} />
                        </Cards>
                    </Col>
                </Row>
            </Main>
        </>
    )
}

export default UpdateEquipmentPage;