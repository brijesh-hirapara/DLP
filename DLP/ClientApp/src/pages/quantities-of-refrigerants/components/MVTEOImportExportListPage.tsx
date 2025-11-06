import { Col, Row, Skeleton, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { ReportsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { TableWrapper } from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Button } from "components/buttons/buttons";
import AddQuantitiesOfRefrigerant from "./AddQuantitiesOfRefrigerant";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import DecimalFormat from "components/decimal-format/DecimalFormat";
import { sortDirections } from "constants/constants";
import { useTableSorting } from "hooks/useTableSorting";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

interface MVTEOImportExportListPagePrps {
  searchValue:any;
}


const MVTEOImportExportListPage:React.FC<MVTEOImportExportListPagePrps> = ({searchValue}) => {
  /**
   * Translation
   */
  const { t } = useTranslation();

  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { onSorterChange, sorting } = useTableSorting();
  const [request, setRequest] = useState<RequestStateType>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });


  useEffect(() => {
    setRequest((prevRequest) => ({ ...prevRequest, search: searchValue }));
  }, [searchValue]);


  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request,sorting]);

  const handleOnFinish = async () => {
    await getData();
    setAddModalVisible(false);
  }

  const handlePaginationChange = (pageNumber: number) => {
    setRequest((prevQuery: any) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber: number, pageSize: number) => {
    setRequest((prevQuery: any) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const getData = async () => {
    const { data } = await reportsApi.apiMVTEOAnnualReportOnImportExportSubstancesGet({
      ...request,...sorting
    });
    setData(data?.items);
    setIsLoading(false);
  };


  const columns: ColumnsType<any> = [
    {
      title: t("reports.ordinalNumber", "Ordinal Number"),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("global.name-of-substance-mixture", "Name of substance (mixture)"),
      dataIndex: "refrigerantTypeName",
      key: "refrigerantTypeName",
      sorter: true,
      sortDirections
    },
    {
      title: t("global.chemical-formula", "Chemical formula"),
      dataIndex: "refrigerantTypeChemicalFormula",
      key: "refrigerantTypeChemicalFormula",
      sorter: true,
      sortDirections

    },
    {
      title: t("global.symbol", "Symbol (mark)"),
      dataIndex: "refrigerantTypeASHRAEDesignation",
      key: "refrigerantTypeASHRAEDesignation",
      sorter: true,
      sortDirections
    },
    {
        title: t("global.tariff-number", "Tariff Number"),
        dataIndex: "totalTariffNumber",
        key: "totalTariffNumber",
        sorter: true,
        sortDirections
    },
    {
        title: t("global.import", "Import"),
        dataIndex: "totalImport",
        key: "totalImport",
        sorter: true,
        sortDirections
    },
      
    {
        title: t("global.own-consumption", "Own consumption"),
        dataIndex: "totalOwnConsumption",
        key: "totalOwnConsumption",
        sorter: true,
        sortDirections
    },
      
    {
        title: t("global.market-sale", "Market Sale"),
        dataIndex: "totalSalesOnTheBiHMarket",
        key: "totalSalesOnTheBiHMarket",
        sorter: true,
        sortDirections
    },
    {
        title: t("global.total-imported-quantity", "Total imported quantity"),
        dataIndex: "totalExportedQuantity",
        key: "totalExportedQuantity",
        sorter: true,
        sortDirections
    },
    {
        title: t("global.stock-balance-on-31.12", "Stock Balane on 31.12"),
        dataIndex: "totalStockBalanceOnTheDay",
        key: "totalStockBalanceOnTheDay",
        sorter: true,
        sortDirections
    },
  
  ];


  const isInitialLoading = isLoading && !data?.items;
  /**
   * Generate table data
   */
  const generateTableData = () => {
    return (data ?? []).map((item: any) => {
      const { id, refrigerantTypeName,ordinalNumber, endUser,totalStockBalanceOnTheDay,refrigerantTypeChemicalFormula,totalExportedQuantity,refrigerantTypeASHRAEDesignation,totalSalesOnTheBiHMarket, totalTariffNumber,totalImport, totalOwnConsumption } = item;
      return {
        key: id,
        id,
        ordinalNumber:ordinalNumber,
        refrigerantTypeName,
        refrigerantTypeChemicalFormula,
        refrigerantTypeASHRAEDesignation,
        totalTariffNumber:<DecimalFormat price={totalTariffNumber} />,
        totalImport:<DecimalFormat price={totalImport} />,
        totalOwnConsumption:<DecimalFormat price={totalOwnConsumption} />,
        totalSalesOnTheBiHMarket:<DecimalFormat price={totalSalesOnTheBiHMarket} />,
        totalExportedQuantity:<DecimalFormat price={totalExportedQuantity} />,
        totalStockBalanceOnTheDay:<DecimalFormat price={totalStockBalanceOnTheDay} />,
        endUser,
        action: (
          <div className="table-actions" style={{ clear: "both" }}>
            <Link to={`/reports/quantities-of-refrigerants/${id}`}>
            <Tooltip title={t("global.view", "View")}>
              <Button className="btn-icon" type="default" shape="circle">
                <FeatherIcon icon="eye" size={17} />
              </Button>
              </Tooltip>
            </Link>
            <Tooltip title={t("global.delete", "Delete")}>
            <Button className="btn-icon" shape="circle">
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
       <PageHeader
          ghost
          className="report-header"
          buttons={[
          
                        <ExportButtonPageApiHeader key="1" callFrom={'MVTEO Annual Report On Import/Export Of Ozone Depleting Substance'} filterType={0} municipalityId={""} entityId={""} search={searchValue}  typeOfEquipmentId={""} from={""} to={""}/>

          ]}
        />
       
        <Row gutter={0}>
          <TableWrapper className="table-responsive">
            {isInitialLoading ? (
              <Cards headless>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Cards>
            ) : (
              <Table  id="table-to-xls-substances"
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
                bordered
              />
            )}
          </TableWrapper>
        </Row>
        {addModalVisible && <AddQuantitiesOfRefrigerant onFinish={handleOnFinish} onCancel={() => setAddModalVisible(false)} />}
       
    </>
  );
};

export default MVTEOImportExportListPage;
