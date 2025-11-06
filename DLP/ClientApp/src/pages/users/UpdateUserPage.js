import { Col, Row, Spin } from "antd";
import { UsersApi } from "api/api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main } from "../../container/styled";
import UserWizzard from "./UserWizzard";
const usersApi = new UsersApi();

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 250px;
`;

function UpdateUserPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await usersApi.usersIdGet({ id: params.id });
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (params.id) fetchUser();
  }, [params.id]);

  return (
    <>
      <CardToolbox>
        <PageHeader title={t("users:update.user", "Update user")} />
      </CardToolbox>

      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            {!user ? (
              <StyledContainer>
                <Spin />
              </StyledContainer>
            ) : (
              <UserWizzard user={user} />
            )}
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default UpdateUserPage;
