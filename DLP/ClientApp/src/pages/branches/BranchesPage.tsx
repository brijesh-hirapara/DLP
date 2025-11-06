import { Col, Popconfirm, Row, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  CardToolbox,
  Main,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { Link } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import {
  CompanyBranchDto,
  CompanyBranchDtoOrdinalPaginatedList,
  CompanyBranchesApi,
  CompanyBranchesApiApiCompanyBranchesGetRequest,
} from "../../api";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CreateBranchesModal } from "./components/CreateBranchesModal";
import InstitutionAdminFilters from "pages/institutions/components/InstitutionAdminFilters";
import { hasPermission } from "utility/accessibility/hasPermission";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import OrdinalNumber from "components/common/OrdinalNumber";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const companyBranchesApi = new CompanyBranchesApi();

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
  companyBranchToEdit: CompanyBranchDto | null;
};

const Branches = () => {
  const { t } = useTranslation();

  const [branchesData, setBranchesData] =
    useState<CompanyBranchDtoOrdinalPaginatedList>(intialData);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalStateType>({
    addModalVisible: false,
    editModalVisible: false,
    companyBranchToEdit: null,
  });
  const [query, setQuery] =
    useState<CompanyBranchesApiApiCompanyBranchesGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
    });

  useEffect(() => {
    fetchBranches();
  }, [query]);

  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const response = await companyBranchesApi.apiCompanyBranchesGet(query);
      setBranchesData(response.data);
    } catch (err) {
    } finally {
      setBranchesLoading(false);
    }
  };

  const onPaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const handleCreateCompanyBranchClick = () => {
    setModalState((prev) => ({
      ...prev,
      addModalVisible: true,
      editModalVisible: false,
    }));
  };

  const handleEditClick = (companyBranch: CompanyBranchDto) => () => {
    setModalState((prev) => ({
      ...prev,
      editModalVisible: true,
      companyBranchToEdit: companyBranch,
    }));
  };

  const handleDeleteCompanyBranchClick = async (id: string | undefined) => {
    try {
      if (!id) return;
      await companyBranchesApi.apiCompanyBranchesIdDelete({ id });
      openNotificationWithIcon(
        "success",
        t("branches:success-deleted", "Company Branch is deleted successfully!")
      );
      fetchBranches();
    } catch (err) {
      console.log({ err });
    }
  };

  const handleSuccessAddEditCompanyBranch = () => {
    hideCompanyBranchModal();
    fetchBranches();
  };

  const hideCompanyBranchModal = () => {
    setModalState({
      companyBranchToEdit: null,
      addModalVisible: false,
      editModalVisible: false,
    });
  };

  const onChangeQuery = (
    query: CompanyBranchesApiApiCompanyBranchesGetRequest
  ) => {
    setQuery((prevQuery) => ({ ...prevQuery, ...query }));
  };

  const [tableColumns] = useState([
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("branch.office.name", "Branch Office Name"),
      dataIndex: "branchOfficeName",
      key: "branchOfficeName",
    },
    {
      title: t("global:municipality", "Municipality"),
      key: "municipality",
      dataIndex: "municipality",
    },
    {
      title: t("branch.office.email", "Email"),
      dataIndex: "email",
      key: "email",
    },

    {
      title: t("branch.office.contactPerson", "Contact Person"),
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: t("branch.office.contactPhone", "Contact Phone"),
      dataIndex: "contactPhone",
      key: "contactPhone",
      border: "1px solid red",
    },
    {
      title: t("branch.office.place", "Place"),
      dataIndex: "place",
      key: "place",
      border: "1px solid red",
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
  ]);

  const tableData = (branchesData?.items ?? []).map(
    (item: CompanyBranchDto) => {
      const {
        id,
        ordinalNumber,
        address,
        branchOfficeName,
        contactPerson,
        contactPhone,
        email,
        idNumber,
        place,
        municipality,
      } = item;
      return {
        key: id,
        ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
        branchOfficeName,
        idNumber,
        address,
        contactPerson,
        email,
        municipality,
        contactPhone,
        place,
        action: (
          <div
            key={id}
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
             <Tooltip title={t("global:edit", "Edit")}>
            <Button className="btn-icon" type="primary" to="#" shape="circle" >
              <Link onClick={handleEditClick(item)} to="#" title={t("global:edit", "Edit")}>
                <FeatherIcon icon="edit" size={16} />
              </Link>
            </Button>
            </Tooltip>
            <>
              <Popconfirm
                title={t(
                  "companyBranch.delete-confirmation",
                  "Are you sure delete this Company Branch?"
                )}
                onConfirm={() => handleDeleteCompanyBranchClick(id)}
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
    }
  );

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("company-branch.title", "Company Branches")}
          buttons={[
           
              <ExportButtonPageApiHeader  key="1" callFrom={'Branches'} filterType={0} municipalityId={query.municipalityId} entityId={query.entityId} search={query.search} typeOfEquipmentId={""} from={""} to={""}/>,
              hasPermission("branches:add") && (
                <Button
                  onClick={handleCreateCompanyBranchClick}
                  className="btn-add_new"
                  type="primary"
                  key="add-language"
                >
                  {t("company-branch.add", "+ Add New Company Branch")}
                </Button>
              )
          ]}
          subTitle={<InstitutionAdminFilters onChangeQuery={onChangeQuery} />}
        />
      </CardToolbox>

      <Main>
        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={branchesLoading}
                      dataSource={tableData}
                      columns={tableColumns}
                      rowKey="key"
                      pagination={{
                        pageSize: query.pageSize,
                        current: branchesData.pageIndex,
                        total: branchesData.totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        onChange: onPaginationChange,
                        onShowSizeChange: onShowSizeChange,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                      }}
                    />
                  </TableWrapper>
                </div>
              </ProfileTableStyleWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>

      <CreateBranchesModal
        isVisible={modalState.addModalVisible}
        onHide={hideCompanyBranchModal}
        onSubmitSuccess={handleSuccessAddEditCompanyBranch}
      />

      <CreateBranchesModal
        isVisible={modalState.editModalVisible}
        onHide={hideCompanyBranchModal}
        onSubmitSuccess={handleSuccessAddEditCompanyBranch}
        branchToEdit={modalState.companyBranchToEdit}
      />
    </>
  );
};

export default Branches;
