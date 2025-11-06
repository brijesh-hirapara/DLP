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
import DecimalFormat from "components/decimal-format/DecimalFormat";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { useTableSorting } from "hooks/useTableSorting";
import { sortDirections } from "constants/constants";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};
interface MVTEOListPagePrps {
  searchValue: any;
}

const MVTEOListPage: React.FC<MVTEOListPagePrps> = ({ searchValue }) => {
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
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request,sorting]);

  useEffect(() => {
    setRequest((prevRequest) => ({ ...prevRequest, search: searchValue }));
  }, [searchValue]);

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
    const { data } = await reportsApi.apiMVTEOAnnualReportByServiceTechnicianGet({
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
      title: t("global.total-quantities", "Total quantities (kg)"),
      children: [{
        title: t("global.purchased-acquired", "Purchased/ acquired"),
        dataIndex: "totalPurchased",
        key: "totalPurchased",
        sorter: true,
      },
      {
        title: t("global.collected", "Collected"),
        dataIndex: "totalCollected",
        key: "totalCollected",
        sorter: true,
        sortDirections
      },
      {
        title: t("global.renewed", "Renewed"),
        dataIndex: "totalRenewed",
        key: "totalRenewed",
        sorter: true,
        sortDirections
      },
      {
        title: t("global.Sold", "Sold"),
        dataIndex: "totalSold",
        key: "totalSold",
        sorter: true,
        sortDirections
      },
      {
        title: t("global.used", "Used (*)"),
        children: [
          {
            title: t("global.1", "(1)"),
            dataIndex: "totalUsed1",
            key: "totalUsed1",
            sorter: true,
            sortDirections
          },
          {
            title: t("global.2", "(2)"),
            dataIndex: "totalUsed2",
            key: "totalUsed2",
            sorter: true,
            sortDirections
          },
          {
            title: t("global.3", "(3)"),
            dataIndex: "totalUsed3",
            key: "totalUsed3",
            sorter: true,
            sortDirections
          },
          {
            title: t("global.4", "(4)"),
            dataIndex: "totalUsed4",
            key: "totalUsed4",
            sorter: true,
            sortDirections
          },
        ]
      },
      ]
    },
    {
      title: t("global.stock-balance", "Stock balance (kg) on ​​31.12"),
      dataIndex: "totalStockBalance",
      key: "totalStockBalance",
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
      const { id, refrigerantTypeName, ordinalNumber,refrigerantTypeChemicalFormula, refrigerantTypeASHRAEDesignation, totalPurchased, totalCollected, totalRenewed, totalSold, totalUsed1, totalUsed2, totalUsed3, totalUsed4, totalStockBalance } = item;
      return {
        key: id,
        ordinalNumber:ordinalNumber,
        refrigerantTypeName,
        refrigerantTypeChemicalFormula,
        refrigerantTypeASHRAEDesignation,
        totalPurchased: <DecimalFormat price={totalPurchased} />,
        totalCollected: <DecimalFormat price={totalCollected} />,
        totalRenewed: <DecimalFormat price={totalRenewed} />,
        totalSold: <DecimalFormat price={totalSold} />,
        totalUsed1: <DecimalFormat price={totalUsed1} />,
        totalUsed2: <DecimalFormat price={totalUsed2} />,
        totalUsed3: <DecimalFormat price={totalUsed3} />,
        totalUsed4: <DecimalFormat price={totalUsed4} />,
        // stateOfSubstance:<DecimalFormat price={stateOfSubstance} />,
        totalStockBalance: <DecimalFormat price={totalStockBalance} />,

        action: (
          <div className="table-actions" style={{ clear: "both" }}>
             <Tooltip title={t("global.view", "View")}>
            <Link to={`/reports/quantities-of-refrigerants/${id}`}>
              <Button className="btn-icon" type="default" shape="circle">
                <FeatherIcon icon="eye" size={17} />
              </Button>
            </Link>
            </Tooltip>
            <Button className="btn-icon" shape="circle">
            <Link to="#" title={t("global.delete", "Delete")}>
              <FeatherIcon icon="delete" size={17} />
              </Link>
            </Button>
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
         
                       <ExportButtonPageApiHeader key="1" callFrom={'MVTEO Annual Report On Collected Substances'} filterType={0} municipalityId={""} entityId={""} search={searchValue}  typeOfEquipmentId={""} from={""} to={""}/>

        ]}
      />
      <Row gutter={0} >
        <TableWrapper className="table-responsive">
          {isInitialLoading ? (
            <Cards headless>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Cards>
          ) : (
            <Table id="table-to-xls"
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

export default MVTEOListPage;
