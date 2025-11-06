import { Col, Popconfirm, Row, Skeleton, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { ReportsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { CardToolbox, Main, TableWrapper } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Link } from "react-router-dom";
import { GuidReportResponseDto } from "api/models";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Button } from "components/buttons/buttons";
import AddQuantitiesOfRefrigerant from "./AddQuantitiesOfRefrigerant";
import EditQuantitiesOfRefrigerant from "./EditQuantitiesOfRefrigerant";
const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

interface DataOnPurchasedSectionPrps {
  onDataReceived: (data: any) => void; // Adjust the type of 'data' as needed
  editData:any;
  viewMode:boolean;
}

const DataOnPurchasedSection:React.FC<DataOnPurchasedSectionPrps> = ({viewMode, editData,onDataReceived }) => {
  /**
   * Translation
   */
  const { t } = useTranslation();

  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [query, setQuery] = useState({
    from: null,
    to: null,
    endOpen: false,
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [request, setRequest] = useState<RequestStateType>({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

  useEffect(() => {
   onDataReceived(data);
  }, [data]);
  

  useEffect(() => {
   
   
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const handleOnFinish = async (formData:any) => {
    setData((prevData:any) => [...prevData, formData]);
    setAddModalVisible(false);
  }

  const handleEditFinish = (editedData: any) => {
    // Update data with edited values
    const newData = [...data]; // Create a copy of the data array
    newData[selectedIndex] = editedData; // Update the item at the selected index
    setData(newData); // Update the state with the new data
    setEditModalVisible(false); // Close the edit modal
  };
  

  const handleEdit = (item:any,index:any) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setEditModalVisible(true);
  };

  const handleDelete = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1); // Remove the item at the specified index
    setData(newData); // Update the state with the new data
  };
  

  const getData = async () => {
    if(editData){
      setData(editData);
    }else{
      setData([]);
    }
    setIsLoading(false);
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global.name-of-substance-mixture", "Name of substance (mixture)"),
      dataIndex: "refrigerantTypeName",
      key: "refrigerantTypeName",
      sorter: false,
    },
    {
      title: t("global.chemical-formula", "Chemical formula"),
      dataIndex: "refrigerantTypeChemicalFormula",
      key: "refrigerantTypeChemicalFormula",
      sorter: false,

    },
    {
      title: t("global.symbol", "Symbol (mark)"),
      dataIndex: "refrigerantTypeASHRAEDesignation",
      key: "refrigerantTypeASHRAEDesignation",
      sorter: false,
    },
    {
      title: t("global.total-quantities", "Total quantities (kg)"),
      children:[  {
        title: t("global.purchased-acquired", "Purchased/ acquired"),
        dataIndex: "purchased",
        key: "purchased",
        sorter: false,
      },
      {
        title: t("global.collected", "Collected"),
        dataIndex: "collected",
        key: "collected",
        sorter: false,
      },
      {
        title: t("global.renewed", "Renewed"),
        dataIndex: "renewed",
        key: "renewed",
        sorter: false,
      },
      {
        title: t("global.Sold", "Sold"),
        dataIndex: "sold",
        key: "sold",
        sorter: false,
      },
      {
        title: t("global.used", "Used (*)"),
        children:[
          {
            title: t("global.1", "(1)"),
            dataIndex: "used1",
            key: "used1",
            sorter: false,
          },
          {
            title: t("global.2", "(2)"),
            dataIndex: "used2",
            key: "used2",
            sorter: false,
          },
          {
            title: t("global.3", "(3)"),
            dataIndex: "used3",
            key: "used3",
            sorter: false,
          },
          {
            title: t("global.4", "(4)"),
            dataIndex: "used4",
            key: "used4",
            sorter: false,
          },
        ]
      },
    ]
    },
    {
      title: t("global.state-of-substance-mixture", "State of substance - mixture (**)"),
      dataIndex: "stateOfSubstanceName",
      key: "stateOfSubstanceName",
      sorter: false,
    },
    {
      title: t("global.stock-balance", "Stock balance (kg) on ​​31.12"),
      dataIndex: "stockBalance",
      key: "stockBalance",
      sorter: false,
    },
  
  ];

  if (viewMode) {
    columns.push({
        title: t("users:table.title.action", "Action"),
        dataIndex: "action",
        key: "action",
        fixed: 'right',
    });
}


  const isInitialLoading = isLoading && !data?.items;
  /**
   * Generate table data
   */
  const generateTableData = () => {
    return (data ?? []).map((item: any,index:any) => {
      const { id,refrigerantTypeName,refrigerantTypeChemicalFormula, refrigerantTypeASHRAEDesignation, purchased, collected,renewed, sold,used1,used2,used3,used4,stateOfSubstanceName,stockBalance } = item;
      return {
        key: id,
        refrigerantTypeName,
        refrigerantTypeChemicalFormula,
        refrigerantTypeASHRAEDesignation,
        purchased,
        collected,
        renewed,
        sold,
        used1,
        used2,
        used3,
        used4,
        stateOfSubstanceName,
        stockBalance,
        action: viewMode && (
          <div className="table-actions" style={{ clear: "both" }}>
          <Tooltip title={t("global:edit", "Edit")}>
              <Button className="btn-icon" type="default" shape="circle" onClick={() => handleEdit(item,index)} >
              <Link to="#" title={t("global:edit", "Edit")}>
                <FeatherIcon icon="edit" size={17} />
                </Link>
              </Button>
            </Tooltip>
            <Popconfirm
                title={t(
                  "data-on-acquired-used-substances:delete-confirmation",
                  "Are you sure delete this data on acquired/used substances?"
                )}
                onConfirm={() => handleDelete(index)}
                okText={t("global.yes", "Yes")}
                cancelText={t("global.no", "No")}
                
              >    
            <Tooltip title={t("global.delete", "Delete")}>
            <Button className="btn-icon" shape="circle" >
            <Link to="#" title={t("global.delete", "Delete")}>
              <FeatherIcon icon="delete" size={17} />
              </Link>
            </Button>
            </Tooltip>
            </Popconfirm>
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
          title={t("data-on-acquired-used-substances.title", 'Data on acquired/used substances for')}
          
          buttons={[
           
           viewMode && (
          <Button
            className="btn-add_new"
            size="default"
            type="primary"
            key="1"
            onClick={() => setAddModalVisible(true)}
          >
            {t("global:button.add-data-on-acquired", "+ Add Data On Acquired")}
          </Button>
        ) 
          ]}
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
        {addModalVisible && <AddQuantitiesOfRefrigerant onFinish={handleOnFinish} onCancel={() => setAddModalVisible(false)} />}
          {/* Edit modal */}
          {editModalVisible && (
          <EditQuantitiesOfRefrigerant
            initialValue={selectedItem}
            onFinish={handleEditFinish}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
        
    </>
  );
};

export default DataOnPurchasedSection;
