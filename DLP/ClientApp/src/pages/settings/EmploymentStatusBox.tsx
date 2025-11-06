import { Alert, Button, Collapse, Popconfirm, Spin } from "antd";
import { CertifiedTechniciansApi } from "api/api";
import { CertifiedTechnicianDto, EmploymentHistoryDto } from "api/models";
import Heading from "components/heading/heading";
import { BasicFormWrapper } from "container/styled";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import { ChangelogWrapper } from "pages/style";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import openNotificationWithIcon from "utility/notification";

const techniciansApi = new CertifiedTechniciansApi();
const { Panel } = Collapse;

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 600px;
  justify-content: center;
  align-items: center;
`;

const EmploymentStatusBox = () => {
  const [employmentHistory, setEmploymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<any>(null);
  const [isEndEmploymentLoading, setIsEndEmploymentLoading] = useState(false);
  const { t } = useTranslation();

  const handleEndEmploymentClick = async () => {
    try {
      setIsEndEmploymentLoading(true);
      await techniciansApi.apiCertifiedTechniciansEndCurrentEmploymentPost();
      await getEmploymentHistory();
      setCurrent(null);
      openNotificationWithIcon(
        "success",
        t("employment:end-employment-success", "Employment has been ended!")
      );
    } catch (error) {
    } finally {
      setIsEndEmploymentLoading(false);
    }
  };

  const getEmploymentHistory = async () => {
    try {
      const response = await techniciansApi.apiCertifiedTechniciansEmploymentHistoryGet();
      const data = response.data as EmploymentHistoryDto[];

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

  useEffect(() => {
    getEmploymentHistory();
  }, []);

  const renderItemBody = (_item?: any) => {
    const item = _item ?? current;
    const from = moment(item?.startDate?.split("T")[0]).format("DD.MM.YYYY");
    const toDate = moment(item?.endDate?.split("T")[0]).format("DD.MM.YYYY");

    return (
      <div style={{ fontSize: 15 }}>
        <div>
          <FeatherIcon icon="calendar" size={15} /> {from} -{" "}
          {item?.isPresent ? "Present" : toDate}
        </div>
        {item?.isPresent && (
           <Popconfirm
                      title={`${t(
                            "users:alert.toggle-end-employment",
                            "Are you sure you want to end employment at…"
                          )}`
                      }
                      onConfirm={() => handleEndEmploymentClick()}
                      okText="Yes"
                      cancelText="No"
                    >
          <Button
            style={{ marginTop: 10 }}
            type="primary"
            size="middle"
            // onClick={handleEndEmploymentClick}
            loading={isEndEmploymentLoading}
          >
            {t("employment:end-employment", "End employment")}
          </Button>
          </Popconfirm>
        )}
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
            ) : (
              t("employment:current-employment", "No record of present employment info!")
            )}
            {employmentHistory && employmentHistory.length > 0 && (
              <div style={{ marginTop: 25 }}>
                <ChangelogWrapper>
                <Heading as={"h6"}>{t("employment:previous", "Previous")}</Heading>
                  <Collapse
                    accordion
                    expandIcon={() => <FeatherIcon icon="clock" size={20} />}
                  >
                    {employmentHistory.map((item: any, index) => {
                      return (
                        <Panel
                          style={{ backgroundColor: "white" }}
                          key={item?.id + "__" + index}
                          header={
                            <span className="v-num">{item?.companyName} </span>
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

export default EmploymentStatusBox;
