import { Col, Input, Popconfirm, Row, Table, Tooltip, Radio, RadioChangeEvent, Select } from "antd";
import {
  OrganizationsApi,
  OrganizationsApiApiOrganizationsGetRequest,
} from "api/api";
import { OrganizationDto, OrganizationDtoPaginatedList, RequestTypeNew } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  CardToolbox,
  Main,
  ProfileTableStyleWrapper,
  TableWrapper,
  TopToolBox,
} from "container/styled";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CreateInstitutionModal } from "pages/institutions/components/CreateInstitutionModal";
import { ViewCompanyModal } from "./components/ViewCompanyModal";
import openNotificationWithIcon from "utility/notification";
import InstitutionAdminFilters from "pages/institutions/components/InstitutionAdminFilters";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import OrdinalNumber from "components/common/OrdinalNumber";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { UserFilterType } from "api/models";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { NavLink } from "react-router-dom";
import path from "path";
import { useTableSorting } from "hooks/useTableSorting";
import { ProjectHeader, ProjectSorting, ProjectToolbarWrapper } from "pages/localization/email/style";
import moment from "moment";
import { formatDate } from "api/common";
import { sortDirections } from "constants/constants";

interface ExtendedQuery extends OrganizationsApiApiOrganizationsGetRequest {
  filterType?: number;
  companyType?: string;
  type?:number
}

const organizationsApi = new OrganizationsApi();

const intialData = {
  hasNextPage: false,
  hasPreviousPage: false,
  items: [],
  pageIndex: 1,
  totalCount: 0,
  totalPages: 0,
};

type ModalStateType = {
  addModalVisible: boolean;
  editModalVisible: boolean;
  institutionToEdit: OrganizationDto | null;
};


