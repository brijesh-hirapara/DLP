import { Col, Popconfirm, Row, Skeleton, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import { RefrigerantTypesApi } from "api/api";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { PageHeader } from "../../components/page-headers/page-headers";
import { CardToolbox, Main, TopToolBox } from "../../container/styled";
import { sortDirections } from "constants/constants";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { useTableSorting } from "hooks/useTableSorting";
import { CreateRefrigerantModal } from "pages/refrigerants/components/CreateRefrigerantModal";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import openNotificationWithIcon from "utility/notification";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const refrigerantTypesApi = new RefrigerantTypesApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortings?: any[];
};

type StateType = {
  addModalVisible?: boolean;
  itemForEditModal?: any | null;
};

function RefrigerantPage() {
  const { t } = useTranslation();
  const [refrigerantData, setRefrigerantData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] = useState<RequestStateType>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const [modalsState, setModalsState] = useState<StateType>({
    addModalVisible: false,
    itemForEditModal: null,
  });

  useEffect(() => {
    getRefrigerants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const getRefrigerants = async () => {
    setIsLoading(true);

    const { data }: { data: unknown } =
      await refrigerantTypesApi.apiRefrigerantTypesGet({
        ...request,
        ...sorting,
      });
    setRefrigerantData(data as any[]);
    setIsLoading(false);
  };

  const closeModal = () => {
    setModalsState({
      addModalVisible: false,
      itemForEditModal: null,
    });
  };

  const handleCreateClick = () => {
    setModalsState({
      addModalVisible: true,
    });
  };

  const handleEditPress = (item: any) => () => {
    setModalsState({
      itemForEditModal: item,
    });
  };

  const handleDeletePress = (item: any) => async () => {
    try {
      await refrigerantTypesApi.apiRefrigerantTypesIdDelete({ id: item?.id });
      openNotificationWithIcon(
        "success",
        t(`refrigerant:success-deleted"`, `Refrigerant deleted successfully!`)
      );
      getRefrigerants();
    } catch (err) { }
  };

  const handleSuccessAddOrEdit = () => {
    closeModal();
    getRefrigerants();
  };

  const onSearchChange = (value: string) => {
    setRequest({ ...request, search: value, pageNumber: 1 });
  };

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const refrigerantTableColumns: ColumnsType<any> = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("refrigerant:table.title.name", "Name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "refrigerant:table.title.ashrae-designation",
        "ASHRAE Designation"
      ),
      dataIndex: "ashraeDesignation",
      key: "ashraeDesignation",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "refrigerant:table.title.type-of-cooling-fluid",
        "Type of Cooling Fluid"
      ),
      dataIndex: "typeOfCoolingFluid",
      key: "typeOfCoolingFluid",
      sorter: true,
      sortDirections,
    },
    {
      title: t(
        "refrigerant:table.title.global-warming-potential",
        "Global Warming Potential"
      ),
      dataIndex: "globalWarmingPotential",
      key: "globalWarmingPotential",
      sorter: true,
      sortDirections,
    },
    {
      title: "",
      render: (item: any) => (
        <div
          key={item.id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {hasPermission('refrigeration-systems:edit') ? (
              <Tooltip title={t("global:edit", "Edit")}>
            <Button className="btn-icon" type="primary" to="#" shape="circle">
              <Link onClick={handleEditPress(item)} to="#" title={t("global:edit", "Edit")}>
                <FeatherIcon icon="edit" size={16} />
              </Link>
            </Button>
            </Tooltip>
          ) : null}
          <>
            <Popconfirm
              title={t(
                "refrigerant:delete-confirmation",
                "Are you sure delete this Refrigerant?"
              )}
              onConfirm={handleDeletePress(item)}
              okText={t("global.yes", "Yes")}
              cancelText={t("global.no", "No")}
            >
              {hasPermission('refrigeration-systems:delete') ? (
                  <Tooltip title={t("global.delete", "Delete")}>
                <Button className="btn-icon" type="danger" to="#" shape="circle">
                   <Link to="#" title={t("global.delete", "Delete")} >
                      <FeatherIcon icon="trash-2" size={16} />
                    </Link>
                </Button>
                </Tooltip>
              ) : null}
            </Popconfirm>
          </>
        </div>
      ),
    },
  ];

  const isInitialLoading = !refrigerantData?.items && isLoading;

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("refrigerant:title", "Refrigerant")}
          buttons={[
            <ExportButtonPageApiHeader key="1" callFrom={'Refrigerant'} filterType={0}  municipalityId={""}
            entityId={""} search={request.search}  typeOfEquipmentId={""} from={""} to={""}/>,
            hasPermission("refrigeration-systems:add") && (
              <Button
                onClick={handleCreateClick}
                className="btn-add_new"
                size="default"
                type="primary"
                key="add-codebook"
              >
                {t("refrigeration:create", "Add Refrigeration")}
              </Button>
            ),
          ]}
        />
      </CardToolbox>

      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox>
                <Row gutter={15}>
                  <Col lg={14} md={14} xs={24}>
                    <div className="table-search-box">
                      <AutoComplete
                        onSearch={onSearchChange}
                        placeholder={t(
                          "refrigerant:search.placeholder",
                          "Search Refrigerants ..."
                        )}
                        patterns
                      />
                    </div>
                  </Col>
                </Row>
              </TopToolBox>
            </Col>
          </Row>
          <Row gutter={0}>
            <TableWrapper className="table-responsive">
              {isInitialLoading ? (
                <Cards headless>
                  <Skeleton active paragraph={{ rows: 5 }} />
                </Cards>
              ) : (
                <Table
                  dataSource={refrigerantData?.items}
                  columns={refrigerantTableColumns}
                  showSorterTooltip={false}
                  loading={isLoading}
                  pagination={{
                    pageSize: refrigerantData?.pageSize,
                    current: refrigerantData?.pageIndex,
                    total: refrigerantData?.totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 50, 100, 1000],
                    onChange: handlePaginationChange,
                    onShowSizeChange: onShowSizeChange,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  onChange={(_, __, sorter) => onSorterChange(sorter)}
                />
              )}
            </TableWrapper>
          </Row>
        </Cards>
      </Main>
      <CreateRefrigerantModal
        isVisible={Boolean(modalsState.addModalVisible)}
        onHide={closeModal}
        onSuccess={handleSuccessAddOrEdit}
      />
      <CreateRefrigerantModal
        isVisible={Boolean(modalsState.itemForEditModal)}
        onHide={closeModal}
        onSuccess={handleSuccessAddOrEdit}
        refrigerantToEdit={modalsState.itemForEditModal}
      />
    </>
  );
}

export default RefrigerantPage;
