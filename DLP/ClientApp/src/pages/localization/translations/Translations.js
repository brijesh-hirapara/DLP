import {
  Col,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Table,
  Tooltip,
} from "antd";
import { AutoComplete } from "../../../components/autoComplete/autoComplete";
import FeatherIcon from "feather-icons-react";
import React, { lazy, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CardToolbox, Main, TableWrapper } from "container/styled";
import { useTranslation } from "react-i18next";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { Modal } from "components/modals/antd-modals";
import { PageHeader } from "components/page-headers/page-headers";
import { BasicFormWrapper } from "container/styled";
import { useAuthorization } from "hooks/useAuthorization";
import openNotificationWithIcon from "utility/notification";
import { UserTableStyleWrapper } from "../../style";
import { LanguagesApi, TranslationsApi } from "api";
import path from "path";
import { ProjectToolbarWrapper } from "../email/style";
import { useDispatch, useSelector } from "react-redux";
import { sortingProjectByCategory } from "redux/themeLayout/actionCreator";
import { SearchOutlined } from "@ant-design/icons";
import { ProjectHeader, ProjectSorting } from "pages/localization/email/style";
import { UserFilterType } from "api/models";


const LNG_ID_PREFIX = "languageId#";
const LNG_TABLE_KEY_PREFIX = "key#";

const languagesApi = new LanguagesApi();
const translationsApi = new TranslationsApi();

const Grid = lazy(() => import("../email/Grid"));
const List = lazy(() => import("../email/List"));

