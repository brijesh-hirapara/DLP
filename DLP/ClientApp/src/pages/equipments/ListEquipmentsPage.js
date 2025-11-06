import { Col, Popconfirm, Radio, Row, Tooltip } from "antd";
import Table from "antd/es/table";
import { EquipmentsApi } from "api/api";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { Cards } from "components/cards/frame/cards-frame";
import FeatherIcon from "feather-icons-react";
import { useTableSorting } from "hooks/useTableSorting";
import moment from "moment";
import { UserTableStyleWrapper } from "pages/style";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { Button } from "../../components/buttons/buttons";
import { PageHeader } from "../../components/page-headers/page-headers";
import {
  CardToolbox,
  Main,
  TableWrapper,
  TopToolBox,
} from "../../container/styled";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";

const equipmentsApi = new EquipmentsApi();

function ListEquipmentsPage() {
  const tableData = [];
  const sortDirectionsInit = ["descend", "ascend", "descend"];
  const { t } = useTranslation();

  const tableColumns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("equipments:table.title.branchOfficeName", "Branch Office Name"),
      dataIndex: "branchOfficeName",
      key: "branchOfficeName",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.typeOfEquipment", "Type of Equipment"),
      dataIndex: "typeOfEquipment",
      key: "typeOfEquipment",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.manufacturer", "Manufacturer"),
      dataIndex: "manufacturer",
      key: "manufacturer",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.serialNumber", "Serial Number"),
      dataIndex: "serialNumber",
      key: "serialNumber",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.type", "Type"),
      dataIndex: "type",
      key: "type",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.dataOfPurchase", "Date Of Purchase"),
      dataIndex: "dateOfPurchase",
      key: "dateOfPurchase",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.model", "Model"),
      dataIndex: "model",
      key: "model",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.yearOfProduction", "Year Of Production"),
      dataIndex: "yearOfProduction",
      key: "yearOfProduction",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("equipments:table.title.refrigerantType", "Refrigerant Type"),
      dataIndex: "refrigerantType",
      key: "refrigerantType",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("users:table.title.action", "Action"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  const [equipments, setEquipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sorting, onSorterChange } = useTableSorting();
  const [request, setRequest] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
    isArchived: false,
  });

  useEffect(() => {
    getEquipments();
  }, [request, sorting]);

  const getEquipments = async () => {
    setIsLoading(true);
    const { data } = await equipmentsApi.apiEquipmentsGet({
      ...request,
      ...sorting,
    });
    setEquipments(data.items);
    setIsLoading(false);
  };

  const onSearchChange = (value) => {
    setRequest({ ...request, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setRequest((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  const onHandleDelete = async (id) => {
    try {
      await equipmentsApi.apiEquipmentsIdDelete({ id: id });
      await getEquipments();
    } catch (err) { }
  };

  equipments?.map((equipment) => {
    const {
      typeOfEquipment,
      typeOfEquipmentOther,
      typeOfCoolingSystem,
      dateOfPurchase,
      typeOfCoolingSystemOther,
      id,
    } = equipment;

    equipment.typeOfEquipment = !typeOfEquipment
      ? typeOfEquipmentOther
      : typeOfEquipment;
    equipment.typeOfCoolingSystem = !typeOfCoolingSystem
      ? typeOfCoolingSystemOther
      : typeOfCoolingSystem;
    equipment.dateOfPurchase = dateOfPurchase ? moment(dateOfPurchase).format("DD.MM.yyyy") : 'N/A';

    return tableData.push({
      ...equipment,
      key: equipment?.id,
      action: (
        <div className="table-actions" style={{ clear: "both" }}>
        <Tooltip title={t("global.view", "View")}>
          <Link to={`/equipments/${id}`}>
            <Button className="btn-icon" type="info" shape="circle">
              <FeatherIcon icon="eye" size={25} />
            </Button>
          </Link>
          </Tooltip>
          {!request.isArchived && <> 
            <Tooltip title={t("global:edit", "Edit")}>
           <Link to={`/equipments/${id}/edit`}>
            <Button className="btn-icon" type="info" shape="circle" title={t("global:edit", "Edit")}>
              <FeatherIcon icon="edit" size={25} />
            </Button>
          </Link>
          </Tooltip>
          <Popconfirm
            title={`${t(
              "equipments:actions.delete",
              "Are you sure you want to delete this equipment!"
            )}`}
            onConfirm={() => onHandleDelete(id)}
            okText="Yes"
            cancelText="No"
          >
           <Tooltip title={t("global.delete", "Delete")}>
            <Button className="btn-icon" type="primary" to="#" shape="circle" title={t("global.delete", "Delete")}>
              <FeatherIcon icon={"trash"} size={25} />
            </Button>
            </Tooltip>
          </Popconfirm> 
          </>}
        </div>
      ),
    });
  });

  return (
    <>
      <CardToolbox>
        <PageHeader
          ghost
          title={t("equipments.title", 'Equipment')}
          buttons={[
           
              <ExportButtonPageApiHeader key="1" callFrom={'Equipments'} filterType={""} listArchived={request.isArchived} municipalityId={""} entityId={""} search={request.search}  />,
             
                <Button
                  className="btn-add_new"
                  size="default"
                  type="primary"
                  key="1"
                >
                  <Link to="/equipments/create">
                    {t("equipments:button.add-new", "+ Add New Equipment")}
                  </Link>
                </Button>
             
          ]}
        />
      </CardToolbox>

      <Main>
        <Cards headless>
          <Row gutter={15}>
            <Col xs={24}>
              <TopToolBox>
                <Row gutter={15}>
                  <Col lg={10} md={10} xs={24}>
                    <div className="table-search-box">
                      <AutoComplete
                        onSearch={onSearchChange}
                        placeholder={"Search for Equipment..."}
                        width="100%"
                        patterns
                      />
                    </div>
                  </Col>
                  <Col lg={8} md={8} xs={12}>
                    <Radio.Group
                      name="filterKey"
                      onChange={(e) =>
                        setRequest((prevQuery) => ({
                          ...prevQuery,
                          isArchived: e.target.value,
                        }))
                      }
                      value={request.isArchived}
                    >
                      <Radio.Button key={"Only Available"} value={false}>
                        {t("equipments:radio.only-available", "Only Available")}
                      </Radio.Button>
                      <Radio.Button key={"Archived"} value={true}>
                        {t("equipments:radio.archived", "Archived")}
                      </Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
              </TopToolBox>
            </Col>
          </Row>
          <Cards headless>
            <UserTableStyleWrapper>
              <TableWrapper className="table-responsive">
                <Table
                  dataSource={tableData}
                  columns={tableColumns}
                  showSorterTooltip={false}
                  loading={isLoading}
                  pagination={{
                    pageSize: equipments.pageSize,
                    current: equipments.pageIndex,
                    total: equipments.totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 50, 100, 1000],
                    onChange: onPaginationChange,
                    onShowSizeChange: onShowSizeChange,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  onChange={(_, __, sorter) => onSorterChange(sorter)}
                />
              </TableWrapper>
            </UserTableStyleWrapper>
          </Cards>
        </Cards>
      </Main>
    </>
  );
}

export default ListEquipmentsPage;
