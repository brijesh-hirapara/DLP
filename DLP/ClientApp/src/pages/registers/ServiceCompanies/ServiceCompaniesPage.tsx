import { Badge, Col, Row, Select, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import {
  CodebookApi,
  RegistersApi,
  RegistersApiApiRegistersKghServiceCompaniesGetRequest,
} from "api/api";
import {
  KGHServiceCompanyDto,
  KGHServiceCompanyDtoOrdinalPaginatedList,
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
import { Button } from "components/buttons/buttons";
import { Link } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import moment from "moment";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
const { Option } = Select;

const registersApi = new RegistersApi();

const ServiceCompaniesPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<KGHServiceCompanyDtoOrdinalPaginatedList>();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] =
    useState<RegistersApiApiRegistersKghServiceCompaniesGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
    });

  const commonData = useContext(CommonDataContext) as any;
  const { municipalities } = commonData;

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const getData = async () => {
    setIsLoading(true);

    const { data } = await registersApi.apiRegistersKghServiceCompaniesGet({
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
      title: t(
        "register:nrOfCertifiedServiceTechnicians",
        "Number of Certified Service Technicians"
      ),
      dataIndex: "nrOfCertifiedServiceTechnicians",
      key: "nrOfCertifiedServiceTechnicians",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:details.license-id", "License Id"),
      dataIndex: "licenseId",
      key: "licenseId",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:details.license-duration", "License Duration"),
      dataIndex: "licenseDuration",
      key: "licenseDuration",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global:status", "Status"),
      dataIndex: "statusDesc",
      key: "statusDesc",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.actions", "Actions"),
      dataIndex: "action",
      key: "action",
      sorter: false,
    },
  ];

  const isInitialLoading = !data?.items && isLoading;
  const canReviewDetails = hasPermission(
    "registers:view-details-of-kgh-companies"
  );

  const getStatusBadge = (statusDesc: any) => {
    const color = statusDesc === 'Active'
      ? "success"
      : "warning";
    const title = t(
      `registers:company-status-${statusDesc}`,
      statusDesc as string
    );
    return <Badge
      className={`ant-badge badge badge-${color}`}
      count={title}
    />
  };

  const tableData = (data?.items ?? []).map((item: KGHServiceCompanyDto) => {
    const {
      id,
      companyName,
      municipality,
      ordinalNumber,
      licenseId,
      licenseDuration,
      statusDesc,
      companyType,
      nrOfCertifiedServiceTechnicians,
    } = item;
    return {
      key: id,
      companyName,
      municipality,
      ordinalNumber,
      companyType,
      licenseId,
      statusDesc: getStatusBadge(statusDesc),
      licenseDuration: licenseDuration
        ? moment(licenseDuration).format('MM.DD.yyyy')
        : '-',
      nrOfCertifiedServiceTechnicians: nrOfCertifiedServiceTechnicians ? nrOfCertifiedServiceTechnicians : <span style={{ color: 'red', fontWeight: '600' }}>!</span>,
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
            <Link to={`/registers/kgh-service-companies/${id}`}>
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
          title={t(
            "side-bar:registers.service-companies",
            "KGH service companies"
          )}
          buttons={[<ExportButtonPageApiHeader callFrom={'kgh-service-companies'} filterType={request.type} municipalityId={request.municipalityId} entityId={""} search={request.search}  typeOfEquipmentId={""} from={""} to={""}/>,]}
        />
      </CardToolbox>
      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox style={{ marginBottom: 20 }}>
                <Row
                  gutter={15}
                  align={"bottom"}
                  style={{ display: "flex", flexDirection: "row", gap: 20 }}
                >
                  <div className="table-search-box">
                    <AutoComplete
                      onSearch={onSearchChange}
                      placeholder={t(
                        "registers:search.service-companies",
                        "Search Service Companies..."
                      )}
                      patterns
                    />
                  </div>
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option!.props.children
                        ?.toLowerCase()
                        .indexOf(input?.toLowerCase()) >= 0
                    }
                    placeholder={t("global:municipality", "Municipality")}
                    className="sDash_fullwidth-select"
                    style={{ color: "rgb(90, 95, 125)", width: 200,marginBottom:0 }}
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
                  <Select
                    showSearch
                    placeholder={t("global:type", "Type")}
                    className="sDash_fullwidth-select"
                    style={{ color: "rgb(90, 95, 125)", width: 200 ,marginBottom:0}}
                    aria-required
                    onChange={onCompanyTypeChange}
                  >
                    <Option
                      key={"company-none"}
                      value=""
                      children={undefined}
                    />
                    <Option
                      key={`company-type-${OrganizationTypeEnum.NUMBER_1}`}
                      value={OrganizationTypeEnum.NUMBER_1}
                    >
                      {t(
                        `requests:company-type.${OrganizationTypeEnum.NUMBER_1}}`,
                        "Company"
                      )}
                    </Option>
                    <Option
                      key={`company-type-${OrganizationTypeEnum.NUMBER_2}`}
                      value={OrganizationTypeEnum.NUMBER_2}
                    >
                      {t(
                        `requests:company-type.${OrganizationTypeEnum.NUMBER_2}}`,
                        "Entrepreneur"
                      )}
                    </Option>
                  </Select>
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
                  onChange={(_, __, sorter) => onSorterChange(sorter)}
                />
              )}
            </TableWrapper>
          </Row>
        </Cards>
      </Main>
    </>
  );
};

export default ServiceCompaniesPage;
