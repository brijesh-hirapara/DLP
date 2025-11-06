import { Col, Input, Radio, Row, Select } from "antd";
import { UsersApi } from "api/api";
import { UserFilterType } from "api/models";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { Cards } from "components/cards/frame/cards-frame";
import { useAuthorization } from "hooks/useAuthorization";
import { useTableSorting } from "hooks/useTableSorting";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { Button } from "../../components/buttons/buttons";
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main, TopToolBox } from "../../container/styled";
import UsersTable from "./UsersTable";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import openNotificationWithIcon from "utility/notification";
import { NavLink } from "react-router-dom";
import path from "path";
import FeatherIcon from "feather-icons-react";
import { ProjectHeader, ProjectSorting } from "pages/localization/email/style";


const usersApi = new UsersApi();

const UsersPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuthorization();

  const filterKeys = [
    { id: UserFilterType.ALL, name: t("users:select.all", "All") },
    { id: UserFilterType.ACTIVE, name: t("users:select.active", "Active") },
    {
      id: UserFilterType.PENDING,
      name: t("users:select.not-confirmed", "Not Confirmed"),
    },
    hasPermission("users:list-deactivated") && {
      id: UserFilterType.DISABLED,
      name: t("users:select.disabled", "Disabled"),
    },
    { id: UserFilterType.DELETED, name: t("users:select.deleted", "Deleted") },
  ].filter(Boolean);

  const [usersData, setUsersData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { sorting, onSorterChange } = useTableSorting({
    field: 'name',
    order: 'asc',
  });

  const [request, setRequest] = useState({
    filterType: UserFilterType.ACTIVE,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const sortingOptions = [
    { label: t("users:sort.newest", "Newest"), value: "createdAt_desc" },
    { label: t("users:sort.oldest", "Oldest"), value: "createdAt_asc" },
    { label: t("users:sort.name-asc", "Name A-Z"), value: "name_asc" },
    { label: t("users:sort.name-desc", "Name Z-A"), value: "name_desc" },
  ];


  useEffect(() => {
    if (request)
      getUsers();
  }, [request, sorting]);

  const getUsers = async () => {
    setIsLoading(true);
    const { data } = await usersApi.usersListGet({ ...request, ...sorting });
    setUsersData(data);
    setIsLoading(false);
  };

  const onFilterChange = (e) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const onclickNotConfirmedEmailSend = async () => {
    setIsLoading(true);
    const response = await usersApi.usersNotConfirmationPost();
    if (response.status === 200) {
      openNotificationWithIcon(
        "success",
        t("users:notification.resend-confirmation-emails", "Successfully Resend Confirmation Emails"),
      );
    } else {
      openNotificationWithIcon(
        "error",
        t("users:notification.resend-confirmation-error", "Faild to Resend Confirmation Emails"),
      );
    }
    setIsLoading(false);
  }

  const onSearchChange = (value) => {
    setRequest({ ...request, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  return (
    <>
      {/* <CardToolbox> */}
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("users:users-title", "Users Management")}
          subTitle={<>{usersData?.totalCount} {t("dashboard:total-users", "Total Users")}</>}
          buttons={[

            <ExportButtonPageApiHeader key="1" callFrom={'User'} filterType={request.filterType} municipalityId={""} entityId={""} search={request.search} />,
            hasPermission("users:add") && (
              <Button
                className="btn-add_new"
                size="default"
                type="primary"
                key="btn_2"
              >
                <Link to="/users/create">
                  {t("users:button.add", "+ Add New User")}
                </Link>
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
                          className={request?.filterType === item.id ? 'active' : 'deactivate'}
                        >
                          <Link
                            to="#"
                            onClick={() =>
                              setRequest({
                                ...request,
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

                {/* </Col> */}
                {/* {request.filterType === UserFilterType.PENDING && hasPermission('users:resend-confirmation-mails') && (<Col lg={6} md={6} xs={24} style={{ display: 'flex', justifyContent: 'end' }}>
                  <Button
                    className="btn-add_new"
                    size="default"
                    onClick={onclickNotConfirmedEmailSend}
                    type="primary"
                    key="btn_2"
                  >
                    Resend Confirmation Emails
                  </Button>
                </Col>)} */}
                <div className="project-sort-search">
                  <AutoComplete
                    onSearch={(value) => onSearchChange(value)}
                    // width="100%"
                    patterns
                    placeholder={t(
                  "global.auto-complete-placeholder",
                  "Search..."
                )}
                  />
                </div>
                {/* <div className="project-sort-group">
                  <div className="sort-group">
                    <span>{t("users:sort.label", "Sort By:")}</span>
                    <Select defaultValue="category">
                      <Select.Option value="category">Name</Select.Option>
                      <Select.Option value="rate">Top Rated</Select.Option>
                      <Select.Option value="popular">Popular</Select.Option>
                      <Select.Option value="time">Newest</Select.Option>
                      <Select.Option value="price">Price</Select.Option>
                    </Select>
                    <div className="layout-style">
                      <NavLink to={`${path}/grid`}>
                        <FeatherIcon icon="grid" size={16} />
                      </NavLink>
                      <NavLink to={`${path}/list`}>
                        <FeatherIcon icon="list" size={16} />
                      </NavLink>
                    </div>
                  </div>
                </div> */}

              </div>


            </ProjectSorting>
          </Col>
        </Row>
        {/* </CardToolbox> */}

        <Row gutter={25}>
          <Col xs={24}>
            <Cards headless>

              <UsersTable
                data={usersData}
                isLoading={isLoading}
                onPaginationChange={(val) => onPaginationChange(val)}
                onShowSizeChange={(pageNumber, pageSize) => onShowSizeChange(pageNumber, pageSize)}
                onSorterChange={(val) => onSorterChange(val)}
                refetch={() => getUsers()}
              />
            </Cards>
          </Col>
        </Row>
      </Main>

    </>
  );
}

export default UsersPage;
