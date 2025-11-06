import { Col, Form, Input, Popconfirm, Row, Skeleton, Table, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { ReportsApi } from "api/api";
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
import AddDataOnImportExportSubstanceYear from "./AddDataOnImportExportSubstanceYear";
import styled from "styled-components";
import EditDataOnImportExportSubstanceYear from "./EditDataOnImportExportSubstanceYear";
const reportsApi = new ReportsApi();

type RequestStateType = {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
};

const Title = styled.h6`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 24px;
  
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: evenly; /* Adjusts the spacing between items */
  gap: 16px; /* Adjusts the gap between items */
  margin-bottom: 24px; /* Space below the container */
`;

interface DataOnImportExportOfSubstancesPrps {
    onDataReceived: (data: any) => void; // Adjust the type of 'data' as needed
    editData: any;
    viewMode: boolean;
}


const DataOnImportExportOfSubstances: React.FC<DataOnImportExportOfSubstancesPrps> = ({ viewMode, editData, onDataReceived }) => {
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

    const handleOnFinish = async (formData: any) => {
        setData((prevData: any) => [...prevData, formData]);
        setAddModalVisible(false);
    }

    const handleEditFinish = (editedData: any) => {
        // Update data with edited values
        const newData = [...data]; // Create a copy of the data array
        newData[selectedIndex] = editedData; // Update the item at the selected index
        setData(newData); // Update the state with the new data
        setEditModalVisible(false); // Close the edit modal
    };


    const handleEdit = (item: any, index: any) => {
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
        if (editData) {
            setData(editData);
        } else {
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
            title: t("global.tariff-number", "Tariff Number"),
            dataIndex: "tariffNumber",
            key: "tariffNumber",
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
            dataIndex: "salesOnTheBiHMarket",
            key: "salesOnTheBiHMarket",
            sorter: false,
        },
        {
            title: t("global.total-imported-quantity", "Total imported quantity"),
            dataIndex: "totalExportedQuantity",
            key: "totalExportedQuantity",
            sorter: false,
        },
        {
            title: t("global.stock-balance-on-31.12", "Stock Balane on 31.12"),
            dataIndex: "stockBalanceOnTheDay",
            key: "stockBalanceOnTheDay",
            sorter: false,
        },
        {
            title: t("global.end-beneficiary", "End beneficiary"),
            dataIndex: "endUser",
            key: "endUser",
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
        return (data ?? []).map((item: any, index: any) => {
            const { id, refrigerantTypeName, refrigerantTypeChemicalFormula, refrigerantTypeASHRAEDesignation, tariffNumber, ownConsumption, totalExportedQuantity, stockBalanceOnTheDay, salesOnTheBiHMarket, endUser, import: importData } = item;
            return {
                key: id,
                id,
                refrigerantTypeName,
                refrigerantTypeChemicalFormula,
                refrigerantTypeASHRAEDesignation,
                tariffNumber,
                import: importData,
                ownConsumption,
                salesOnTheBiHMarket,
                totalExportedQuantity,
                stockBalanceOnTheDay,
                endUser,
                action: viewMode && (
                    <div className="table-actions" style={{ clear: "both" }}>
                        <Tooltip title={t("global:edit", "Edit")}>
                            <Button className="btn-icon" type="default" shape="circle" onClick={() => handleEdit(item, index)} >

                                <Link to="#" title={t("global:edit", "Edit")}>
                                    <FeatherIcon icon="edit" size={17} />
                                </Link>
                            </Button>
                        </Tooltip>
                        <Popconfirm
                            title={t(
                                "data-on-data-on-import/export-of-substances-for-the-year:delete-confirmation",
                                "Are you sure delete this data on import/export of substances for the year?"
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
                <Container>
                    <Title className="mt-4">
                        {t("data-on-import-export-substances-for-year.title", 'Data on import/export of substances for the year')}
                    </Title>

                </Container>
                <PageHeader
                    ghost
                    // title={t("data-on-import-export-substances-for-year.title", 'Data on import/export of substances for the year')}
                    buttons={[


                        viewMode && (
                            <Button
                                className="btn-add_new"
                                size="default"
                                type="primary"
                                key="1"
                                onClick={() => setAddModalVisible(true)}
                            >
                                {t("global:title.add-data-import-export-substance", "Add Data Import/Export Of Substances For The Year")}
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
            {addModalVisible && <AddDataOnImportExportSubstanceYear onFinish={handleOnFinish} onCancel={() => setAddModalVisible(false)} />}
            {editModalVisible && (
                <EditDataOnImportExportSubstanceYear
                    initialValue={selectedItem}
                    onFinish={handleEditFinish}
                    onCancel={() => setEditModalVisible(false)}
                />
            )}
        </>
    );
};

export default DataOnImportExportOfSubstances;
