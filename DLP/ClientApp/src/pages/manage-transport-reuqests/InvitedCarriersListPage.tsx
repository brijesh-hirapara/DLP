import { Col, Input, Popconfirm, Row, Table, Tooltip, Radio, RadioChangeEvent, Select } from "antd";
import {
  OrganizationsApi,
  OrganizationsApiApiOrganizationsGetRequest,
  RequestsApi,
} from "api/api";
import { OrganizationDto, OrganizationDtoPaginatedList, } from "api/models";
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
import { Link, useParams } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CreateInstitutionModal } from "pages/institutions/components/CreateInstitutionModal";
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
import { InviteCarriersModal } from "./InviteCarriersModal";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";

const requestsApi = new RequestsApi();
interface ExtendedQuery extends OrganizationsApiApiOrganizationsGetRequest {
  companyType?: string;
  type?:number
  transportRequestId?: string;
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


export const InvitedCarriersListPage = () => {
  const { transportRequestId } = useParams();
  const { t } = useTranslation();
  const searchTimeout = useRef<any>();

  const [institutionsData, setInstitutionsData] =
    useState<OrganizationDtoPaginatedList>(intialData);
  const [institutionsLoading, setInstitutionsLoading] = useState(false);
    const [transportDetails, setTransportDetails] =
      useState<ListTransportManagementDtoPaginatedList | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
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
    transportRequestId,
  });


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

  const handleCreateInstitutionClick = () => {
    setModalState((prev) => ({
      ...prev,
      addModalVisible: true,
      
      editModalVisible: false,
    }));
  };

  const onChangeQuery = (query: OrganizationsApiApiOrganizationsGetRequest) => {
    setQuery((prevQuery) => ({ ...prevQuery, ...query }));
  };


 const fetchRequestDetails = async () => {
  setLoadingDetails(true);
  try {
    const response = await requestsApi.apiTransportManagementInvitedCarrierListGet({
      transportRequestId: transportRequestId, 
    });
    setTransportDetails(response.data);
  } catch (error) {
    console.error(error);  
  } finally {
    setLoadingDetails(false);
  }
};

useEffect(() => {
    if (transportRequestId) {
    setQuery(prev => ({ ...prev, transportRequestId }));
  }
  fetchRequestDetails(); 
}, [query.pageNumber, query.pageSize, query.search, transportRequestId]); 

  // const handleDeleteInstitutionClick = async (transportRequestId: string | undefined, transportCarrierId: string | undefined) => {
  //   try {
  //     if (!transportRequestId || !transportCarrierId) return;
  //     await requestsApi.apiTransportManagementDeleteInvitedCarriers({
  //     transportRequestId,
  //     transportCarrierId,
  //   });
  //     openNotificationWithIcon(
  //       "success",
  //       t("institutions:success-deleted", "Institution deleted successfully!")
  //     );
  //     fetchRequestDetails();
  //   } catch (err) {
  //     console.log({ err });
  //   }
  // };

  const handleDeleteInstitutionClick = async (
  transportRequestId: string | undefined,
  transportCarrierId: string | undefined
) => {
  try {
    // debugger
    if (!transportRequestId || !transportCarrierId) return;
 console.error("Missing required parameters", transportRequestId, transportCarrierId);
    await requestsApi.apiTransportManagementDeleteInvitedCarriers({
      transportRequestId,
      transportCarrierId,
    });

    openNotificationWithIcon(
      "success",
      t("institutions:success-deleted", "Carrier deleted successfully!")
    );

  
    fetchRequestDetails();
  } catch (err) {
    console.log("Error while deleting carrier: ", err);
  }
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
      title: t("global.shipperName", "Shipper Name"),
      dataIndex: "shipperName",
      key: "shipperName",
    },
    {
      title: t("invited-carriers:table.title.invited-carriers", "Invited Carriers"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections
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
const tableData = (transportDetails?.items ?? []).map((item) => {
  console.log(item)
  return {
    key: item.id,
    carrierId: item.id,
    _ordinalNumber: <OrdinalNumber value={item.ordinalNumber} />,
    shipperName: item.shipperName,
    name: item.organizationName,
    statusDesc:  item.invitationStatusDesc,
    action: (
      <div
        className="table-actions"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
              <>
                <Popconfirm
              title={t(
                "institutions.delete-invite-carrier",
                "Are you sure delete this Carrier?"
              )}
              onConfirm={() => handleDeleteInstitutionClick(transportRequestId, item.id)}
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
                  <FeatherIcon icon="trash-2" size={16} />
                </Button>
              </Tooltip>
            </Popconfirm>
              </>
      </div>
    ),
  };
});

  return (
    <>
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("invited-carriers.title", "Invited Carriers")}
          subTitle={<>{institutionsData?.totalCount} {t("invited-carriers:total-invited-carriers", "Total Invited Carriers")}</>}
          buttons={[
            hasPermission("manage-companies:add") && (
              <Button
                onClick={handleCreateInstitutionClick}
                className="btn-add_new"
                type="primary"
                key="add-language"
              >
                {t("invited-carriers:add", "+ Invite Carrier")}
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
                      loading={loadingDetails}
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

      <InviteCarriersModal
        // id={modalState.institutionToEdit?.id}
        isVisible={modalState.addModalVisible}
        onHide={hideInstitutionModal}
        transportRequestId={transportRequestId}
      />
    </>
  );
};
