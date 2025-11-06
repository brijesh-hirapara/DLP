import React from "react";
import { ErrorWrapper } from "../style";
import { NavLink } from "react-router-dom";
import { Main } from "container/styled";
import Heading from "components/heading/heading";
import { Button } from "components/buttons/buttons";
import { useTranslation } from "react-i18next";

const UnAuthorized = () => {
  const { t } = useTranslation();
  return (
    <Main>
      <ErrorWrapper>
        <img
          src={require(`static/img/pages/undraw_cancel.svg`).default}
          alt="403"
        />
        <Heading className="error-text" as="h3">
          403
        </Heading>
        <p>{t(`global.403`, "Sorry! you are not Authorized.")}</p>
        <NavLink to="/">
          <Button size="default" type="primary">
            {t(`global.return-home`, "Return Home")}
          </Button>
        </NavLink>
      </ErrorWrapper>
    </Main>
  );
};

export default UnAuthorized;
