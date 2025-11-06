import { Col, Radio, Row } from "antd";
import { CertifiedTechniciansApi, UsersApi } from "api/api";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { Cards } from "components/cards/frame/cards-frame";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { Button } from "../../components/buttons/buttons";
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main, TopToolBox } from "../../container/styled";
import { useAuthorization } from "hooks/useAuthorization";
import { useTranslation } from "react-i18next";
import CertifiedTechniciansTable from "./components/CertifiedTechniciansTable";
import { useTableSorting } from "hooks/useTableSorting";
import { UserFilterType } from "api/models";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const certifiedTechniciansApi = new CertifiedTechniciansApi();

function ListTechniciansPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();

  const filterKeys = [
    { id: UserFilterType.ACTIVE, name: t("users:select.active", "Active") },
    {
      id: UserFilterType.MINE,
      name: t("users:select.my-institution", "My Institution"),
    },
    {
      id: UserFilterType.PENDING,
      name: t("users:select.not-confirmed", "Not Confirmed"),
    },
    {
      id: UserFilterType.DISABLED,
      name: t("users:select.disabled", "Disabled"),
    },
    { id: UserFilterType.DELETED, name: t("users:select.deleted", "Deleted") },
    { id: UserFilterType.ALL, name: t("users:select.all", "All") },
  ];

  const [techniciansData, setTechniciansData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { sorting, onSorterChange } = useTableSorting();
  const [request, setRequest] = useState({
    filterType: UserFilterType.ACTIVE,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  useEffect(() => {
    getCertifiedTechnicians();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const getCertifiedTechnicians = async () => {
    setIsLoading(true);
    console.log({ sorting });
    const { data } =
      await certifiedTechniciansApi.apiCertifiedTechniciansListGet({
        ...request,
        ...sorting,
      });
    setTechniciansData(data);
    setIsLoading(false);
  };

  const onSearchChange = (value) => {
    setRequest({ ...request, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const onFilterChange = (e) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title="Certified Techicians"
          buttons={[
           
              <ExportButtonPageApiHeader
                key="1"
                callFrom={'CertifiedTechnicians'} filterType={request.filterType} municipalityId={""} entityId={""} search={request.search} 
              />,
              hasPermission("registers:add-certified-technicians") && (
                <Button
                  className="btn-add_new"
                  size="default"
                  type="primary"
                  key="1"
                >
                  <Link to="/registers/certified-technicians/create">
                    {t(
                      "certified-technicians:button.add-new",
                      "+ Add New Technician"
                    )}
                  </Link>
                </Button>
              )
          ]}
        />
      </CardToolbox>

      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox>
                <Row gutter={15}>
                  <Col lg={6} md={6} xs={24}>
                    <div className="table-search-box">
                      <AutoComplete
                        onSearch={onSearchChange}
                        placeholder={
                          "Search Technicians by Name, Training centers, Municipality, Qualifications..."
                        }
                        width="100%"
                        patterns
                      />
                    </div>
                  </Col>
                  <Col lg={18} md={18} xs={24}>
                    <div
                      className="table-toolbox-menu"
                      style={{ float: "left", marginLeft: 20 }}
                    >
                      <span className="toolbox-menu-title">
                        {t("users:lable.status", "Status:")}
                      </span>
                      <Radio.Group
                        name="filterKey"
                        onChange={(e) => onFilterChange(e)}
                        value={request?.filterType}
                      >
                        {[...new Set(filterKeys)].map((item, i) => {
                          return (
                            <Radio.Button
                              key={item.id + "_" + i}
                              value={item.id}
                            >
                              {item.name}
                            </Radio.Button>
                          );
                        })}
                      </Radio.Group>
                    </div>
                  </Col>
                </Row>
              </TopToolBox>
            </Col>
          </Row>
          <Row gutter={0}>
            <CertifiedTechniciansTable
              data={techniciansData}
              isLoading={isLoading}
              onPaginationChange={onPaginationChange}
              onShowSizeChange={onShowSizeChange}
              onSorterChange={onSorterChange}
              refetch={getCertifiedTechnicians}
            />
          </Row>
        </Cards>
      </Main>
    </>
  );
}

export default ListTechniciansPage;
