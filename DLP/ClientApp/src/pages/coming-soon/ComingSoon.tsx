import React from "react";
import { Row, Col } from "antd";
import Countdown, { CountdownRenderProps } from "react-countdown";

import { PageHeader } from "components/page-headers/page-headers";
import { Cards } from "components/cards/frame/cards-frame";
import { Main } from "container/styled";

import { ComingsoonStyleWrapper } from "../style";
import { useTranslation } from "react-i18next";

interface CompletionistProps {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  completed?: React.ReactNode;
}

function ComingSoon() {
  const { t } = useTranslation();
  const Completionist: React.FC<CompletionistProps> = () => {
    return <span>You are good to go!</span>;
  };

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: CountdownRenderProps) => {
    if (completed) {
      return <Completionist />;
    }
    return (
      <div className="countdwon-data">
        <span>
          <span className="countdown-time">{days}</span>{" "}
          <span className="countdown-title">Days</span>
        </span>
        <span>
          <div className="countdown-time">{hours}</div>
          <span className="countdown-title">Hours</span>
        </span>
        <span>
          <div className="countdown-time">{minutes}</div>
          <span className="countdown-title">Minutes</span>
        </span>
        <span>
          <div className="countdown-time">{seconds}</div>{" "}
          <span className="countdown-title">Seconds</span>
        </span>
      </div>
    );
  };

  return (
    <>
      <PageHeader />
      <Main>
        <Row gutter={25}>
          <Col sm={24} xs={24}>
            <ComingsoonStyleWrapper>
              <Cards headless>
                <div className="strikingDash-logo">
                  <img
                    style={{ width: "120px" }}
                    src={require("../../static/img/Logo_Dark.svg")}
                    alt=""
                  />
                </div>
                <div className="coming-soon-content">
                  <h1>
                    {t("coming-soon:lable.next-milestone0title", "Next Milestone!")}
                  </h1>
                  <p>
                    {t(
                      "coming-soon:paragraph.next-subtitle",
                      "Next major deployment is scheduled for "
                    )}
                    <strong>6st of November 2023</strong>
                  </p>
                </div>
                <div className="strikingDash-countdown">
                  <Countdown
                    date={
                      Date.now() +
                      (new Date("November 6, 2023 11:59 PM").getTime() -
                        Date.now())
                    }
                    renderer={renderer}
                  />
                </div>
                <div className="coming-soon-social">
                  <p>2023 © An iVote Solution</p>
                </div>
              </Cards>
            </ComingsoonStyleWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ComingSoon;
