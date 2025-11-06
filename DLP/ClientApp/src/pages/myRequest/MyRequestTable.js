import { Popconfirm, Skeleton, Table, Tooltip } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import FeatherIcon from "feather-icons-react";
import { UserTableStyleWrapper } from "pages/style";
import { Button } from "components/buttons/buttons";
import { UsersApi } from "api";
import { sortDirections } from "constants/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import moment from "moment";
import { CountdownTimer } from "utility/CountdownTimer/CountdownTimer";

const usersApi = new UsersApi();

const getRequestStatus = (status, record) => {
  const normalized = status?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, "") || "";

  const isActive = normalized.includes("active") || normalized.includes("inshipment");
  const isCompleted = normalized.includes("completed");
  const isUnderEvaluation = normalized.includes("underevaluation");
  const isCanceled = normalized.includes("cancel");

  const color = isActive
    ? "#1890ff" // blue
    : isCompleted
    ? "#52c41a" // green
    : isUnderEvaluation
    ? "#fa8c16" // orange
    : isCanceled
    ? "#f5222d" // red
    : "#d9d9d9"; // grey

  return (
    <>
      <span
        className={`ant-tag ${color}`}
        style={{
          backgroundColor: color,
          color: "white",
          border: "none"
        }}
      >
        {status}
      </span>
          {(isActive) && (
            <span style={{ color: color }}>{<CountdownTimer startTime={record} duration={24}/>}</span>
          )}
          {(isUnderEvaluation) && (
            <span style={{ color: color }}>{<CountdownTimer startTime={record} duration={48}/>}</span>
          )}
    </>
  );
};


