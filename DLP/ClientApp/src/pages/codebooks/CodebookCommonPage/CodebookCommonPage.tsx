import { Col, Popconfirm, Row, Select, Table, Tooltip, Input } from "antd";
import { CodebookApi, CodebookApiApiCodebookByTypeGetRequest } from "api/api";
import {
  CodebookDto,
  CodebookDtoPaginatedList,
  CodebookTypeEnum,
} from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
  CardToolbox,
  Main,
  ProfilePageHeaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { useEffect, useState, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CreateCommonCodebookModal } from "pages/codebooks/CodebookCommonPage/CreateCommonCodebookModal";
import {
  codebookClaimNames,
  getCodebookTextsByType,
} from "pages/codebooks/CodebookCommonPage/data";
import { CodebookCommonPageProps } from "pages/codebooks/CodebookCommonPage/types";
import openNotificationWithIcon from "utility/notification";
import { ColumnsType } from "antd/lib/table";
import { sortDirections } from "constants/constants";
import { useTableSorting } from "hooks/useTableSorting";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { formatLabel } from "utility/utility";
import { NavLink } from "react-router-dom";
import path from "path";
import { useSelector, useDispatch } from "react-redux";
import { sortingProjectByCategory } from "redux/themeLayout/actionCreator";
import { SearchOutlined } from "@ant-design/icons";
import { Modal } from "../../../components/modals/antd-modals";
import { ProjectSorting, ProjectToolbarWrapper,ProjectHeader } from "pages/localization/email/style";
import { AutoComplete } from "../../../components/autoComplete/autoComplete";

const codebookApi = new CodebookApi();
const Grid = lazy(() => import("../../localization/email/Grid"));
const List = lazy(() => import("../../localization/email/List"));

type StateType = {
  addModalVisible?: boolean;
  itemForEditModal?: CodebookDto | null;
};
export const CodebookCommonPage = ({
  codebookType,
}: CodebookCommonPageProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const searchData = useSelector((state: any) => state.headerSearchData);
  const translatedTexts = getCodebookTextsByType(t, codebookType);
  const claimName = codebookClaimNames[codebookType];
  const { sorting, onSorterChange } = useTableSorting();
  const [request, setRequest] =
    useState<CodebookApiApiCodebookByTypeGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
    });
  const [codebookData, setCodebookData] = useState<CodebookDtoPaginatedList>({
    items: [],
  });

  const [codebookItemsLoading, setCodebookItemsLoading] = useState(false);
  const [modalsState, setModalsState] = useState<StateType>({
    addModalVisible: false,
    itemForEditModal: null,
  });

  const [state, setState] = useState({
    notData: searchData,
    visible: false,
    categoryActive: "all",
  });

  const onSorting = (selectedItems: any) => {
    dispatch(sortingProjectByCategory(selectedItems as any) as any );
  };

  useEffect(() => {
   
    fetchCodebookItems(codebookType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codebookType, sorting, request]);

  const fetchCodebookItems = async (type: CodebookTypeEnum) => {
    try {
      setCodebookItemsLoading(true);

     
      const response = await codebookApi.apiCodebookByTypeGet({
        type,
        ...request,
        ...sorting,
      });

      setCodebookData(response.data);
    } catch (error) {
    } finally {
      setCodebookItemsLoading(false);
    }
  };

  const handleAddClick = () => {
    setModalsState({
      addModalVisible: true,
    });
  };

  const handleEditClick = (item: CodebookDto) => {
    setModalsState({
      itemForEditModal: item,
    });
  };
  const handleSuccessAddOrEdit = () => {
    closeModal();
    fetchCodebookItems(codebookType);
  };
  const closeModal = () => {
    setModalsState({
      addModalVisible: false,
      itemForEditModal: null,
    });
  };

  const handleDeleteConfirm = async (id: string | undefined) => {
    try {
      if (!id) return;
      await codebookApi.apiCodebookIdDelete({ id });
      openNotificationWithIcon(
        "success",
        t(`${formatLabel(claimName)}:success-deleted"`, `${formatLabel(claimName)} deleted successfully!`)
      );
      fetchCodebookItems(codebookType);
    } catch (err) {}
  };

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

    const onSearchChange = (value : any) => {
    setRequest({ ...request, search: value });
  };


  const columns: ColumnsType<any> = [
    {
      title: t("global.name", "Name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  const tableData = (codebookData?.items ?? []).map((item) => {
    const { id, name } = item;

    return {
      key: id,
      name,
      action: (
        <div
          key={id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {hasPermission(`${claimName}:edit`) ? (
            <>
            <Tooltip title={t("global:edit", "Edit")}>
              <Button className="btn-icon" type="primary" to="#" shape="circle">
                <Link onClick={() => handleEditClick(item)} to="#" title={t("global:edit", "Edit")}> 
                  <FeatherIcon icon="edit" size={16} />
                </Link>
              </Button>
              </Tooltip>
            </>
          ) : null}
          {hasPermission(`${claimName}:delete`) ? (
            <>
              <Popconfirm
                title={translatedTexts.deleteConfirm}
                onConfirm={() => handleDeleteConfirm(id)}
                okText="Yes"
                cancelText="No"
              >
                  <Tooltip title={t("global.delete", "Delete")}>
                <Button
                  className="btn-icon"
                  type="danger"
                  to="#"
                  shape="circle"
                >
                   <Link to="#" title={t("global.delete", "Delete")} >
                      <FeatherIcon icon="trash-2" size={16} />
                    </Link>
                </Button>
                </Tooltip>
              </Popconfirm>
            </>
          ) : null}
        </div>
      ),
    };
  });

  return (
    <>
        <ProjectHeader>
          <PageHeader
            ghost
            title={formatLabel(translatedTexts.title)}
            subTitle={<>{codebookData.totalCount} {formatLabel(translatedTexts.title)}</>}
            buttons={[
              <ExportButtonPageApiHeader
                key="1"
                callFrom={"Codebook"}
                filterType={codebookType}
                municipalityId={""}
                entityId={""}
                search={request.search}
                typeOfEquipmentId={""}
                from={""}
                to={""}
              />,
              hasPermission(`${claimName}:add`) && (
                <>
                  <Button
                    onClick={handleAddClick}
                    className="btn-add_new"
                    size="default"
                    type="primary"
                    key="add-codebook"
                  >
                    + {formatLabel(translatedTexts.add)}
                  </Button>
                </>
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
                    onSearch={(value) => onSearchChange(value)}
                    // width="100%"
                    patterns
                    placeholder={`Search ${formatLabel(claimName)}`}
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
                      loading={codebookItemsLoading}
                      dataSource={tableData}
                      columns={columns}
                      showSorterTooltip={false}
                      rowKey="key"
                      pagination={{
                        current: codebookData?.pageIndex,
                        total: codebookData?.totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        onChange: handlePaginationChange,
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

      <CreateCommonCodebookModal
        isVisible={Boolean(modalsState.addModalVisible)}
        codebookType={codebookType}
        onHide={closeModal}
        onSuccess={handleSuccessAddOrEdit}
      />
      <CreateCommonCodebookModal
        isVisible={Boolean(modalsState.itemForEditModal)}
        codebookType={codebookType}
        onHide={closeModal}
        onSuccess={handleSuccessAddOrEdit}
        codebookToEdit={modalsState.itemForEditModal}
      />
    </>
  );
};
