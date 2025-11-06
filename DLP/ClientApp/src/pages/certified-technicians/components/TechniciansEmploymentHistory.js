import { Alert, Collapse, Spin } from "antd";
import { CertifiedTechniciansApi } from "api/api";
import Heading from "components/heading/heading";
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { BasicFormWrapper } from "../../../container/styled";
import { ChangelogWrapper } from "../../style";
import { useTranslation } from "react-i18next";
import { Empty } from 'antd';

const techniciansApi = new CertifiedTechniciansApi();
const { Panel } = Collapse;

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 600px;
  justify-content: center;
  align-items: center;
`;

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  justify-items: center;
  flex-direction: column;
`;

const StyledSpan = styled.span`
  color: #9094a0;
  font-size: 16px;
`;

const TechniciansEmploymentHistory = ({ id }) => {
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const getEmploymentHistory = async () => {
      try {
        const { data } = await techniciansApi.apiCertifiedTechniciansEmploymentHistoryGet({ id: id });


        const [first] = data;
        if (first && first?.isPresent) {
          setCurrent(first);
          setEmploymentHistory(data?.slice(1) ?? []);
        } else {
          setEmploymentHistory(data ?? []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (id) getEmploymentHistory();
  }, [id]);



  const renderItemBody = (item) => {
    if (!item) {
      item = current;
    }
    const from = moment(item?.startDate?.split("T")[0]).format("DD.MM.YYYY");
    const toDate = moment(item?.endDate?.split("T")[0]).format("DD.MM.YYYY");

    return (
      <div style={{ fontSize: 15 }}>
        <div>
          <FeatherIcon icon="calendar" size={15} /> {from} -{" "}
          {item?.isPresent ? "Present" : toDate}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {loading ? (
        <Loader>
          <Spin />
        </Loader>
      ) : (
        <BasicFormWrapper>
          <div style={{ width: 600 }}>
            {current ? (
              <Alert
                showIcon
                banner={false}
                icon={<FeatherIcon icon="briefcase" size={35} />}
                message={<strong>{current?.companyName}</strong>}
                description={renderItemBody()}
                type={"info"}
              />
            ) : (<StyledDiv>
              <Empty />
              <StyledSpan>
                {t("current-employment", "No record of present employment info!")}
              </StyledSpan>
            </StyledDiv>
            )}
            {employmentHistory && employmentHistory.length > 0 && (
              <div style={{ marginTop: 25 }}>
                <ChangelogWrapper>
                  <Heading as={"h6"}>{t("employment:previous", "Previous")}</Heading>
                  <Collapse
                    accordion
                    expandIcon={() => <FeatherIcon icon="clock" size={20} />}
                  >
                    {employmentHistory.map((item, index) => {
                      return (
                        <Panel
                          style={{ backgroundColor: "white" }}
                          key={item.id + "__" + index}
                          header={
                            <span className="v-num">{item.companyName} </span>
                          }
                        >
                          {renderItemBody(item)}
                        </Panel>
                      );
                    })}
                  </Collapse>
                </ChangelogWrapper>
              </div>
            )}
          </div>
        </BasicFormWrapper>
      )}
    </div>
  );
};

export default TechniciansEmploymentHistory;
