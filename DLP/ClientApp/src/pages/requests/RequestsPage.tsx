import { Col,  Popconfirm, Row, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { RequestsApi, UsersApi } from "api/api";
import {
  ListRequestDto,
  ListRequestDtoPaginatedList,
  RequestStatus,
  RequestTypeNew,
} from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import OrdinalNumber from "components/common/OrdinalNumber";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import {
  CardToolbox,
  Main,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { ProjectSorting } from "pages/localization/email/style";
import { AutoComplete } from "components/autoComplete/autoComplete";


const requestsApi = new RequestsApi();
const usersApi = new UsersApi();

const intialData = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageIndex: 1,
  totalCount: 0,
  totalPages: 0,
};

export const RequestsPage = () => {
  const location = useLocation();
  const isListingArchivedRequests = location.pathname === "/archived-request";
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();

  const [requestsData, setRequestsData] =
    useState<ListRequestDtoPaginatedList>(intialData);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const { onSorterChange, sorting } = useTableSorting();
  const [query, setQuery] = useState<{
    search: string;
    pageNumber: number;
    pageSize: number;
    listArchived: boolean;
    type: RequestTypeNew; // <- Use the enum type here
  }>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
    listArchived: isListingArchivedRequests,
    type: RequestTypeNew.ALL,
  });

  const filterKeys = isListingArchivedRequests
  ? [
      { id: RequestTypeNew.ALL, name: t("global.all", "All") },
      { id: RequestStatus.PENDING, name: t("requests:status.pending", "Pending") },
      { id: RequestStatus.APPROVED, name: t("requests:status.approved", "Approved") },
      { id: RequestStatus.REJECTED, name: t("requests:status.rejected", "Rejected") },
    ].filter(Boolean)
  : [
      { id: RequestTypeNew.ALL, name: t("global.all", "All") },
      { id: RequestTypeNew.RegistraterAsShipper, name: t("company.shipper", "Shipper") },
      { id: RequestTypeNew.RegistraterAsCarrier, name: t("company.carrier", "Carrier") },
    ].filter(Boolean);


  useEffect(() => {
    fetchRequests();
  }, [query, sorting]);

  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  const onPaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const fetchRequests = async () => {
    try {
    
      setRequestsLoading(true);
      const response = await requestsApi.apiRequestsGet({
        ...query,
        ...sorting,
      });

      setRequestsData(response.data );
    } catch (err) {
    } finally {
      setRequestsLoading(false);
    }
  };

  const columns: ColumnsType<any> = [
    // {
    //   title: t("global.ordinal-number", "No."),
    //   dataIndex: "ordinalNumber",
    //   key: "ordinalNumber",
    //   sorter: false,
    // },
    {
      title: t("requests:table.request-id", "Request Id"),
      dataIndex: "requestId",
      key: "requestId",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:table.date-of-submission", "Date Of Submission"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.company-name", "Company Name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:table.company-type", "Company Type"),
      dataIndex: "requestType",
      key: "requestType",
      sorter: true,
      sortDirections,
    },
  ];

  // if (isListingArchivedRequests) {
    columns.push({
      title: t("global.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections,
    });
  // }

  const canReviewRequests = isListingArchivedRequests
    ? hasPermission("requests:view-details") || hasPermission("requests:view-archived-request")
    : hasPermission("requests:approve");
  if (canReviewRequests) {
    columns.push({
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      sorter: false,
      fixed: "right",
      width: 80, 
    });
  }

  const onResendEmailConfirmation = async (id:any) => {
    await usersApi.usersIdResendConfirmationPost({ id });
    openNotificationWithIcon(
      "success",
      t(
        "users:resend.confirmation.email.success",
        "Email confirmation was send successfully."
      )
    );
  };

  const getRequestStatus = (request: RequestStatus, statusDesc: string) => {
    let color = "deactivate";
  
    if (request === RequestStatus.PENDING) {
      color = "deactivate";
    } else if (request === RequestStatus.REJECTED) {
      color = "blocked";
    } else if (request === RequestStatus.APPROVED) {
      color = "active";
    }
  
    return <span className={`ant-tag ${color}`}>{statusDesc}</span>;
  };
  

  const tableData = (requestsData?.items ?? []).map((item: ListRequestDto) => {
    const {
      id,
      idNumber,
      requestId,
      ordinalNumber,
      name,
      municipality,
      requestType,
      requestTypeDesc,
      status,
      statusDesc,
      createdAt,
      mustChangePassword,
      contactPersonId
    } = item;
    return {
      key: id,
      idNumber,
      requestId,
      ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
      name,
      municipality,
      requestType: t(
        `requests:request-type-${requestType}`,
        requestTypeDesc as string
      ),
      createdAt: moment(createdAt).format("MM.DD.yyyy"),
      status: (
        <div className="table-status">
          {getRequestStatus(
            status as RequestStatus,
            t(`requests:status.${status}`, statusDesc as string)
          )}
        </div>
      ),
      action: canReviewRequests && (
        <div
          key={id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
         
          {mustChangePassword && (
            
          <Popconfirm
                title={`${t(
                  "users:actions.send.confirmation.email",
                  "Resend email confirmation for {{dynamicValue}}",
                  { dynamicValue: name }
                )}`}
                onConfirm={() => onResendEmailConfirmation(contactPersonId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  className="btn-icon"
                  type="primary"
                  to="#"
                  shape="circle"
                >
                  <FeatherIcon icon={"mail"} size={25} />
                </Button>
              </Popconfirm>
          )}  

          <Button className="btn-icon" type="primary" to="#" shape="circle">
            <Link to={`/requests/${id}`}>
              {isListingArchivedRequests
                ? t("archived-requests:details", "Details")
                : t("requests:review", "Review")}
            </Link>
          </Button>
        </div>
      ),
    };
  });

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={
            isListingArchivedRequests
              ? t("archived-requests.title", "Archived Requests")
              : t("active-requests.title", "Active Requests")
          }
          subTitle={
            <>
              {requestsData?.totalCount}{" "}
              {isListingArchivedRequests
                ? t(
                    "dashboard:total-archived-requests",
                    "Total Archived Requests"
                  )
                : t("dashboard:total-active-requests", "Total Active Requests")}
            </>
          }
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"Request"}
              filterType={query.type}
              listArchived={isListingArchivedRequests}
              municipalityId={""}
              entityId={""}
              search={query.search}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />,
          ]}
       
        />
      </CardToolbox>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-nav">
                  <nav>
                    <ul>
                      {[...new Set(filterKeys)].map((item:any) => (
                        <li
                          key={item.id}
                          className={query?.type === item.id ? 'active' : 'deactivate'}
                        >
                          <Link
                            to="#"
                            onClick={() =>
                              setQuery({
                                ...query,
                                type: item.id,
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
                    patterns
                    placeholder={t(
                  "requests.search-placeholder",
                  "Search..."
                )}
                  />
                </div>
                
              </div>
            </ProjectSorting>
          </Col>
        </Row>

        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={requestsLoading}
                      dataSource={tableData}
                      columns={columns}
                      showSorterTooltip={false}
                      rowKey="key"
                      pagination={{
                        pageSize: query.pageSize,
                        current: requestsData.pageIndex,
                        total: requestsData.totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        onChange: onPaginationChange,
                        onShowSizeChange: onShowSizeChange,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                      onChange={(_, __, sorter) => onSorterChange(sorter)}
                    />
                  </TableWrapper>
                </div>
              </ProfileTableStyleWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
};
