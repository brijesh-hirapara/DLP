import { Alert, Button, Collapse, Spin } from "antd";
import { EquipmentsApi } from "api/api";
import HandleLoadingState from "components/common/HandleLoadingState";
import Heading from "components/heading/heading";
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { downloadFilesFromBase64 } from "utility/dowloadFiles";
import CreateEquipmentActivity from "./CreateEquipmentActivity";
const { Panel } = Collapse;

const equipmentsApi = new EquipmentsApi();

const Loader = styled.div`
  display: flex;
  height: 400px;
  width: 600px;
  justify-content: center;
  align-items: center;
`;

const EquipmentActivities = ({ equipment }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (equipment) {
      fetchActivities();
      setIsLoading(false);
    }
  }, [equipment]);

  const fetchActivities = async () => {
    const { data } = await equipmentsApi.apiEquipmentsIdActivitiesGet({
      id: equipment.id,
    });
    setActivities(data);
  };

  const renderItemBody = () => (
    <div style={{ fontSize: 15 }}>
      <div style={{ display: "flex", alignItems: "baseline", marginTop: 15 }}>
        <FeatherIcon icon="home" size={15} />
        {equipment?.branchOfficeName}
      </div>
    </div>
  );

  const renderAlertHeader = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100% !important",
      }}
    >
      <div>
        {t("common:serial.number", "Serial Number")}:{" "}
        <strong>{equipment?.serialNumber}</strong>
      </div>
    </div>
  );

  const onFinish = (data) => {
    setShowAdd(false);
    setActivities(data);
  };

  return (
    <HandleLoadingState
      isLoading={isLoading}
      loadingPlaceholder={
        <Loader>
          <Spin />
        </Loader>
      }
    >
      <div style={{ width: 600 }}>
        <Alert
          showIcon
          banner={true}
          icon={<FeatherIcon icon="book-open" size={35} />}
          message={renderAlertHeader()}
          description={renderItemBody()}
          type={"info"}
        />

        {!showAdd && (
          <div>
            <div className="create-account-form">
              <Heading as="h4">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{t("equipment-activities:title", "Activities")}</span>
                  <Button type={"info"} disabled={equipment?.isArchived} onClick={() => !equipment?.isArchived && setShowAdd(true)}>
                    <FeatherIcon icon="plus" size={15} />
                    {t("common:add", "Add")}
                  </Button>
                </div>
              </Heading>
              {activities && activities.length > 0 && (
                <div style={{ marginTop: 25 }}>
                  <Collapse
                    accordion
                    expandIcon={() => (
                      <FeatherIcon icon="chevron-down" size={24} />
                    )}
                  >
                    {activities.map((item, index) => {
                      return (
                        <Panel
                          style={{ backgroundColor: "white" }}
                          key={item.id + "__" + index}
                          header={
                            <>
                              <div className="v-num">
                                {t(
                                  "equipment-activities.type-of-change",
                                  "Type of Change"
                                )}
                                : <strong>{item.typeOfChange}</strong>
                              </div>
                              <div className="rl-date">
                                {t(
                                  "equipment-activities.new-coolant",
                                  "New Coolant"
                                )}
                                : <strong>{item.newCoolant}</strong>
                              </div>
                            </>
                          }
                        >
                          <div>
                            <div>
                              {t(
                                "equipment-activities.date-of-change",
                                "Date of Change"
                              )}
                              :{moment(item.dateOfChange).format("DD.MM.YYYY")}
                            </div>
                            <div>
                              {t(
                                "equipment-activities.technicians.serial.number",
                                "Technician's serial number"
                              )}
                              : {item.technicianCertificateNumber}
                            </div>
                            <div>
                              {t(
                                "equipment-activities:comments-label",
                                "Comments"
                              )}
                              : {item.comments}
                            </div>
                            {item?.files?.length > 0 && (
                              <div>
                                <FeatherIcon icon="download-cloud" size={15} />{" "}
                                <span
                                  onClick={() =>
                                    downloadFilesFromBase64(item.files)
                                  }
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                >
                                  {t("common:download-files", "Download Files")}
                                </span>
                              </div>
                            )}
                          </div>
                        </Panel>
                      );
                    })}
                  </Collapse>
                </div>
              )}
            </div>
          </div>
        )}

        {showAdd && (
          <CreateEquipmentActivity
            onFinish={onFinish}
            equipmentId={equipment?.id}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </div>
    </HandleLoadingState>
  );
};

export default EquipmentActivities;