const Translations = () => {
  /**
   * Translation
   */
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.headerSearchData);

  /**
   * Local state
   */
  const [form] = Form.useForm();
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const { hasPermission } = useAuthorization();

  const [state, setState] = useState({
    visible: false,
    editVisible: false,
    modalType: "primary",
    record: {
      key: "",
    },
  });

  const onSorting = (selectedItems) => {
    dispatch(sortingProjectByCategory(selectedItems));
  };

  const [translations, setTranslations] = useState({
    totalCount: 0,
    pageIndex: 1,
    items: [],
  });

  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: "",
  });

  useEffect(() => {
    getLanguages();
  }, []);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setLoading(true);
      getTranslations();
    }, 300);

    return () => clearTimeout(timeOutId);
  }, [query]);

  const getTranslations = async () => {
    try {
      const { data } = await translationsApi.apiTranslationsGet(query);

      setTranslations(data);
      setLoading(false);

      let tableDataArray = [];

      // eslint-disable-next-line array-callback-return
      data.items.map((record, index) => {
        const data = {};

        data.key = record.key;
        // eslint-disable-next-line array-callback-return
        record.translations.map(({ languageId, value }) => {
          data[`${LNG_ID_PREFIX}${languageId}`] = value;
          data[`${LNG_TABLE_KEY_PREFIX}${languageId}`] = (
            <Popover
              overlayStyle={{
                width: "400px",
              }}
              content={value}
            >
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "flex-center",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "5px" }}>{value}</span>
              </div>
            </Popover>
          );
        });

        data.action = (
          <div
            key={index}
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title={t("global:edit", "Edit")}>
              <Button
                className="btn-icon"
                type="primary"
                to="#"
                shape="circle"
                onClick={() => showEditModal(data)}
              >
                <Link to="#" title={t("global:edit", "Edit")}>
                  <FeatherIcon icon="edit" size={16} />
                </Link>
              </Button>
            </Tooltip>
          </div>
        );

        tableDataArray.push(data);
      });

      setTableData(tableDataArray);
    } catch (error) {}
  };

  const getLanguages = async () => {
    try {
      const { data } = await languagesApi.apiLanguagesGet();
      const languagesResponse = data?.map((r) => ({
        languageId: r.id,
        language: r.i18nCode.name,
      }));

      const colWidth = 80 / (data.length + 1);

      const columns = [
        {
          title: t("translations.table.key", "Key"),
          dataIndex: "key",
          key: "key",
          width: `${colWidth}%`,
          ellipsis: true,
        },
        ...languagesResponse.map(({ languageId, language }) => ({
          title: t(`global.language.${language}`, language),
          dataIndex: `${LNG_TABLE_KEY_PREFIX}${languageId}`,
          key: `${LNG_TABLE_KEY_PREFIX}${languageId}`,
          width: `${colWidth}%`,
          ellipsis: true,
        })),
        {
          title: t("global.actions", "Actions"),
          dataIndex: "action",
          key: "action",
          width: "50px",
        },
      ];

      setLanguages(data);
      setTableColumns(columns);
    } catch (err) {
      // Handle error
    }
  };
  const onPaginationChange = (pageNumber, pageSize) => {
    setQuery({ ...query, pageNumber, pageSize });
  };

  const showEditModal = (translation) => {
    setState({
      ...state,
      editVisible: true,
    });

    form.setFieldsValue(translation);
  };

  const handleCancel = () => {
    setState({ editVisible: false });
  };

  const handleEditSubmit = async (values) => {
    setEditLoading(true);
    const translations = Object.keys(values).reduce((acc, element) => {
      if (element.includes(LNG_ID_PREFIX)) {
        const [prefix, languageId] = element.split("#");
        const value = values[element];

        // if (value) {
        acc.push({
          languageId,
          value,
        });
        // }
      }
      return acc;
    }, []);

    if (translations.length === 0) {
      return;
    }

    try {
      await translationsApi.apiTranslationsKeyPut({
        key: values.key,
        translationDto: translations,
      });
      openNotificationWithIcon(
        "success",
        t("translations.success.edit", "Translation Updated Successfully")
      );
      setState({ editVisible: false });
      i18n.reloadResources(i18n.language);
    } catch (error) {
      setState({ editVisible: false });
    } finally {
      setEditLoading(false);
    }
    getTranslations();
  };

  const [request, setRequest] = useState({
    filterType: UserFilterType.ACTIVE,
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  const onSearchChange = (value) => {
    setQuery({
      ...query,
      pageNumber: 1,
      search: value,
    });
  };

  return (
    <>
      <Modal
        width={600}
        title={t("translations.modal.title", "User Translation")}
        footer={null}
        visible={state.editVisible}
        onCancel={() => setState({ editVisible: false })}
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
              label={t("translations.table.key", "Key")}
              style={{ width: "100%" }}
              rules={[
                {
                  required: true,
                  message: "Required!",
                  type: "text",
                },
              ]}
              name="key"
            >
              <Input
                disabled
                placeholder={t("translations.table.key", "Key")}
              />
            </Form.Item>

            {languages?.map(({ id, i18nCode }, index) => {
              return (
                <Form.Item
                  key={index}
                  label={t(`global.language.${i18nCode.name}`, i18nCode.name)}
                  style={{ width: "100%" }}
                  rules={[
                    {
                      type: "text",
                    },
                  ]}
                  name={`${LNG_ID_PREFIX}${id}`}
                >
                  <Input.TextArea
                    rows={1}
                    placeholder={t(
                      `global.language.${i18nCode.name}`,
                      i18nCode.name
                    )}
                  />
                </Form.Item>
              );
            })}
            {hasPermission("translations:edit") && (
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
                  {t("translations.button.edit", "Update Translation")}
                </Button>
                <Button className="mx-3" size="default" type="white" key="back" outlined onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </Form>
        </BasicFormWrapper>
      </Modal>

      {/* <CardToolbox style={{marginBottom:"-20px"}}> */}
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("translations.title", "Translations")}
          subTitle={<>{translations.totalCount} {t("global:translations", "Translations")}</>}
        />
        </ProjectHeader>
      {/* </CardToolbox> */}


      <Main>
        <Row gutter={15}>
          <Col sm={24}>
            <ProjectSorting>
             <div className="project-sort-bar">
              <div className="project-sort-search">
              <AutoComplete
                    onSearch={(value) => onSearchChange(value)}
                    patterns
                    placeholder={t(
                  "translation.search-placeholder",
                  "Search Translations"
                )}
                  />
              </div>
            </div>
            </ProjectSorting>
            </Col>
        </Row>
            <Cards headless>
              <UserTableStyleWrapper>
                <TableWrapper className="table-responsive">
                  <Table
                    loading={loading}
                    dataSource={tableData}
                    direction="horizontal"
                    columns={tableColumns}
                    rowKey={(record) => record.id}
                    pagination={{
                      defaultPageSize: 10,
                      total: translations.totalCount,
                      defaultCurrent: translations.pageIndex,
                      current: translations.pageIndex,
                      showSizeChanger: true,
                      pageSizeOptions: [10, 50, 100, 1000],
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} ${t(
                          "global.of",
                          "of"
                        )} ${total} ${t("global.items", "items")}`,
                      onChange: onPaginationChange,
                    }}
                  />
                </TableWrapper>
              </UserTableStyleWrapper>
            </Cards>
      </Main>
    </>
  );
};

export default Translations;
