import { Col, Form, Input, Popconfirm, Row, Select, Table, Tooltip } from "antd";
import { CantonsApi } from "api/api";
import { CantonDto, CantonDtoOrdinalPaginatedList, StateEntityDto } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { Modal } from "components/modals/antd-modals";
import { SortTypeMaper } from "constants/constants";
import {
  BasicFormWrapper,
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import openNotificationWithIcon from "utility/notification";
import { PageHeader } from "components/page-headers/page-headers";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const cantonsApi = new CantonsApi();

const { Option } = Select;

type ModalStateType = {
  isVisible: boolean;
  isEdit?: boolean;
};

export const CantonsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<CantonDtoOrdinalPaginatedList>({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });

  const [modalState, setModalState] = useState<ModalStateType>({
    isVisible: false,
    isEdit: false,
  });
  const [state, setState] = useState<CantonDto>({});
  const [addEditLoading, setAddEditLoading] = useState(false);

  const [form] = Form.useForm();

  /**
   * Context API
   */
  const commonData = useContext(CommonDataContext) as any;
  const { stateEntities } = commonData;

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  const getCantons = async () => {
    try {
      setLoading(true);
      const { data } = await cantonsApi.apiCantonsGet(query);
      setData(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  /**
   * Use Effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      getCantons();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleEditClick = (cantons: CantonDto) => () => {
    form.setFieldsValue(cantons);
    setState(cantons);
    setModalState({ isEdit: true, isVisible: true });
  };

  const generateTableData = () => {
    return data?.items?.map((record: CantonDto) => {
      const { id, ordinalNumber, name, entityName } = record;

      return {
        id,
        key: ordinalNumber,
        name,
        entityName,
        action: (
          <div
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {hasPermission("cantons:edit") && (
               <Tooltip title={t("global:edit", "Edit")}>
              <Button className="btn-icon" type="primary" to="#" shape="circle">
                <Link onClick={handleEditClick(record)} to="#" title={t("global:edit", "Edit")}>
                  <FeatherIcon icon="edit" size={16} />
                </Link>
              </Button>
              </Tooltip>
            )}
            {hasPermission(`cantons:delete`) && (
              <>
                <Popconfirm
                  title={t(
                    "cantons:delete-confirm",
                    "Are you sure you want to delete canton?"
                  )}
                  onConfirm={() => handleDeleteConfirm(id as string)}
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
                  <Link to="#" title={t("global.delete", "Delete")} >
                      <FeatherIcon icon="trash-2" size={16} />
                    </Link>
                  </Button>
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </div>
        ),
      };
    });
  };

  const columns = [
    {
      title: t("global.id", "Id"),
      dataIndex: "key",
      key: "key",
    },
    {
      title: t("global.name", "Name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("global.entity", "Entity"),
      dataIndex: "entityName",
      key: "entityName",
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  /**
   * Tables Event
   */
  const handlePaginationChange = (pageNumber: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const handleShowSizeChange = (pageNumber: number, pageSize: number) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const handleSorterChange = (pagination: any, filters: any, sorter: any) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      sortType: SortTypeMaper[sorter.order],
      sortBy: sorter?.columnKey,
    }));
  };

  const handleAddClick = () => {
    form.resetFields(["stateEntityId", "name"]);
    setModalState({ isEdit: false, isVisible: true });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await cantonsApi.apiCantonsIdDelete({ id });
      setQuery((prev) => ({ ...prev, pageNumber: 1 }));
    } catch (err) {}
  };

  const handleCreateSubmit = async (values: CantonDto) => {
    setAddEditLoading(true);

    try {
      await cantonsApi.apiCantonsPost({
        addNewCantonCommand: { ...values },
      });
      getCantons();
      openNotificationWithIcon(
        "success",
        t("cantons.success.add", "Canton Added Successfully")
      );
      setModalState({ isVisible: false });
    } catch (error) {
    } finally {
      setAddEditLoading(false);
    }
  };

  const handleEditSubmit = async (values: CantonDto) => {
    setAddEditLoading(true);

    try {
      await cantonsApi.apiCantonsIdPut({
        id: state.id as string,
        updateCantonCommand: { ...values, id: state.id },
      });
      getCantons();
      openNotificationWithIcon(
        "success",
        t("municipalities.success.edit", "Municipalities Updated Successfully")
      );
      setModalState({ isEdit: false, isVisible: false });
    } catch (error) {
      setModalState({ isEdit: false, isVisible: false });
    } finally {
      setAddEditLoading(false);
    }
  };

  return (
    <>
      <Modal
        width={600}
        title={t("cantons.modal.title", "Edit Canton")}
        footer={null}
        visible={modalState.isVisible}
        onCancel={() => setModalState({ isVisible: false, isEdit: false })}
      >
        <BasicFormWrapper>
          <Form
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
            form={form}
            onFinish={modalState.isEdit ? handleEditSubmit : handleCreateSubmit}
          >
            <Form.Item
              label={t("municipalities.table.name", "Name")}
              style={{ width: "100%" }}
              rules={[
                {
                  required: true,
                  message: "Required!",
                },
              ]}
              name="name"
            >
              <Input placeholder={t("municipalities.table.name", "Name")} />
            </Form.Item>

            <Form.Item
              name="stateEntityId"
              label={t("global.select-entity", "Select Entity")}
              style={{ width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t(
                    "validations.entity.required",
                    "Entity is required!"
                  ),
                },
              ]}
              // requiredMark
            >
              <Select
                className="sDash_fullwidth-select"
                aria-required
                size="large"
                style={{ color: "rgb(90, 95, 125)" }}
              >
                {stateEntities &&
                  stateEntities.map((item: StateEntityDto) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <div
              style={{
                width: "100%",
                display: "flex",
              }}
            >
              <Button
                htmlType="submit"
                className="btn-add_new"
                size="default"
                loading={addEditLoading}
                type="primary"
                key="1"
              >
                {modalState.isEdit
                  ? t("cantons.button.edit", "Edit Canton")
                  : t("cantons.button.add", "Add Canton")}
              </Button>
            </div>
          </Form>
        </BasicFormWrapper>
      </Modal>

      <CardToolbox>
        <ProfilePageheaderStyle>
          <PageHeader
            ghost
            title={t("cantons.title", "Cantons")}
            buttons={[
              <ExportButtonPageApiHeader key="1" callFrom={'Cantons'} filterType={""} municipalityId={""} entityId={""} search={query.search}  typeOfEquipmentId={""} from={""} to={""}/>,
              hasPermission("cantons:add") && (
                <Button
                  onClick={handleAddClick}
                  className="btn-add_new"
                  type="primary"
                  key="add-language"
                >
                  {t("cantons.add", "+ Add New Canton")}
                </Button>
              ),
            ]}
          />
        </ProfilePageheaderStyle>
      </CardToolbox>
      <Main>
        <Row gutter={15}>
          <Col md={24}>
            <Cards headless>
              <ProfileTableStyleWrapper>
                <div className="contact-table">
                  <TableWrapper className="table-responsive">
                    <Table
                      loading={loading}
                      dataSource={generateTableData()}
                      rowKey={(record) => record.id as string}
                      columns={columns}
                      pagination={{
                        position: ["bottomCenter"],
                        pageSize: query.pageSize,
                        total: data.totalCount,
                        current: data.pageIndex,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 50, 100, 1000],
                        showTotal: (total) =>
                          `${t("global.total", "Total")} ${total} ${t(
                            "cantons.title",
                            "Cantons"
                          )}`,
                        onChange: handlePaginationChange,
                        onShowSizeChange: handleShowSizeChange,
                      }}
                      onChange={handleSorterChange}
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
