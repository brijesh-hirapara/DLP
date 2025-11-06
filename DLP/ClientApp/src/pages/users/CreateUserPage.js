import { Col, Row } from "antd";
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main } from "../../container/styled";

import UserWizzard from "./UserWizzard";
import { useTranslation } from "react-i18next";

function CreateUserPage() {
  const { t } = useTranslation();

  return (
    <>
      <CardToolbox>
        <PageHeader title={t("users:create.new.user", "Create new user")} />
      </CardToolbox>

      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <UserWizzard user={null} />
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default CreateUserPage;
