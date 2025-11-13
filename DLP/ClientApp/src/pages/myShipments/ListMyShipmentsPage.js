import { Col, Row } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { PageHeader } from "../../components/page-headers/page-headers";
import { Main } from "../../container/styled";
import { useTranslation } from "react-i18next";
import MyShipmentsTable from "./MyShipmentsTable";
import { useTableSorting } from "hooks/useTableSorting";
import { UserFilterType } from "api/models";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { ProjectHeader, ProjectSorting } from "../localization/email/style";
import { RequestsApi } from "api/api";

const requestsApi = new RequestsApi();

function ListMyShipmentsPage() {
  const { t } = useTranslation();

  const filterKeys = [
    { id: UserFilterType.ALL, name: t("shipments:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("shipments:select.active", "Active") },
    {
      id: UserFilterType.PENDING,
      name: t("shipments:select.completed", "Completed"),
    },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const { sorting, onSorterChange } = useTableSorting();
  const [query, setQuery] = useState({
    status: UserFilterType.ALL,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    // setShipments(dummyShipments);
    fetchShipments();
  }, [query, sorting]);


  const fetchShipments = async () => {
    try {

      setIsLoading(true);
      const response = await requestsApi.apiShipmentsListGet({ ...query, ...sorting });
      console.log(response.data, "response.data");
      setShipments(response.data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };



  const onSearchChange = (value) => {
    setQuery({ ...query, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("my-shipments.title", "My Shipments")}
          subTitle={<>{shipments?.length} {t("my-shipment:total-shipments", "Total Shipments")}</>}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"ShipperShipments"}
              filterType={0}
              municipalityId={""}
              entityId={""}
              search={query.search}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />,
          ]}
        />
      </ProjectHeader>

      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                      {[...new Set(filterKeys)].map((item) => (
                        <li
                          key={item.id}
                          className={query?.status === item.id ? 'active' : 'deactivate'}
                        >
                          <Link
                            to="#"
                            onClick={() =>
                              setQuery({
                                ...query,
                                status: item.id,
                                pageNumber: 1,
                                pageSize: 10,
                              })
                            }
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                <div className="project-sort-search">
                  <AutoComplete
                    onSearch={(value) => onSearchChange(value)}
                    placeholder={t(
                      "my-shipments.search-placeholder",
                      "Search Shipments"
                    )}
                    patterns
                  />
                </div>
              </div>
            </ProjectSorting>
          </Col>
        </Row>

        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless bodyStyle={{ padding: 0 }}>
              <MyShipmentsTable
                data={shipments}
                isLoading={isLoading}
                onPaginationChange={onPaginationChange}
                onShowSizeChange={onShowSizeChange}
                onSorterChange={onSorterChange}
              />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ListMyShipmentsPage;
