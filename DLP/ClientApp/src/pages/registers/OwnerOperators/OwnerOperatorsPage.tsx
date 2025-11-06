import { Col, Row, Select, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import {
  RegistersApi,
  RegistersApiApiRegistersOwnersOperatorsGetRequest,
} from "api/api";
import {
  MunicipalityDto,
  OwnerOperatorOfEquipmentDto,
  OwnerOperatorOfEquipmentDtoOrdinalPaginatedList,
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
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
const { Option } = Select;

const registersApi = new RegistersApi();

const OwnerOperatorsPage = () => {
  const { t } = useTranslation();
  const [data, setData] =
    useState<OwnerOperatorOfEquipmentDtoOrdinalPaginatedList>();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] =
    useState<RegistersApiApiRegistersOwnersOperatorsGetRequest>({
      search: "",
      pageNumber: 1,
      pageSize: 10,
      municipalityId: undefined,
    });
  const commonData = useContext(CommonDataContext) as any;
  const { municipalities } = commonData;

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const getData = async () => {
    setIsLoading(true);

    const { data } = await registersApi.apiRegistersOwnersOperatorsGet({
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
      title: t("register:nrOfBranches", "Number of Branches"),
      dataIndex: "nrOfBranches",
      key: "nrOfBranches",
      sorter: true,
      sortDirections,
    },
    {
      title: t("register:nrOfEquipments", "Number of Equipment"),
      dataIndex: "nrOfEquipments",
      key: "nrOfEquipments",
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

  const isInitialLoading = isLoading && !data?.items;
  const canReviewDetails = hasPermission(
    "registers:view-details-of-owners-and-operators-of-kgh-equipment"
  );
  const tableData = (data?.items ?? []).map(
    (item: OwnerOperatorOfEquipmentDto) => {
      const {
        id,
        companyName,
        municipality,
        ordinalNumber,
        nrOfBranches,
        nrOfEquipments,
      } = item;
      return {
        key: id,
        companyName,
        municipality,
        ordinalNumber,
        nrOfEquipments,
        nrOfBranches,
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
              <Link to={`/registers/owners-operators-of-kgh-equipment/${id}`}>
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
          title={t(
            "side-bar:registers.owner-operators-of-equipment",
            "Owners and Operators of KGH equipment"
          )}
          buttons={[<ExportButtonPageApiHeader key="1" callFrom={'owners-operators'} filterType={""} municipalityId={request.municipalityId} entityId={""} search={request.search} typeOfEquipmentId={""} from={""} to={""}/>,]}
        />
      </CardToolbox>
      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox style={{ marginBottom: 20 }}>
                <Row
                  align="middle"
                  gutter={15}
                  style={{ display: "flex", gap: 20 }}
                >
                  <div className="table-search-box">
                    <AutoComplete
                      onSearch={onSearchChange}
                      placeholder={t(
                        "registers:search.owners",
                        "Search Owners and Operators..."
                      )}
                      patterns
                    />
                  </div>
                  <div style={{ width: 250 }}>
                    <Select
                      showSearch={true}
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

export default OwnerOperatorsPage;
