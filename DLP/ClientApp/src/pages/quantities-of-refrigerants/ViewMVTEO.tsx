import { BasicFormWrapper } from "container/styled";
import { PageHeader, Row, Col, Spin } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { Main } from "container/styled";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import styled from "styled-components";
import IMPORTERSList from "./components/IMPORTERSList";

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

const Loader = styled.div`
  display: flex; 
  height: 400px;
  width: 100%; 
  justify-content: center; 
  align-items: center;
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

const Title = styled.h6`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const DataItem = styled.div`
  margin-bottom: 16px;

  label {
    font-weight: bold;
    display: block;
  }

  span {
    display: block;
    margin-top: 4px;
  }
`;

function ViewMVTEO() {
    const [requestLoading, setRequestLoading] = useState(false);
    const { t } = useTranslation();

    // Sample data to be displayed instead of form inputs
    const data = {
        nameOfLegalEntity: "Sample Legal Entity",
        registrationNumber: "123456",
        phone: "+123 456 789",
        fax: "+123 456 789",
        email: "sample@example.com",
        canton: "Sample Canton",
        entity: "Sample Entity",
        authorizedPerson: "John Doe",
    };

    return (
        <>
            {requestLoading ? (
                <Loader>
                    <Spin />
                </Loader>
            ) : (
                <>
                    <PageHeader ghost />
                    <Main>
                        <Row gutter={25}>
                            <Col sm={24} xs={24}>
                                <Cards headless>
                                    <Title>
                                        {t("mvteo:detail-title", "FORM OF ANNUAL REPORT ON THE IMPORT/EXPORT OF OZONE DEPLETING SUBSTANCES LAYER (CONTROLLED SUBSTANCES), SUBSTANCES THAT DAMAGE THE OZONE LAYER FOR SPECIAL PURPOSES, SUBSTITUTE SUBSTANCES AND MIXTURES OF SUBSTITUTE SUBSTANCES")}
                                    </Title>
                                    <br />
                                    <BasicFormWrapper className="basic-form-inner">
                                        <StyledTable>
                                            <thead>
                                                <tr>
                                                    <th colSpan={6}>
                                                        {t('form:general-info', 'General information about the authorized service provider ')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={3}>
                                                        <DataItem>
                                                            <label>{t("global.name-of-legal-entity", "Name of legal entity or entrepreneur")}</label>
                                                            <span>{data.nameOfLegalEntity}</span>
                                                        </DataItem>
                                                    </td>
                                                    <td colSpan={3}>
                                                        <DataItem>
                                                            <label>{t("global.registration-number", "Registration number")}</label>
                                                            <span>{data.registrationNumber}</span>
                                                        </DataItem>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.phone", "Tel / Тел")}</label>
                                                            <span>{data.phone}</span>
                                                        </DataItem>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.fax", "Fax / Факс")}</label>
                                                            <span>{data.fax}</span>
                                                        </DataItem>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.email", "Email / Емаил")}</label>
                                                            <span>{data.email}</span>
                                                        </DataItem>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.canton", "Kanton / Canton")}</label>
                                                            <span>{data.canton}</span>
                                                        </DataItem>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.entity", "Entitet / Entity")}</label>
                                                            <span>{data.entity}</span>
                                                        </DataItem>
                                                    </td>
                                                    <td colSpan={2}>
                                                        <DataItem>
                                                            <label>{t("global.authorized-person", "Name and surname of authorized person")}</label>
                                                            <span>{data.authorizedPerson}</span>
                                                        </DataItem>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </StyledTable>
                                        <IMPORTERSList />
                                        <SignatureArea>
                                            <SignatureLine>
                                                <span>У ---------------------------------- </span>
                                                <span>М. П. </span>
                                                <div>
                                                    <span>Одговорно лице</span>
                                                    <br />
                                                    <span>----------------------------</span>
                                                    <br />
                                                    <span>Име и презиме</span>
                                                </div>
                                            </SignatureLine>
                                        </SignatureArea>
                                        <ExplanationNotes>
                                            <p>Објашњење:</p>
                                            <p>(1) Подаци се уносе према терминологији и ознакама супстанци, наведеним у Прилогу 1. ове уредбе.</p>
                                            <p>(2) Подаци о крајњем кориснику продатих супстанци садрже: име правног лица / предузетника, адреса, контакт телефон.</p>
                                            <p>Напомена: Уз Извјештај се прилажу овјерене детаљне спецификације увезених количина супстанци, по увезеним контингентима (са подацима за сваки контингент: број товарног листа, број царинске декларације и датум царињења), врстама супстанци које оштећују озонски омотач, замјенским супстанцама и њиховим корисницима (властита потрошња и/или продаја производним и сервисним организацијама на тржишту Босне и Херцеговине) и количина супстанци које оштећују озонски омотач и замјенских супстанци преосталих и ускладиштених код увозника (залихе) на дан 31. 12. претходне (извјештајне) године.</p>
                                        </ExplanationNotes>
                                    </BasicFormWrapper>
                                </Cards>
                            </Col>
                        </Row>
                    </Main>
                </>
            )}
        </>
    );
}

export default ViewMVTEO;
