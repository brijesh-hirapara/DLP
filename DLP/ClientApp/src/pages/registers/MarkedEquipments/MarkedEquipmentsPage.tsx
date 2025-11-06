import { Col, Row, Select, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import {
  CodebookApi,
  RegistersApi,
  RegistersApiApiRegistersMarkedEquipmentsGetRequest,
} from "api/api";
import {
  CodebookDto,
  MarkedEquipmentDto,
  MarkedEquipmentDtoOrdinalPaginatedList,
  MunicipalityDto,
} from "api/models";
import { sortDirections } from "constants/constants";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { CardToolbox, Main, TableWrapper, TopToolBox } from "container/styled";
import { useEffect, useState, useContext } from "react";
import { useTableSorting } from "hooks/useTableSorting";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { hasPermission } from "utility/accessibility/hasPermission";
import { Button } from "components/buttons/buttons";
import { Link } from "react-router-dom";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
const { Option } = Select;

const registersApi = new RegistersApi();
const codebooksApi = new CodebookApi();

const MarkedEquipmentsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<MarkedEquipmentDtoOrdinalPaginatedList>();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] =
    useState<RegistersApiApiRegistersMarkedEquipmentsGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
      municipalityId: undefined,
      typeOfEquipmentId: undefined,
      companyId: undefined,
    });

  const commonData = useContext(CommonDataContext) as any;
  const { municipalities } = commonData;
  const [typeOfEquipments, setTypeOfEquipments] = useState<
    CodebookDto[] | null | undefined
  >([]);
  const isInitialLoading = isLoading && !data?.items;

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  useEffect(() => {
    const fetchTypeOfEquipments = async () => {
      const { data } = await codebooksApi.apiCodebookGet();
      setTypeOfEquipments(data["TypeOfEquipment"]);
    };

    fetchTypeOfEquipments();
  }, []);

  const getData = async () => {
    setIsLoading(true);

    const { data } = await registersApi.apiRegistersMarkedEquipmentsGet({
      ...request,
      ...sorting,
    });
    setData(data);
    setIsLoading(false);
  };

  const onSearchChange = (value: string) => {
    setRequest({ ...request, search: value, pageNumber: 1 });
  };

  const onMunicipalityChange = (value: string) => {
    setRequest({ ...request, municipalityId: value, pageNumber: 1 });
  };

  const onTypeOfEquipmentChange = (value: any) => {
    setRequest({ ...request, typeOfEquipmentId: value, pageNumber: 1 });
  };

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("register:equipment-id-number", "Equipment ID Number"),
      dataIndex: "id",
      key: "id",
      sorter: false,
      sortDirections,
    },
    {
      title: t("register:type-of-equipment", "Type of Equipment"),
      dataIndex: "typeOfEquipment",
      key: "typeOfEquipment",
      sorter: false,
      sortDirections,
    },
    {
      title: t("register:owner-company", "Owner Company"),
      dataIndex: "ownerCompany",
      key: "ownerCompany",
      sorter: false,
      sortDirections,
    },
    {
      title: t("global.municipality", "Municipality"),
      dataIndex: "municipality",
      key: "municipality",
      sorter: false,
      sortDirections,
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      sorter: false,
      fixed: "right",
    },
  ];

  const canReviewDetails = hasPermission(
    "registers:view-details-of-marked-equipment"
  );
  const tableData = (data?.items ?? []).map((item: MarkedEquipmentDto) => {
    const {
      id,
      ownerCompany,
      municipality,
      ordinalNumber,
      typeOfEquipment,
      equipmentIdNumber,
    } = item;
    return {
      key: id,
      ownerCompany,
      municipality,
      ordinalNumber,
      typeOfEquipment,
      equipmentIdNumber,
      action: canReviewDetails && (
        <div
          key={id}
          className="table-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button className="btn-icon" type="primary" to="#" shape="circle">
            <Link to={`/equipments/${id}`}>
              {t("global:details", "Details")}
            </Link>
          </Button>
        </div>
      ),
    };
  });

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("side-bar:registers.marked-equipments", "Marked Equipment")}
          buttons={[<ExportButtonPageApiHeader key="1" callFrom={'marked-equipments'} filterType={""} municipalityId={request.municipalityId} entityId={""} search={request.search}  typeOfEquipmentId={request.typeOfEquipmentId} from={""} to={""}/>,]}
        />
      </CardToolbox>
      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox>
                <Row gutter={15} align="middle">
                  <div
                    className="table-search-box"
                    style={{ marginRight: 10, marginTop: 8 }}
                  >
                    <AutoComplete
                      onSearch={onSearchChange}
                      placeholder={t("global:search", "Search...")}
                      patterns
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      display: "flex",
                      marginTop: 8,
                    }}
                  >
                    <Col xl={6} lg={8} md={12} xs={10}>
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option!.props.children
                            ?.toLowerCase()
                            .indexOf(input?.toLowerCase()) >= 0
                        }
                        placeholder={t("global:municipality", "Municipality")}
                        className="sDash_fullwidth-select"
                        style={{ color: "rgb(90, 95, 125)", marginBottom: 0 }}
                        aria-required
                        onChange={onMunicipalityChange}
                        allowClear
                      >
                        {municipalities && (
                          <>
                            {municipalities.map((item: MunicipalityDto) => (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                            ))}
                          </>
                        )}
                      </Select>
                    </Col>
                    <Col xl={6} lg={8} md={12} xs={10}>
                      <Select
                        placeholder={t(
                          "equipments:type-of-equipment-placeholder",
                          "Select a Type of Equipment"
                        )}
                        onChange={onTypeOfEquipmentChange}
                        aria-required
                        style={{ marginBottom: 0 }}
                        allowClear
                      >
                        {typeOfEquipments && (
                          <>
                            {typeOfEquipments?.map((item) => (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                            ))}
                          </>
                        )}
                        <Option key={"TypeOfEquipment-other"} value={-1}>
                          {t("equipments:other", "Other")}
                        </Option>
                      </Select>
                    </Col>
                  </div>
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
                  dataSource={tableData}
                  columns={columns}
                  showSorterTooltip={false}
                  loading={isLoading}
                  pagination={{
                    current: data?.pageIndex,
                    total: data?.totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 50, 100, 1000],
                    onChange: handlePaginationChange,
                    onShowSizeChange: onShowSizeChange,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  // onChange={(_, __, sorter) => onSorterChange(sorter)}
                />
              )}
            </TableWrapper>
          </Row>
        </Cards>
      </Main>
    </>
  );
};

export default MarkedEquipmentsPage;
