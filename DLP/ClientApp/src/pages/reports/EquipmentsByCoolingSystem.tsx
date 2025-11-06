import { Col, Row, Select, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { ReportsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import { CardToolbox, Main, TableWrapper } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { GeneralReportDto } from "api/models/reports-general-dto";
import { useAuthorization } from "hooks/useAuthorization";
import moment from "moment";
import CustomDateRange from "components/customDatePicker/datePicker";
import { GuidReportResponseDto } from "api/models";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
//@ts-ignore
const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

const EquipmentsByCoolingPurpose = () => {
  /**
   * Translation
   */
  const { t } = useTranslation();
  /**
   * Authorization
   */
  const { hasPermission } = useAuthorization();
  /**
   * States
   */
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const { onSorterChange, sorting } = useTableSorting();
  const [query, setQuery] = useState({
    from: null,
    to: null,
    endOpen: false,
  });

  const [disabledDate, setDisabledDate] = useState({
    startDate: false,
    endDate: false,
  });

  const [request, setRequest] = useState<RequestStateType>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, sorting]);

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery: any) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery: any) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const getData = async () => {
    setIsLoading(true);
    const { from, to } = query;
    let fromDate = from ? moment(from, "DD.MM.yyyy").format("MM/DD/yyyy") : "";
    let toDate = to ? moment(to, "DD.MM.yyyy").format("MM/DD/yyyy") : "";
    const { data } = await reportsApi.apiReportsEquipmentsByCoolingSystemGet({
      from: fromDate,
      to: toDate,
    });
    setData(data.items);
    setIsLoading(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("reports:cooling-system", "Cooling system"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
      width: 650, // Set a fixed width
      render: (text: string) => (
        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>
          {text}
        </div>
      ),
    },
    {
      title: t("global.total", "Total"),
      dataIndex: "total",
      key: "total",
      sorter: true,
      sortDirections,
    },
    {
      title: t("reports:stateEntity", "State Entity"),
      dataIndex: "stateEntityId",
      key: "stateEntityId",
      sorter: true,
      align:'left',
      sortDirections,
    },
  
  ];

  const isInitialLoading = isLoading && !data?.items;
  /**
   * Generate table data
   */
  const generateTableData = () => {
    return (data ?? []).map((item: GuidReportResponseDto) => {
      const { id, name, stateEntityName, total,ordinalNumber } = item;

      return {
        key: ordinalNumber,
        id: id !== "00000000-0000-0000-0000-000000000000" ? id : "",
        ordinalNumber,
        name,
        total,
        stateEntityId : stateEntityName,
      };
    });
  };

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t(
            "side-bar:reports.equipments-by-cooling-system",
            "Equipment by Cooling System"
          )}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={'equipments-by-cooling-system'} filterType={""} municipalityId={""} entityId={""} search={request.search}
              typeOfEquipmentId={""} from={query.from ? moment(query.from, "DD.MM.yyyy").format("MM/DD/yyyy") : ""} to={query.to ? moment(query.to, "DD.MM.yyyy").format("MM/DD/yyyy") : ""} 
            />,
          ]}
        />
      </CardToolbox>
      <Main>
        <CustomDateRange
          disabledDate={disabledDate}
          getData={getData}
          query={query}
          setDisabledDate={setDisabledDate}
          setQuery={setQuery}
        />
        <br /> <br />
        <Row gutter={0}>
          <TableWrapper className="table-responsive">
            {isInitialLoading ? (
              <Cards headless>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Cards>
            ) : (
              <Table
                dataSource={generateTableData()}
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
      </Main>
    </>
  );
};

export default EquipmentsByCoolingPurpose;
