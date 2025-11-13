import { Col, Input, Popconfirm, Row, Table, Tooltip } from "antd";
import {
  OrganizationsApi,
  OrganizationsApiApiOrganizationsGetRequest,
  RequestsApi,
} from "api/api";
import { OrganizationDto, OrganizationDtoPaginatedList } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  Main,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import openNotificationWithIcon from "utility/notification";
import OrdinalNumber from "components/common/OrdinalNumber";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { useTableSorting } from "hooks/useTableSorting";
import { ProjectHeader, ProjectSorting } from "pages/localization/email/style";
import { sortDirections } from "constants/constants";
import { InviteCarriersModal } from "./InviteCarriersModal";
import { ListTransportManagementDtoPaginatedList } from "api/models/list-transport-management-dto-paginated-list";

const requestsApi = new RequestsApi();

const initialData = {
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

  const [transportDetails, setTransportDetails] =
    useState<ListTransportManagementDtoPaginatedList | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  //  Use useTableSorting hook
  const { onSorterChange, sorting } = useTableSorting();
  
  const [modalState, setModalState] = useState<ModalStateType>({
    addModalVisible: false,
    editModalVisible: false,
    institutionToEdit: null,
  });

  //  Simple query state 
  const [query, setQuery] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  //  Fetch on query or sorting change 
  useEffect(() => {
    if (transportRequestId) {
      fetchRequestDetails();
    }
  }, [query, sorting, transportRequestId]);

  // onSearchChange pattern 
  const onSearchChange = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQuery({ ...query, pageNumber: 1, search: value });
    }, 300);
  };

  //  pagination handlers
  const onPaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  //  Fetch function 
  const fetchRequestDetails = async () => {
    try {
      setLoadingDetails(true);
      const response = await requestsApi.apiTransportManagementInvitedCarrierListGet({
        transportRequestId,
        search: query.search,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        ...sorting, 
      });
      setTransportDetails(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateInstitutionClick = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      addModalVisible: true,
      editModalVisible: false,
    }));
  }, []);

  const handleDeleteInstitutionClick = useCallback(
    async (
      transportRequestId: string | undefined,
      transportCarrierId: string | undefined
    ) => {
      try {
        if (!transportRequestId || !transportCarrierId) {
          console.error("Missing required parameters");
          return;
        }

        await requestsApi.apiTransportManagementDeleteInvitedCarriers({
          transportRequestId,
          transportCarrierId,
        });

        openNotificationWithIcon(
          "success",
          t("institutions:success-deleted", "Carrier deleted successfully!")
        );

        //  Refresh after delete
        fetchRequestDetails();
      } catch (err) {
        console.log("Error while deleting carrier: ", err);
        openNotificationWithIcon(
          "error",
          t("institutions:delete-error", "Failed to delete carrier")
        );
      }
    },
    [t, transportRequestId]
  );

  const hideInstitutionModal = useCallback(() => {
    setModalState({
      institutionToEdit: null,
      addModalVisible: false,
      editModalVisible: false,
    });
  }, []);

  const columns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "_ordinalNumber",
      key: "_ordinalNumber",
      sorter: false,
      width: 80,
    },
    {
      title: t("global.purchaser-name", "Purchaser Name"),
      dataIndex: "shipperName",
      key: "shipperName",
      // sorter: true,
      // sortDirections,
    },
    {
      title: t(
        "invited-carriers:table.title.invited-carriers",
        "Invited Carriers"
      ),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.status", "Status"),
      dataIndex: "statusDesc",
      key: "invitationStatus",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "90px",
      align: "center" as const,
    },
  ];

  const tableData = (transportDetails?.items ?? []).map((item) => {
    return {
      key: item.id,
      carrierId: item.id,
      _ordinalNumber: <OrdinalNumber value={item.ordinalNumber} />,
      shipperName: item.shipperName,
      name: item.organizationName,
      statusDesc: item.invitationStatusDesc,
      action: (
        <div
          className="table-actions"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          {hasPermission("invited-carrier:delete") && item.status == 1 &&(
          <Popconfirm
            title={t(
              "institutions.delete-invite-carrier",
              "Are you sure delete this Carrier?"
            )}
            onConfirm={() =>
              handleDeleteInstitutionClick(transportRequestId, item.id)
            }
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
          )}
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
          subTitle={
            <>
              {transportDetails?.totalCount || 0}{" "}
              {t(
                "invited-carriers:total-invited-carriers",
                "Total Invited Carriers"
              )}
            </>
          }
          buttons={[
            hasPermission("invited-carrier:add") && (
              <Button
                onClick={handleCreateInstitutionClick}
                className="btn-add_new"
                type="primary"
                key="add-language"
              >
                {t("invited-carriers:add", "+ Invite Carrier")}
              </Button>
            ),
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
                    onSearch={onSearchChange}
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
                        current: transportDetails?.pageIndex || 1,
                        total: transportDetails?.totalCount || 0,
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
        isVisible={modalState.addModalVisible}
        onHide={hideInstitutionModal}
        transportRequestId={transportRequestId}
        getInvitedUsers={fetchRequestDetails}
      />
    </>
  );
};
