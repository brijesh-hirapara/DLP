import { Col, Form, Input, Row, Table } from "antd";
import { StateEntitiesApi } from "api/api";
import { StateEntityDto, StateEntityDtoOrdinalPaginatedList } from "api/models";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { Modal } from "components/modals/antd-modals";
import { SortTypeMaper } from "constants/constants";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import {
  BasicFormWrapper,
  CardToolbox,
  Main,
  ProfilePageheaderStyle,
  ProfileTableStyleWrapper,
  TableWrapper,
} from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import openNotificationWithIcon from "utility/notification";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { PageHeader } from "components/page-headers/page-headers";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const entitiesApi = new StateEntitiesApi();

export const EntitiesPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<StateEntityDtoOrdinalPaginatedList>({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });

  const [modalState, setModalState] = useState<boolean>(false);
  const [state, setState] = useState<StateEntityDto>({});
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  const getEntities = async () => {
    try {
      setLoading(true);
      const { data } = await entitiesApi.apiStateEntitiesGet(query);
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
      getEntities();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const generateTableData = () => {
    return data?.items?.map((record: StateEntityDto) => {
      const { id, ordinalNumber, name } = record;

      return {
        id,
        key: ordinalNumber,
        name,
        // action: (
        //   <div
        //     className="table-actions"
        //     style={{
        //       display: "flex",
        //       justifyContent: "flex-end",
        //     }}
        //   >
        //   <Button className="btn-icon" type="primary" to="#" shape="circle">
        //     <Link onClick={handleEditClick(record)} to="#">
        //       <FeatherIcon icon="edit" size={16} />
        //     </Link>
        //   </Button>
        // </div>
        // )
      };
    });
  };

  const handleEditClick = (cantons: StateEntityDto) => () => {
    form.setFieldsValue(cantons);
    setState(cantons);
    setModalState(true);
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
      title: "",
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

  const handleEditSubmit = async (values: StateEntityDto) => {
    setEditLoading(true);

    try {
      await entitiesApi.apiStateEntitiesIdPut({
        id: state.id as string,
        updateStateEntityCommand: { name: values.name, id: state.id },
      });
      getEntities();
      openNotificationWithIcon(
        "success",
        t("municipalities.success.edit", "Municipalities Updated Successfully")
      );
      setModalState(false);
    } catch (error) {
      setModalState(false);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <Modal
        width={600}
        title={t("cantons.modal.title", "Edit Cantons")}
        footer={null}
        visible={modalState}
        onCancel={() => setModalState(false)}
      >
        <BasicFormWrapper>
          <Form
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
            form={form}
            onFinish={handleEditSubmit}
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

            {hasPermission("entities:edit") && (
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
                  loading={editLoading}
                  type="primary"
                  key="1"
                >
                  {t("cantons.button.edit", "Edit Canton")}
                </Button>
              </div>
            )}
          </Form>
        </BasicFormWrapper>
      </Modal>
      <CardToolbox>
        <ProfilePageheaderStyle>
          <PageHeader ghost title={t("entities.title", "Entities")} buttons={[<ExportButtonPageApiHeader key="1" callFrom={'Entities'} filterType={""} municipalityId={""} entityId={""} search={query.search}  typeOfEquipmentId={""} from={""} to={""}/>,]} />
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
                            "entities.title",
                            "Entities"
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