const MyRequestTable = ({
  data,
  isLoading,
  onPaginationChange,
  onShowSizeChange,
  onSorterChange,
  refetch
}) => {
  const requestsTableData = [];
  console.log(data, "data");

  const { t } = useTranslation();
 
  const requestsTableColumns = [
    {
      title: t("requests:table.title.request-id", "Request ID"),
      dataIndex: "requestId",
      key: "requestId",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.possible-pickup", "Posible Pick-Up"),
      dataIndex: "posiblePickup",
      key: "posiblePickup",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.requested-delivery", "Requested Delivery"),
      dataIndex: "requestedDelivery",
      key: "requestedDelivery",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.total-distance", "Total Distance"),
      dataIndex: "totalDistance",
      key: "totalDistance",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.goods", "Goods"),
      dataIndex: "goods",
      key: "goods",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.lowest-price", "Lowest Price"),
      dataIndex: "lowestPrice",
      key: "lowestPrice",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.offers", "Offers"),
      dataIndex: "offers",
      key: "offers",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("requests:table.title.actions", "Actions"),
      dataIndex: "actions",
      key: "actions",
      width: "120px",
      align: "center",
    },
  ];

  const onDeleteConfirm = async (id, isDeleted) => {
    try {
      await usersApi.templateIdDelete({ id, body: isDeleted });
      await refetch();
      openNotificationWithIcon(
        "success",
        t("users:notification.delete.title.success", "Success"),
        t(
          "users:notification.delete.description.success",
          "This is description about delete successfuly alert"
        )
      );
    } catch (error) {}
  };

  const tableData = (data?.items ?? []).map(item => {
    const pickupInfo = item.transportInformation?.[0] || {};
    const goods = item.transportGoods?.[0] || {};
    const pickup = item.transportPickup?.[0] || {};
    const delivery = item.transportDelivery?.[0] || {};
    const deliveryInfo = pickupInfo; 
    
  const estimatedPickup =
    pickupInfo.pickupDateFrom && pickupInfo.pickupDateTo
      ? `${moment(pickupInfo.pickupDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.pickupDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.pickupTimeFrom || pickupInfo.pickupTimeTo
          ? `${moment(pickupInfo.pickupTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.pickupTimeTo).format("HH:mm") || ''}\n`
          : '') +
        `${pickup.city || ''}, ${pickup.postalCode || ''}, ${pickup.countryName || ''}`
      : "N/A";
  
  const estimatedDelivery =
    pickupInfo.deliveryDateFrom && pickupInfo.deliveryDateTo
      ? `${moment(pickupInfo.deliveryDateFrom).format("DD.MM.YYYY")} - ${moment(pickupInfo.deliveryDateTo).format("DD.MM.YYYY")}\n` +
        (pickupInfo.deliveryTimeFrom || pickupInfo.deliveryTimeTo
          ? `${moment(pickupInfo.deliveryTimeFrom).format("HH:mm") || ''} - ${moment(pickupInfo.deliveryTimeTo).format("HH:mm") || ''}\n`
          : '') +
        `${delivery.city || ''}, ${delivery.postalCode || ''}, ${delivery.countryName || ''}`
      : "N/A";
  const length = (goods.length || 0);
  const width = (goods.width || 0);
  const height = (goods.height || 0);
  
  const ldmValue = length && width && height ? (length * width * height) : 0;  
  
    const ldmText = ` ${ldmValue.toFixed(2)} m³`;   
  
    const goodsStr = `LDM ${ldmText || 0} \nWeight ${goods.weight || 0} kg`;
    const currencyName = pickupInfo.currencyName ?? "EUR"

    
    return requestsTableData.push({
      key: item.id,
      requestId: item.requestId,
      ordinalNumber: item.ordinalNumber,
      companyName: pickup.companyName || "",
      posiblePickup: estimatedPickup.split("\n").map((line, index) => (
        <div key={index}>{line}</div>
      )),
      requestedDelivery: estimatedDelivery.split("\n").map((line, index) => (
        <div key={index}>{line}</div>
      )),
      totalDistance: item.totalDistance ? `${item.totalDistance} km` : '',
      goods: goodsStr.split("\n").map((line, index) => (
        <div key={index}>{line}</div>
      )),
      status: getRequestStatus(item.statusDesc || "",item.createdAt),
      lowestPrice: item.lowestPrice + " " +  currencyName || "-",
      offers: item.offerCount > 0 ?  item.offerCount  + " Offers" : item.offerCount  + " Offer",
      actions: (
        <div className="table-actions" style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", paddingBottom: "4px 0" }}>
          {/* 👁 View */}
          <Tooltip title={t("global.view", "View")}>
              <Button className="btn-icon" type="info" shape="circle">
                <Link to={`/my-requests/${item.id}`}>
                    <FeatherIcon icon="eye" size={18} style={{ display: "flex", justifyContent: "center" }}/>
                </Link>
              </Button>
          </Tooltip>

          {/* 🗑 Delete */}
          <Popconfirm
            title={t(
              "requests:alert.delete-confirm",
              "This step is irreversible, are you sure you want to delete {{dynamicValue}}?",
              { dynamicValue: item.ordinalNumber }
            )}
            onConfirm={() => onDeleteConfirm(item.id)}
            okText="Yes"
            cancelText="No"
          >
            {item.statusDesc !== "Canceled" && item.status !== "Completed" && (
              <Tooltip title={t("global.delete", "Delete")}>
                <Button className="btn-icon" type="danger" shape="circle">
                  <FeatherIcon icon="trash-2" size={18} />
                </Button>
              </Tooltip>
            )}
          </Popconfirm>

          {item.statusDesc === "UnderEvaluation" && (
            <Tooltip title={t("global.choose-offer", "Choose Offer")}>
              <Link to={`/my-requests/${item.id}/choose-offer`} style={{ fontSize: 12, textDecoration: 'underline', color: '#5f63f2' }}
              >
                {t("choose-offer.title", "Choose Offer")}
              </Link>
            </Tooltip>
          )}
        </div>
      ),
    });
  });

  const isInitialLoading = isLoading && !data?.items;

  return (
    <>
      <Cards headless>
        <UserTableStyleWrapper>
          <TableWrapper className="table-responsive">
            {isInitialLoading ? (
              <Cards headless>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Cards>
            ) : (
              <Table
                dataSource={requestsTableData}
                columns={requestsTableColumns}
                showSorterTooltip={false}
                loading={isLoading}
                rowKey="key"
                pagination={{
                  pageSize: data.pageSize,
                  current: data.pageIndex,
                  total: data.totalCount,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 50, 100, 1000],
                  onChange: onPaginationChange,
                  onShowSizeChange: onShowSizeChange,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={(_, __, sorter) => onSorterChange(sorter)}
              />
            )}
          </TableWrapper>
        </UserTableStyleWrapper>
      </Cards>
    </>
  );
};

export default MyRequestTable;