export const InstitutionsPage = () => {
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();

  const [institutionsData, setInstitutionsData] =
    useState<OrganizationDtoPaginatedList>(intialData);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
  // const { sorting, onSorterChange } = useTableSorting();
  const { onSorterChange, sorting } = useTableSorting();
  const [modalState, setModalState] = useState<ModalStateType>({
    addModalVisible: false,
    editModalVisible: false,
    institutionToEdit: null,
  });
  const [query, setQuery] = useState<ExtendedQuery>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
    type: RequestTypeNew.ALL, // default filter
  });

  const filterKeys = [
    { id: RequestTypeNew.ALL, name: t("global.all", "All") },
    { id: RequestTypeNew.RegistraterAsShipper, name: t("company.shipper", "Shipper") },
    { id: RequestTypeNew.RegistraterAsCarrier, name: t("company.carrier", "Carrier") },
  ].filter(Boolean);


  const [request, setRequest] = useState({
    filterType: filterKeys,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  // const filterKeys = [
  //   { id: UserFilterType.ACTIVE, name: t("users:select.active", "Active") },
  //   { id: UserFilterType.PENDING, name: t("users:select.pending", "Pending") },
  //   hasPermission("users:list-deactivated") ? { id: UserFilterType.DISABLED, name: t("users:select.disabled", "Disabled") } : null,
  //   { id: UserFilterType.DELETED, name: t("users:select.deleted", "Deleted") },
  //   { id: UserFilterType.ALL, name: t("users:select.all", "All") },
  // ].filter(Boolean) as { id: UserFilterType; name: string }[];



  useEffect(() => {
    fetchInstitutions();
  }, [query,sorting]);

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

  const fetchInstitutions = async () => {
    try {
      setInstitutionsLoading(true);
      const response = await organizationsApi.apiOrganizationsGet({...query,...sorting});

      setInstitutionsData(response.data);
    } catch (err) {
    } finally {
      setInstitutionsLoading(false);
    }
  };

  const handleCreateInstitutionClick = () => {
    setModalState((prev) => ({
      ...prev,
      addModalVisible: true,
      
      editModalVisible: false,
    }));
  };

  const handleEditClick = (institution: OrganizationDto,IsEdit:any) => () => {
    setModalState((prev) => ({
      ...prev,
      editModalVisible: true,
      institutionToEdit: institution,
    }));
  };

  const onChangeQuery = (query: OrganizationsApiApiOrganizationsGetRequest) => {
    setQuery((prevQuery) => ({ ...prevQuery, ...query }));
  };

  const handleDeleteInstitutionClick = async (id: string | undefined) => {
    try {
      if (!id) return;
      await organizationsApi.apiOrganizationsIdDelete({ id });
      openNotificationWithIcon(
        "success",
        t("institutions:success-deleted", "Institution deleted successfully!")
      );
      fetchInstitutions();
    } catch (err) {
      console.log({ err });
    }
  };

  const onFilterChange = (e: any) => {
    setRequest({
      ...request,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    });
  };

  const handleSuccessAddEditInstitution = () => {
    hideInstitutionModal();
    fetchInstitutions();
  };

  const hideInstitutionModal = () => {
    setModalState({
      institutionToEdit: null,
      addModalVisible: false,
      editModalVisible: false,
    });
  };

  const onChange: (e: RadioChangeEvent) => void = (e) => {
    setQuery((prev) => ({
      ...prev,
      filterType: e.target.value,
      pageNumber: 1,
      pageSize: 10,
    }));
  };

  const getRequestStatus = (request: any, statusDesc: string) => {
    let color = "deactivate";

    if (request === 2) {
      color = "blocked";
    } else if (request === 1) {
      color = "active";
    }
    return <span className={`ant-tag ${color}`}>{statusDesc}</span>;
  };

  const columns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "_ordinalNumber",
      key: "_ordinalNumber",
      sorter: false,
    },
    {
      title: t("global.dateOfRegistration", "Date of Registration"),
      dataIndex: "dateOfRegistration",
      key: "dateOfRegistration",
    },
    {
      title: t("global.companyName", "Company Name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections
    },
    {
      title: t("global.companyType", "Company Type"),
      dataIndex: "typeDesc",
      key: "type",
      sorter: true,
      sortDirections
    },
    {
      title: t("global.companyAdministrator", "Company Administrator"),
      dataIndex: "companyAdministrator",
      key: "companyAdministrator",
    },
    {
      title: t("global.otherUsers", "Other Users"),
      dataIndex: "otherUsers",
      key: "otherUsers",
    },
    {
      title: t("global.status", "Status"),
      dataIndex: "statusDesc",
      key: "status",
      sorter: true,
      sortDirections
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "90px",
      style: {
        background: "red",
      },
    },
  ];

  const tableData = (institutionsData?.items ?? []).map(
    (item: OrganizationDto) => {
      const { id, ordinalNumber, name, type, contactPersonFirstName, contactPersonLastName, dateOfRegistration, status, companyAdministrator, otherUsers } = item;
      const formatUsers = (users?: { fullName?: string | null; isActive?: boolean }[] | null) => {
        const userArray = users ?? []; // default to empty array
        if (userArray.length === 0) return "-";
      
        const visibleUsers = userArray.slice(0, 2);
        const remainingUsers = userArray.slice(2);
      
        return (
          <>
            {visibleUsers.map((user, index) => (
              <div key={index}>
                {user.fullName} - {user.isActive ? "Active" : "Deactivated"}
              </div>
            ))}
            {remainingUsers.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {remainingUsers.map((user, index) => (
                      <div key={index}>
                        {user.fullName} - {user.isActive ? "Active" : "Deactivated"}
                      </div>
                    ))}
                  </div>
                }
              >
                <div>+{remainingUsers.length} more</div>
              </Tooltip>
            )}
          </>
        );
      };
      

      return {
        key: id,
        ordinalNumber: ordinalNumber,
        dateOfRegistration: formatDate(dateOfRegistration),
        _ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
        name,
        contactPersonFirstName,
        contactPersonLastName,
        typeDesc: type === 1 ? "Shipper" : type === 2 ? "Carrier" : "",
        statusDesc: (
          <div className="table-status">
            {getRequestStatus(
              status as any,
              t(`companies:status.${status}`, status === 1 ? "ACTIVE" : "DEACTIVATED")
            )}
          </div>
        ) as unknown as string,
        companyAdministrator: formatUsers(companyAdministrator),
        otherUsers: formatUsers(otherUsers),

        action: (
          <div
            key={id}
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title={t("global:view", "View")}>
              <Button className="btn-icon" type="primary" to="#" shape="circle" >
                <Link onClick={handleEditClick(item,false)} to="#" title={t("global:view", "View")}>
                  <FeatherIcon icon="eye" size={16} />
                </Link>
              </Button>
            </Tooltip>
            {hasPermission("manage-companies:delete") ? (
              <>
                <Popconfirm
                  title={t(
                    "institutions.delete-company-confirmation",
                    "Are you sure delete this Company?"
                  )}
                  onConfirm={() => handleDeleteInstitutionClick(id)}
                  okText={t("global.yes", "Yes")}
                  cancelText={t("global.no", "No")}
                >
                  <Tooltip title={t("global.delete", "Delete")}>
                    <Button
                      className="btn-icon"
                      type="danger"
                      to="#"
                      shape="circle"

                    >
                      <Link to="#" title={t("global.delete", "Delete")}>
                        <FeatherIcon icon="trash-2" size={16} />
                      </Link>
                      {/* <FeatherIcon icon="trash-2" size={16}  /> */}
                    </Button>
                  </Tooltip>
                </Popconfirm>
              </>
            ) : null}
          </div>
        ),
      };
    }
  );

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("companies.title", "Companies")}
          subTitle={<>{institutionsData?.totalCount} {t("dashboard:total-companies", "Total Companies")}</>}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"Companies"}
              filterType={0}
              municipalityId={query.municipalityId}
              entityId={query.entityId}
              search={query.search}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />,
            hasPermission("manage-companies:add") && (
              <Button
                onClick={handleCreateInstitutionClick}
                className="btn-add_new"
                type="primary"
                key="add-language"
              >
                {t("manage-companies:add", "+ Add New Company")}
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
                  "global.search-placeholder",
                  "Search..."
                )}
                  />
                </div>
                {/* <div className="project-sort-group">
                  <div className="sort-group">
                    <span>{t("users:sort.label", "Sort By:")}</span>
                    <Select
                      options={sortingOptions}
                      placeholder={t("users:sort.sort", "Select sort")}
                      onChange={(value) => {
                        const [field, order] = value.split("_");
                        setRequest((prev) => ({ ...prev, pageNumber: 1 }));
                      }}
                    />
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
                {/* <div className="project-sort-group">
                  <div className="sort-group">
                    <span>{t("users:sort.label", "Sort By:")}</span>
                    <Select defaultValue="category">
                      <Select.Option value="category">
                        Companies Type
                      </Select.Option>
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

        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={institutionsLoading}
                      dataSource={tableData}
                      columns={columns}
                      showSorterTooltip={false}
                      rowKey="key"
                      pagination={{
                        pageSize: query.pageSize,
                        current: institutionsData.pageIndex,
                        total: institutionsData.totalCount,
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

      {/* <CreateInstitutionModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.addModalVisible}
        onHide={hideInstitutionModal}
        onSubmitSuccess={handleSuccessAddEditInstitution}
      />
      <CreateInstitutionModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.editModalVisible}
        onHide={hideInstitutionModal}
        onSubmitSuccess={handleSuccessAddEditInstitution}
        institutionToEdit={modalState.institutionToEdit}
      />

      <ViewCompanyModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.addModalVisible}
        onHide={hideInstitutionModal}
      //onSubmitSuccess={handleSuccessAddEditInstitution}
      />
      <ViewCompanyModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.editModalVisible}
        onHide={hideInstitutionModal}
        // onSubmitSuccess={handleSuccessAddEditInstitution}
        institutionToEdit={modalState.institutionToEdit}
      /> */}


      <CreateInstitutionModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.addModalVisible}
        onHide={hideInstitutionModal}
        onSubmitSuccess={handleSuccessAddEditInstitution}
      />
      <CreateInstitutionModal
        id={modalState.institutionToEdit?.id}
        isVisible={modalState.editModalVisible}
        onHide={hideInstitutionModal}
        onSubmitSuccess={handleSuccessAddEditInstitution}
        institutionToEdit={modalState.institutionToEdit}
      />
    </>
  );
};
