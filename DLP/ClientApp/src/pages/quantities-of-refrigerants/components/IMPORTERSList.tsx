import { Col, Row, Skeleton, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { CardToolbox, Main, TableWrapper } from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { GuidReportResponseDto } from "api/models";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Button } from "components/buttons/buttons";


type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

const IMPORTERSList = () => {
  /**
   * Translation
   */
  const { t } = useTranslation();

  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState({
    from: null,
    to: null,
    endOpen: false,
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
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
  }, [request]);


  const getData = async () => {
    // setIsLoading(true);
    // const { from, to } = query;
    // let fromDate = from ? moment(from, "DD.MM.yyyy").format("MM/DD/yyyy") : "";
    // let toDate = to ? moment(to, "DD.MM.yyyy").format("MM/DD/yyyy") : "";
    // const { data } = await reportsApi.apiReportsEquipmentsByPurposeGet({
    //   from: fromDate,
    //   to: toDate,
    // });
    setData([]);
    setIsLoading(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global.name-of-substance", "Name of substance"),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("global.chemical-formula", "Chemical formula"),
      dataIndex: "name",
      key: "name",
      sorter: false,

    },
    {
      title: t("global.symbol", "Symbol (mark)"),
      dataIndex: "total",
      key: "total",
      sorter: false,
    },
    {
        title: t("global.tariff-number", "Tariff Number"),
        dataIndex: "total",
        key: "total",
        sorter: false,
    },
    {
        title: t("global.import", "Import"),
        dataIndex: "import",
        key: "import",
        sorter: false,
    },
      
    {
        title: t("global.own-consumption", "Own consumption"),
        dataIndex: "ownConsumption",
        key: "ownConsumption",
        sorter: false,
    },
      
    {
        title: t("global.market-sale", "Market Sale"),
        dataIndex: "saleOnTheMarketShould",
        key: "saleOnTheMarketShould",
        sorter: false,
    },
    {
        title: t("global.total-imported-quantity", "Total imported quantity"),
        dataIndex: "saleOnTheMarketShould",
        key: "saleOnTheMarketShould",
        sorter: false,
    },
    {
        title: t("global.stock-balance-on-31.12", "Stock Balane on 31.12"),
        dataIndex: "stateSuppliesPerDay",
        key: "stateSuppliesPerDay",
        sorter: false,
    },
    {
        title: t("global.end-beneficiary", "End beneficiary"),
        dataIndex: "theLastOneTheUser",
        key: "theLastOneTheUser",
        sorter: false,
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
            <Tooltip title={t("global.delete", "Delete")}>
            <Button className="btn-icon" shape="circle" >
            <Link to="#" title={t("global.delete", "Delete")}>
              <FeatherIcon icon="delete" size={17} />
              </Link>
            </Button>
            </Tooltip>
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
          title={t("data-on-import-export-substances-for-year.title", 'Data on import/export of substances for the year')}
          
        />
      </CardToolbox>
       
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
                pagination={false}  
                bordered
              />
            )}
          </TableWrapper>
        </Row>
       
    </>
  );
};

export default IMPORTERSList;
