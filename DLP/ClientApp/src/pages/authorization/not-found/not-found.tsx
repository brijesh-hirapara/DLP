import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "components/buttons/buttons";
import Heading from "components/heading/heading";
import { ErrorWrapper } from "../style";
import { Main } from "../../style";

function NotFound() {
  const { t } = useTranslation();
  return (
    <Main>
      <ErrorWrapper>
        <img src={require(`static/img/pages/404.svg`).default} alt="404" />
        <Heading className="error-text" as="h3">
          404
        </Heading>
        <p>
          {t(`global.404`, "Sorry! the page you are looking for doesnt exist.")}
        </p>
        <NavLink to="/">
          <Button size="default" type="primary">
            {t(`global.return-home`, "Return Home")}
          </Button>
        </NavLink>
      </ErrorWrapper>
    </Main>
  );
}

export default NotFound;
