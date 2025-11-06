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
import { dummyShipments } from "./dummyShipments";
import { ProjectHeader, ProjectSorting } from "../localization/email/style";

function ListMyShipmentsPage() {
  const { t } = useTranslation();

  const filterKeys = [
    { id: UserFilterType.ALL, name: t("shipments:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("shipments:select.active", "Active") },
    {
      id: UserFilterType.DISABLED,
      name: t("shipments:select.completed", "Completed"),
    },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const { sorting, onSorterChange } = useTableSorting();
  const [shipment, setShipment] = useState({
    filterType: UserFilterType.ALL,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

const [shipments, setShipments] = useState([]);

useEffect(() => {
  setShipments(dummyShipments);
}, [shipment, sorting]);


  const onSearchChange = (value) => {
    setShipment({ ...shipment, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setShipment((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setShipment((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
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
              callFrom={"my-shipments"}
              filterType={0}
              municipalityId={""}
              entityId={""}
              search={shipment.search}
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
                            className={shipment?.filterType === item.id ? 'active' : 'deactivate'}
                          >
                            <Link
                              to="#"
                              onClick={() =>
                                setShipment({
                                  ...shipment,
                                  filterType: item.id,
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
