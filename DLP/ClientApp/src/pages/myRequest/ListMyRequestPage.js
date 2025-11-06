import { Col, Form, Row } from "antd";
import { RequestsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { Button } from "../../components/buttons/buttons";
import { PageHeader } from "../../components/page-headers/page-headers";
import { Main } from "../../container/styled";
import { useTranslation } from "react-i18next";
import MyRequestTable from "./MyRequestTable";
import { useTableSorting } from "hooks/useTableSorting";
import { UserFilterType } from "api/models";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { formatLabel } from "utility/utility";
import { hasPermission } from "utility/accessibility/hasPermission";
import { useNavigate } from "react-router-dom";
import { ProjectHeader, ProjectSorting } from "../localization/email/style";

const requestsApi = new RequestsApi();

/**
 * @typedef {Object} ExtendedQuery
 * @property {number} [filterType] 
 * @extends {OrganizationsApiApiOrganizationsGetRequest}
 */

function ListMyRequestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchTimeout = useRef(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const filterKeys = [
    { id: UserFilterType.ALL, name: t("requests:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("requests:select.active", "Active") },
    {
      id: UserFilterType.PENDING,
      name: t("requests:select.under-evaluation", "Under Evaluation"),
    },
    {
      id: UserFilterType.DISABLED,
      name: t("requests:select.completed", "Completed"),
    },
    { id: UserFilterType.DELETED, name: t("requests:select.canceled", "Canceled") },
  ];

  const { sorting, onSorterChange } = useTableSorting();
const [requests, setRequests] = useState([]);
const [query, setQuery] = useState({
  status: UserFilterType.ALL,
  search: "",
  pageNumber: 1,
  pageSize: 10,
});

useEffect(() => {
  fetchRequests();
}, [query,sorting]);


  const onSearchChange = (value) => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  const onPaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await requestsApi.apiTransportManagementAdminListGet({ ...query, ...sorting });
      setRequests(response.data );
    } catch (err) {
    } finally {
      setRequestsLoading(false);
    }
  };

  const [codebooks, setCodebooks] = useState({
    Country: [],
    TrailerType: [],
    Certificate: [],
    GoodsType: [],
    CemtPermit: [],
    License: [],
    OperatingCountry: [],
  });


  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("my-requests.title", "My Requests")}
          subTitle={<>{requests?.length} {t("my-request:total-requests", "Total Requests")}</>}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"TransportRequests"}
              filterType={query?.status}
              municipalityId={""}
              entityId={""}
              search={query.search}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />,
            (hasPermission("languages:add") || true) && (
                  <Button
                    onClick={() => navigate("/my-requests/new-transport-request")}
                    className="btn-add_new"
                    size="default"
                    type="primary"
                    key="new-transport-request"
                  >
                     {formatLabel(t("my-request.add", "+ new transport request"))}
                  </Button>
                  )
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
                  "my-requests.search-placeholder",
                  "Search Requests"
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
              <MyRequestTable 
                data={requests}
                isLoading={requestsLoading}
                onPaginationChange={onPaginationChange}
                onShowSizeChange={onShowSizeChange}
                onSorterChange={onSorterChange}
                refetch={() =>fetchRequests()}
              />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ListMyRequestPage;
