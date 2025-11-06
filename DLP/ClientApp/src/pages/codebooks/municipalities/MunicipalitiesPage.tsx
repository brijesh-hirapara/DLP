import { Col, Form, Input, Popconfirm, Row, Select, Table, Tooltip } from "antd";
import { MunicipalitiesApi } from "api/api";
import {
  BasicFormWrapper,
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { Cards } from "components/cards/frame/cards-frame";
import { Button } from "components/buttons/buttons";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import {
  CantonDto,
  MunicipalityDto,
  MunicipalityDtoOrdinalPaginatedList,
  StateEntityDto,
} from "api/models";
import { SortTypeMaper } from "constants/constants";
import { Link } from "react-router-dom";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Modal } from "components/modals/antd-modals";
import openNotificationWithIcon from "utility/notification";
import { hasPermission } from "utility/accessibility/hasPermission";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { PageHeader } from "components/page-headers/page-headers";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const municipalitiesApi = new MunicipalitiesApi();

const { Option } = Select;

type ModalStateType = {
  isVisible: boolean;
  isEdit?: boolean;
};
//Id Name Canton Entity
export const MunicipalitiesPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<MunicipalityDtoOrdinalPaginatedList>({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });
  const [addEditLoading, setAddEditLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalStateType>({
    isVisible: false,
    isEdit: false,
  });
  const [editState, setEditState] = useState<MunicipalityDto>({});

  /**
   * Context API
   */
  const commonData = useContext(CommonDataContext) as any;
  const { cantons, stateEntities } = commonData;

  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  const getMunicipalities = async () => {
    try {
      setLoading(true);
      const { data } = await municipalitiesApi.apiMunicipalitiesGet(query);
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
      getMunicipalities();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleEditClick = (municipalities: MunicipalityDto) => () => {
    form.setFieldsValue(municipalities);
    setEditState(municipalities);
    setModalState({ isEdit: true, isVisible: true });
  };
  const handleAddClick = () => {
    form.resetFields(["name", "stateEntityId", "cantonId"]);
    setModalState({ isEdit: false, isVisible: true });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await municipalitiesApi.apiMunicipalitiesIdDelete({ id });
      setQuery((prev) => ({ ...prev, pageNumber: 1 }));
    } catch (err) {}
  };

  const generateTableData = () => {
    return data?.items?.map((record: MunicipalityDto) => {
      const { id, ordinalNumber, name, cantonName, entityName } = record;

      return {
        id,
        key: ordinalNumber,
        name,
        cantonName,
        entityName,
        action: (
          <div
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {hasPermission("municipalities:edit") && (
               <Tooltip title={t("global:edit", "Edit")}>
              <Button className="btn-icon" type="primary" to="#" shape="circle">
                <Link onClick={handleEditClick(record)} to="#" title={t("global:edit", "Edit")}>
                  <FeatherIcon icon="edit" size={16}  title={t("global:edit", "Edit")}/>
                </Link>
              </Button>
              </Tooltip>
            )}
            {hasPermission(`municipalities:delete`) && (
              <>
                <Popconfirm
                  title={t(
                    "municipalites:delete-confirm",
                    "Are you sure you want to delete municipality?"
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
      title: t("global.canton", "Canton"),
      dataIndex: "cantonName",
      key: "cantonName",
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

  const handleEditSubmit = async (values: MunicipalityDto) => {
    setAddEditLoading(true);

    try {
      await municipalitiesApi.apiMunicipalitiesPut({
        updateMunicipalityCommand: { ...values, id: editState.id },
      });
      getMunicipalities();
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

  const handleCreateSubmit = async (values: MunicipalityDto) => {
    setAddEditLoading(true);

    try {
      await municipalitiesApi.apiMunicipalitiesPost({
        addNewMunicipalityCommand: { ...values },
      });
      getMunicipalities();
      openNotificationWithIcon(
        "success",
        t("municipalities.success.add", "Municipality Added Successfully")
      );
      setModalState({ isVisible: false });
    } catch (error) {
    } finally {
      setAddEditLoading(false);
    }
  };

  return (
    <>
      <Modal
        width={600}
        title={t("municipalities.modal.title", "Edit Municipality")}
        footer={null}
        visible={modalState.isVisible}
        onCancel={() => setModalState({ isEdit: false, isVisible: false })}
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
                  message: t("validations.name.required", "Name is required!"),
                },
              ]}
              name="name"
            >
              <Input placeholder={t("municipalities.table.name", "Name")} />
            </Form.Item>
            <Form.Item
              name="cantonId"
              label={t("global.select-canton", "Select Canton")}
              style={{ width: "100%" }}
            >
              <Select
                className="sDash_fullwidth-select"
                allowClear
                size="large"
                style={{ color: "rgb(90, 95, 125)" }}
              >
                {cantons &&
                  cantons.map((item: CantonDto) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
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
                  ? t("municipalities.button.edit", "Edit Municipality")
                  : t("municipalities.button.add", "Add Municipality")}
              </Button>
            </div>
          </Form>
        </BasicFormWrapper>
      </Modal>
      <CardToolbox>
        <ProfilePageheaderStyle>
          <PageHeader
            ghost
            title={t("municipalities.title", "Municipalities")}
            buttons={[
              <ExportButtonPageApiHeader key="1" callFrom={'Municipalities'} filterType={""} municipalityId={""} entityId={""} search={query.search}  typeOfEquipmentId={""} from={""} to={""}/>,
              hasPermission("municipalities:add") && (
                <Button
                  onClick={handleAddClick}
                  className="btn-add_new"
                  type="primary"
                  key="add-language"
                >
                  {t("municipalities.add", "+ Add New Municipality")}
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
                            "municipalities.title",
                            "Municipalities"
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
