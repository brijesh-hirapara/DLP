import { Col, Row, Select, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import {
  RegistersApi,
  RegistersApiApiRegistersImportersExportersGetRequest,
} from "api/api";
import {
  ImporterExporterCompanyDto,
  ImporterExporterCompanyDtoOrdinalPaginatedList,
  MunicipalityDto,
  OrganizationTypeEnum,
} from "api/models";
import { AutoComplete } from "components/autoComplete/autoComplete";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import { CardToolbox, Main, TableWrapper, TopToolBox } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { hasPermission } from "utility/accessibility/hasPermission";
import { Button } from "components/buttons/buttons";
import { Link } from "react-router-dom";
import moment from "moment";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
const { Option } = Select;

const registersApi = new RegistersApi();

const ImporterExportersPage = () => {
  const { t } = useTranslation();
  const [data, setData] =
    useState<ImporterExporterCompanyDtoOrdinalPaginatedList>();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] =
    useState<RegistersApiApiRegistersImportersExportersGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
      municipalityId: undefined,
      type: undefined,
    });

  const commonData = useContext(CommonDataContext) as any;
  const { municipalities } = commonData;

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const getData = async () => {
    setIsLoading(true);

    const { data } = await registersApi.apiRegistersImportersExportersGet({
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

  const onCompanyTypeChange = (value: OrganizationTypeEnum) => {
    setRequest({ ...request, type: value, pageNumber: 1 });
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
      title: t("register:companyName", "Company Name"),
      dataIndex: "companyName",
      key: "companyName",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.municipality", "Municipality"),
      dataIndex: "municipality",
      key: "municipality",
      sorter: true,
      sortDirections,
    },
    {
      title: t("register:companyType", "Company type"),
      dataIndex: "companyType",
      key: "companyType",
      sorter: true,
      sortDirections,
    },
    {
      title: t("register:licenseId", "License Id"),
      dataIndex: "licenseId",
      key: "licenseId",
      sorter: true,
      sortDirections,
    },
    {
      title: t("register:licenseDuration", "License Duration"),
      dataIndex: "licenseDuration",
      key: "licenseDuration",
      sorter: true,
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

  const isInitialLoading = !data?.items && isLoading;
  const canReviewDetails = hasPermission("registers:view-details-of-importers");
  const tableData = (data?.items ?? []).map(
    (item: ImporterExporterCompanyDto) => {
      const {
        id,
        companyName,
        municipality,
        ordinalNumber,
        licenseId,
        licenseDuration,
        companyType,
      } = item;
      return {
        key: id,
        companyName,
        municipality,
        ordinalNumber,
        companyType,
        licenseId,
        licenseDuration: licenseDuration
          ? moment(licenseDuration).format("MM.DD.yyyy")
          : "-",
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
              <Link to={`/registers/importers/${id}`}>
                {t("global:details", "Details")}
              </Link>
            </Button>
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
          title={t("side-bar:registers.importers", "Importers")}
          buttons={[<ExportButtonPageApiHeader key="1" callFrom={'importers-exporters'} filterType={request.type} municipalityId={request.municipalityId} entityId={""} search={request.search} 
          typeOfEquipmentId={""} from={""} to={""} />,]}
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
                      placeholder={t(
                        "registers:search.service-companies",
                        "Search..."
                      )}
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
                        allowClear
                        onChange={onMunicipalityChange}
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
                        showSearch
                        placeholder={t("global:type", "Type")}
                        className="sDash_fullwidth-select"
                        style={{ color: "rgb(90, 95, 125)", marginBottom: 0 }}
                        aria-required
                        allowClear
                        onChange={onCompanyTypeChange}
                      >
                        <Option
                          key={`company-type-${OrganizationTypeEnum.NUMBER_3}`}
                          value={OrganizationTypeEnum.NUMBER_3}
                        >
                          {t(
                            `requests:company-type.${OrganizationTypeEnum.NUMBER_3}}`,
                            "Importer"
                          )}
                        </Option>
                        <Option
                          key={`company-type-${OrganizationTypeEnum.NUMBER_4}`}
                          value={OrganizationTypeEnum.NUMBER_4}
                        >
                          {t(
                            `requests:company-type.${OrganizationTypeEnum.NUMBER_4}}`,
                            "Exporter"
                          )}
                        </Option>
                        <Option
                          key={`company-type-${OrganizationTypeEnum.NUMBER_5}`}
                          value={OrganizationTypeEnum.NUMBER_5}
                        >
                          {t(
                            `requests:company-type.${OrganizationTypeEnum.NUMBER_5}}`,
                            "Importer/Exporter"
                          )}
                        </Option>
                      </Select>
                    </Col>
                  </div>
                </Row>
              </TopToolBox>
            </Col>
          </Row>
          <Row gutter={15}>
            <Col md={24}>
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
                    onChange={(_, __, sorter) => onSorterChange(sorter)}
                  />
                )}
              </TableWrapper>
            </Col>
          </Row>
        </Cards>
      </Main>
    </>
  );
};

export default ImporterExportersPage;
