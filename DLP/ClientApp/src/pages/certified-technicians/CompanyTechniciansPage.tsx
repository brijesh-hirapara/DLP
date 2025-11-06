import { Button, Col, Popconfirm, Row, Skeleton, Table, Tooltip } from "antd";
import {
  CertifiedTechnicianDto,
  CertifiedTechnicianDtoPaginatedList,
} from "api/models";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import { CardToolbox, Main, TableWrapper, TopToolBox } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import Heading from "components/heading/heading";
import SearchCompanyTechnicianModal from "./components/SearchCompanyTechniciansModal";
import { CertifiedTechniciansApi } from "api/api";
import OrdinalNumber from "components/common/OrdinalNumber";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

const getUserStatus = (user: any) => {
  const color = user.isPending
    ? ""
    : user.isDeleted
      ? "blocked"
      : user.isActive
        ? "active"
        : "deactivate";
  const text = user.isPending
    ? "Not Confirmed"
    : user.isDeleted
      ? "Deleted"
      : user.isActive
        ? "Active"
        : "Disabled";
  return <span className={`status-text ${color}`}>{text}</span>;
};

const techniciansApi = new CertifiedTechniciansApi();

const CompanyTechniciansPage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [techniciansData, setTechniciansData] =
    useState<CertifiedTechnicianDtoPaginatedList>({});
  const [request, setRequest] = useState<RequestStateType>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const isInitialLoading = !techniciansData?.items && isLoading;

  useEffect(() => {
    getTechniciansData();
  }, [request, sorting]);

  const getTechniciansData = async () => {
    try {
      setIsLoading(true);
      const requestPayload = {
        ...request,
        ...sorting,
      };

      const { data } = await techniciansApi.apiCertifiedTechniciansCompanyTechniciansGet(requestPayload);
      setTechniciansData(data);

    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchChange = (value: string) => {
    setRequest({ ...request, search: value, pageNumber: 1 });
  };

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };


  const handleOnFinish = async () => {
    await getTechniciansData();
    setAddModalVisible(false);
  }

  const columns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("certified-technicians:table.title.fullname", "Full Name"),
      dataIndex: "user",
      key: "user",
      sorter: true,
      sortDirections,
    },
    {
      title: t("certified-technicians:table.title.email", "Email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.municipality",
        "Municipality"
      ),
      dataIndex: "municipality",
      key: "municipality",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.training-center",
        "Training Center"
      ),
      dataIndex: "trainingCenter",
      key: "trainingCenter",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.current-qualification",
        "Current Qualification"
      ),
      dataIndex: "currentQualification",
      key: "currentQualification",
      sorter: true,
      sortDirections,
    },
    {
      title: t("users:table.title.action", "Action"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  const onTerminateEmployment = async (id: any) => {
    try {
      await techniciansApi.apiCertifiedTechniciansIdTerminateEmploymentPost({ id });
      await getTechniciansData()
    } catch (ex) {
      console.log(ex);
    }
  }

  const dataItems = techniciansData?.items?.map((user) => {
    const {
      id,
      ordinalNumber,
      firstName,
      lastName,
      email,
      municipality,
      currentQualification,
      trainingCenter,
      isDeleted,
    } = user;

    const fullName = `${firstName} ${lastName}`;

    return {
      key: id,
      ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
      user: fullName,
      email,
      municipality,
      currentQualification,
      trainingCenter,
      status: getUserStatus(user),
      action: (
        <div className="table-actions" style={{ clear: "both" }}>
          <Tooltip title={t("global.view", "View")}>
            <Link to={`/company-technicians/${id}`}>
              <Button className="btn-icon" type="default" shape="circle">
                <FeatherIcon icon="eye" size={17} />
              </Button>
            </Link>
          </Tooltip>
          <Popconfirm
            title={t(
              "technicians:alert.terminate-confirm",
              "This step is irreversible, are you sure you want to terminate {{dynamicValue}}'s employment?",
              { dynamicValue: fullName }
            )}
            onConfirm={() => onTerminateEmployment(id)}
            okText="Yes"
            cancelText="No"
          >
            {!isDeleted &&
              <Tooltip title={t("global.delete", "Delete")}>
                <Button className="btn-icon" shape="circle" title={t("global.delete", "Delete")}>
                  <FeatherIcon icon="delete" size={17} />
                </Button>
              </Tooltip>}

          </Popconfirm>
        </div>
      ),
    };
  });


  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t('global:company-service-technicians', "Company Service Technicians")}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={'CertifiedTechnicians'}
              filterType={""}
              municipalityId={""}
              entityId={""}
              search={request.search}
              typeOfEquipmentId={undefined} // or a valid value
              from={undefined} // or a valid date value
              to={undefined} // or a valid date value
            />,
             (hasPermission("company-technicians:add") && (
              <Button className="btn-add_new" size="middle" type="primary" onClick={() => setAddModalVisible(true)}>
                {t(
                  "certified-technicians:button.add-new",
                  "+ Add New Technician"
                )}
              </Button>
            ))
          ]}
        />
      </CardToolbox>
      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox>
                <Row gutter={15}>
                  <Col lg={14} md={14} xs={24}>
                    <div className="table-search-box">
                      <AutoComplete
                        onSearch={onSearchChange}
                        placeholder={
                          "Search Technicians by Name, Training centers, Municipality, Qualifications..."
                        }
                        patterns
                      />
                    </div>
                  </Col>
                </Row>
              </TopToolBox>
            </Col>
          </Row>
          <Row gutter={0}>
            <TableWrapper className="table-responsive">
              {isInitialLoading ? (
                <Cards headless>
                  <Skeleton active paragraph={{ rows: 5 }} />
                </Cards>
              ) : (
                <Table
                  dataSource={dataItems}
                  columns={columns}
                  showSorterTooltip={false}
                  loading={isLoading}
                  pagination={{
                    current: techniciansData?.pageIndex,
                    total: techniciansData?.totalCount,
                    onChange: handlePaginationChange,
                    onShowSizeChange: onShowSizeChange,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 50, 100, 1000],
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  onChange={(_, __, sorter) => onSorterChange(sorter)}
                />
              )}
            </TableWrapper>
          </Row>
        </Cards>
      </Main>
      {addModalVisible && <SearchCompanyTechnicianModal onFinish={handleOnFinish} onCancel={() => setAddModalVisible(false)} />}
    </>
  );
};

export default CompanyTechniciansPage;
