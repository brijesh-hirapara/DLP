import { Col, Row, Select, Skeleton, Table,Popconfirm, Form, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table/interface";
import { ReportsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { sortDirections } from "constants/constants";
import { CardToolbox, Main, TableWrapper } from "container/styled";
import { useTableSorting } from "hooks/useTableSorting";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAuthorization } from "hooks/useAuthorization";
import { Link } from "react-router-dom";
import { Option } from "antd/lib/mentions";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { Button } from "components/buttons/buttons";
import openNotificationWithIcon from "utility/notification";
import moment from "moment";

const reportsApi = new ReportsApi();

type RequestStateType = {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
};

const generateYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 1; year >= 2021; year--) {
    years.push(year);
  }
  return years;
};

const AnnualReportOnImportExportSubstances = () => {
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
  const [selectedYear, setSelectedYear] = useState<any>(new Date().getFullYear());
  const [isDescending, setIsDescending] = useState<boolean>(true);

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

  
   // Function to toggle sorting direction
   const toggleSorting = () => {
    setIsDescending((prevState) => !prevState);
  };


  const getData = async () => {
    setIsLoading(true);
    toggleSorting();
    const modifiedSorting = {
      ...sorting,
      sortingIsDescending: isDescending,
    };
    const { data } = await reportsApi.apiReportsImportExportSubstancesGet({
      ...request, ...modifiedSorting 
    });

    setData(data.items);
    setIsLoading(false);
  };

  const handleDeleteAnnualReportClick = async (id: string | undefined) => {
    try {
      if (!id) return;
      await reportsApi.apiAnnualReportOnImportExportSubstancesIdDelete({ id });
      openNotificationWithIcon(
        "success",
        t("annual-report-import-export-of-ozone-depleting-substance:success-deleted", "Annual report on import/export of ozone depleting substance is deleted successfully!")
      );
      getData();
    } catch (err) {
      console.log({ err });
    }
  };


  const handleYearChange = (value: any) => {
    // Check if the value is defined and has the 'value' property
    if (value ) {
      // Access the 'value' property safely
      setSelectedYear(value);
      setRequest((prevQuery) => ({ ...prevQuery, search: value }));
   
    } else {
      // Handle the case where the value or value.value is undefined
      console.error("Invalid year value:", value);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("global.year", "Year"),
      dataIndex: "year",
      key: "year",
      sorter: true,
      sortDirections,
    },
    {
      title: t("global.submitting-date", "Submitting date"),
      dataIndex: "submitedDate",
      key: "submitedDate",
      sorter: true,
      sortDirections,
    },
    {
      title: t("requests:table.person-who-submitted", "Person who submitted"),
      dataIndex: "responsiblePerson",
      key: "responsiblePerson",
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
    return (data ?? []).map((item: any) => {
      const { id, year,serviceCompanyName,ordinalNumber, submitedDate, responsiblePerson } = item;

      return {
        key: id,
        id,
        ordinalNumber:ordinalNumber,
        year,
        serviceCompanyName,
        submitedDate:moment(submitedDate).format("MM.DD.yyyy"),
        responsiblePerson,
        action: (
          <div
            key={id}
            className="table-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
          
            <Link to={`/reports/view-mvteo-report-by-import-export-substance/${id}`}>
            <Tooltip title={t("global.view", "View")}>
              <Button className="btn-icon" type="default" shape="circle">
                <FeatherIcon icon="eye" size={17} />
              </Button>
              </Tooltip>
            </Link>
            <Tooltip title={t("global:edit", "Edit")}>
            <Button className="btn-icon" type="primary" to="#" shape="circle">
              <Link to={`/reports/edit-import-export-substance/${id}`} title={t("global:edit", "Edit")}>
                <FeatherIcon icon="edit" size={16} />
              </Link>
            </Button>
            </Tooltip>
            <>
              <Popconfirm
                title={t(
                  "annual-report-import-export-of-ozone-depleting-substance",
                  "Are you sure delete this annual report on import/export of ozone depleting substance?"
                )}
                onConfirm={() => handleDeleteAnnualReportClick(id)}
                okText={t("global.yes", "Yes")}
                cancelText={t("global.no", "No")}
              >
                  <Tooltip title={t("global.delete", "Delete")}>
                <Button
                  className="btn-icon"
                  type="danger"
                  to="#"
                  shape="circle"
                >
                   <Link to="#" title={t("global.delete", "Delete")} >
                      <FeatherIcon icon="trash-2" size={16} />
                    </Link>
                </Button>
                </Tooltip>
              </Popconfirm>
            </>
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
            "side-bar:reports.annual-report-import-export-of-ozone-depleting-substance",
            "Annual Report On Import/Export Of Ozone Depleting Substance"
          )}
          buttons={[
          
              <Button
                className="btn-add_new"
                size="default"
                type="primary"
                key="add-button"
              >
                <Link to="/reports/create-import-export-substance">
                  {t("prelog:button.add-new-import-export-of-ozone-depleting-substance", "+ Add New Import/Export Of Ozone Depleting Substance")}
                </Link>
              </Button>
         
          ]}
        />
      </CardToolbox>
      <Main>
       
      <Col span={4}>
        <Form.Item
          name="year"
        >
          <Select
            showSearch
            placeholder={t("global.year", "Year")}
            value={selectedYear}
            onChange={handleYearChange}
          >
            {generateYearOptions().map((year: any) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Form.Item>
        </Col>
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

export default AnnualReportOnImportExportSubstances;
