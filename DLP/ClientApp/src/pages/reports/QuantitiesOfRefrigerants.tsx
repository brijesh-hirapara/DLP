import { Col, Row, Select, Skeleton, Table,Popconfirm, Tooltip } from "antd";
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
import { Link } from "react-router-dom";
import CustomDateRange from "components/customDatePicker/datePicker";
import { GuidReportResponseDto } from "api/models";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Button } from "components/buttons/buttons";
const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

const QuantitiesOfRefrigerants = () => {
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
    const { data } = await reportsApi.apiReportsEquipmentsByPurposeGet({
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
      title: t("reports:service-company-name", "KGH service company name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.submitting-date", "Submitting date"),
      dataIndex: "total",
      key: "total",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:table.person-who-submitted", "Person who submitted"),
      dataIndex: "stateEntityId",
      key: "stateEntityId",
      align:'left',
      sorter: true,
      sortDirections,
    },
    {
      title: t("users:table.title.action", "Action"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  const isInitialLoading = isLoading && !data?.items;
  /**
   * Generate table data
   */
  const generateTableData = () => {
    return (data ?? []).map((item: GuidReportResponseDto) => {
      const { id, name, stateEntityId, ordinalNumber, total } = item;

      return {
        key: id,
        id,
        ordinalNumber,
        name,
        total,
        stateEntityId,
        action: (
          <div className="table-actions" style={{ clear: "both" }}>
             <Tooltip title={t("global.view", "View")}>
            <Link to={`/reports/quantities-of-refrigerants/${id}`}>
              <Button className="btn-icon" type="default" shape="circle">
                <FeatherIcon icon="eye" size={17} />
              </Button>
            </Link>
            </Tooltip>
            {/* <Popconfirm
                title={t(
                  "technicians:alert.terminate-confirm",
                  "This step is irreversible, are you sure you want to terminate {{dynamicValue}}'s employment?",
                  { dynamicValue: fullName }
                )}
                onConfirm={() => onTerminateEmployment(id)}
                okText="Yes"
                cancelText="No"
              > */}
                {/* {!isDeleted && */}
            <Button className="btn-icon" shape="circle">
              <Link to="#" title={t("global.delete", "Delete")}>
                <FeatherIcon icon="delete" size={17} />
              </Link>
            </Button>
                {/* } */}
              {/* </Popconfirm> */}
          </div>
        ),
      };
    });
  };

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t(
            "side-bar:reports.quantities-of-refrigerants",
            "Reported quantities of RRR refrigerants"
          )}
          buttons={[
         
            <ExportButtonPageHeader
              key="1"
              title={t(
                "side-bar:reports.quantities-of-refrigerants",
                "Reported quantities of RRR refrigerants"
              )}
              data={generateTableData()}
              columns={["id", "name", "total", "stateEntityId"]}
            />,
              <Button
                className="btn-add_new"
                size="default"
                type="primary"
                key="1"
              >
                <Link to="/reports/create-quantities-of-refrigerants">
                  {t("quantities-of-rrr-refrigerants:button.add-new", "+ Add New Quantities Of RRR Refrigerants")}
                </Link>
              </Button>
            
           
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

export default QuantitiesOfRefrigerants;
