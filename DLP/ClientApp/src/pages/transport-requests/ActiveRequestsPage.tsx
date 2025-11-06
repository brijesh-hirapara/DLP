import { Col, Input, Row, Table, Button, } from "antd";
import { DatePicker, Typography } from "antd";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { sortDirections } from "constants/constants";
import { useAuthorization } from "hooks/useAuthorization";
import {
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  TableWrapper,
} from "container/styled";
import { UserTableStyleWrapper } from "../style";
// import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import OrdinalNumber from "components/common/OrdinalNumber";




const sampleTableRows = [
  {
    key: 1,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 2,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 3,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 4,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 5,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 6,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 7,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
  {
    key: 8,
    id: "001-0125",
    estimatedPickup:
      "05.08.2025-08.08.2025\nSlGeog, 1000 MKM\nSlovenia, 1000 MKM",
    estimatedDropoff:
      "10.08.2025-11.08.2025\nBank, 2600 EUR\nCommercial, 6000 MKM, 42 hour",
    cargo: "1280 km, 80l/kg, 235 LMD",
    deadline: "3h 15m 03s",
  },
];


const ActiveRequestsPage = () => {
  const { t } = useTranslation();
  const [logs] = useState({
    totalCount: sampleTableRows.length,
    pageIndex: 1,
    items: sampleTableRows,
  });

  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    fullName: "",
    ip: "",
    logType: 0,
    activity: "",
  });
    const { hasPermission } = useAuthorization();
      const [request, setRequest] = useState({
        search: "",
      });

    const [addUserGroupState, setAddUserGroupState] = useState({
      modulesWithFunctionalities: [],
      assignedUsers: [],
      isLoading: false,
      modalVisible: false,
      areFunctionalitiesLoading: false,
      errors: {},
    });

    
  const onSearchChange = (value : any) => {
    setRequest({ search: value });
  };
  
const navigate = useNavigate();
  const columns = [
    {
      title: t("requests.requestId", "Request Id"),
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests.estimatedPickup", "Estimated Pickup"),
      dataIndex: "estimatedPickup",
      key: "estimatedPickup",
      render: (val: string) => (
        <div style={{ whiteSpace: "pre-line" }}>{val}</div>
      ),
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests.estimatedDropoff", "Estimated Drop-off"),
      dataIndex: "estimatedDropoff",
      key: "estimatedDropoff",
      render: (val: string) => (
        <div style={{ whiteSpace: "pre-line" }}>{val}</div>
      ),
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests.cargo", "Cargo"),
      dataIndex: "cargo",
      key: "cargo",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests.deadline", "Deadline"),
      dataIndex: "deadline",
      key: "deadline",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests.actions", "Actions"),
      key: "actions",
      render: (_: any) => (
        <Button type="primary" style={{ background: "#79C942", border: 0 }}
        onClick={() => navigate("/submit-offer")}
        >
          {t("requests.enterOffer", "Enter Your Offer")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <CardToolbox>
        <ProfilePageheaderStyle>
          <PageHeader
            ghost
            title={t("requests.activeRequests", "Active Requests")}
            subTitle={
              <div>
                <Input
                  style={{ height: "38px", marginLeft: "20px"}}
                  onChange={(param) => {
                    onSearchChange(param.target.value);
                  }}
                  placeholder={t("", "Search by city name,postal code,reuqest id")}
                  width="100%"
                />
              </div>
            }
            buttons={[
              <ExportButtonPageApiHeader
                key="1"
                callFrom={"Logs"}
                filterType={0}
                municipalityId={""}
                entityId={""}
                search={""}
                typeOfEquipmentId={""}
                from={""}
                to={""}
              />,
            ]}
          />
        </ProfilePageheaderStyle>
      </CardToolbox>
      <Main>
        <Row gutter={15}>
          <Col md={24}>
            <UserTableStyleWrapper>
              <Cards headless>
                <Row
                  gutter={[15, 0]}
                  justify="center"
                  align="middle"
                  style={{ marginBottom: "20px" }}
                >
                  <Col>
                    <Typography.Text strong>Filters :</Typography.Text>
                  </Col>
                  <Col>
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder={t(
                        "requests.estimatedPickupDate",
                        "Estimated Pickup Date"
                      )}
                      onChange={(date, dateString) =>
                        setQuery((prev) => ({
                          ...prev,
                          estimatedPickupDate: dateString,
                          pageNumber: 1,
                        }))
                      }
                    />
                  </Col>

                  <Col md={6}>
                    <Input
                      placeholder={t(
                        "requests.pickupPostalCode",
                        "Pickup Postal Code"
                      )}
                      onChange={(e) =>
                        setQuery((prev) => ({
                          ...prev,
                          pickupPostalCode: e.target.value,
                          pageNumber: 1,
                        }))
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder={t(
                        "requests.estimatedDropOffDate",
                        "Estimated Drop-off Date"
                      )}
                      onChange={(date, dateString) =>
                        setQuery((prev) => ({
                          ...prev,
                          estimatedDropOffDate: dateString,
                          pageNumber: 1,
                        }))
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Input
                      placeholder={t(
                        "requests.dropOffPostalCode",
                        "Drop-off Postal Code"
                      )}
                      onChange={(e) =>
                        setQuery((prev) => ({
                          ...prev,
                          dropOffPostalCode: e.target.value,
                          pageNumber: 1,
                        }))
                      }
                    />
                  </Col>
                </Row>
                <TableWrapper>
                  <Table
                    dataSource={logs.items}
                    columns={columns}
                    pagination={{
                      total: logs.totalCount,
                      current: logs.pageIndex,
                      pageSize: query.pageSize,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 50, 100],
                    }}
                  />
                </TableWrapper>
              </Cards>
            </UserTableStyleWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default ActiveRequestsPage;
