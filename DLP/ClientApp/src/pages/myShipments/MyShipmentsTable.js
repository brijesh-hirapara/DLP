import { Popconfirm, Skeleton, Table, Tooltip } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import FeatherIcon from "feather-icons-react";
import { UserTableStyleWrapper } from "pages/style";
import { Button } from "components/buttons/buttons";
import { sortDirections } from "constants/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import ViewShipmentsDetails from "./ViewShipmentsDetails";
import { formatDate2, formatTime } from "api/common";
import { hasPermission } from "utility/accessibility/hasPermission";


const MyShipmentsTable = ({
  data,
  isLoading,
  onPaginationChange,
  onShowSizeChange,
  onSorterChange,
}) => {
  const shipmentsTableData = [];
  const [selectedUser, setSelectedUser] = useState(null);
  const { t } = useTranslation();
  const shipmentsTableColumns = [
    {
      title: t("shipments:table.title.request-id", "Request ID"),
      dataIndex: "requestId",
      key: "requestId",
      sorter: true,
      sortDirections: sortDirections,
      align: 'left',
      // render: (_, record) => {
      //   const [id, status] = record.requestId.split("\n");
      //   return (
      //     <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', height: '100%', fontWeight: 'bold' }}>
      //       <div>{id}</div>
      //       <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{status}</div>
      //     </div>
      //   );
      // },
    },
    {
      title: t("shipments:table.title.possible-pickup", "Possible Pick-Up"),
      dataIndex: "possiblePickup",
      key: "possiblePickup",
      sorter: true,
      sortDirections: sortDirections,
      align: 'left',
      // render: (_, record) => {
      //   const [dateRange, timeRange ,status] = record.possiblePickup.split("\n");
      //   return (
      //     <div style={{display: 'flex', flexDirection: 'column', height: '100%', fontWeight:'bold'}}>
      //       <div>{dateRange}</div>
      //       <div>{timeRange}</div>
      //       <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8}}>{status}</div>
      //     </div>
      //   );
      // },
    },
    {
      title: t("shipments:table.title.requested-delivery", "Requested Delivery"),
      dataIndex: "requestedDelivery",
      key: "requestedDelivery",
      sorter: true,
      sortDirections: sortDirections,
      align: "left",
      // render: (_, record) => {
      //   const [dateRange, timeRange ,status] = record.requestedDelivery.split("\n");
      //   return (
      //     <div style={{display: 'flex', flexDirection: 'column', height: '100%', fontWeight:'bold'}}>
      //       <div>{dateRange}</div>
      //       <div>{timeRange}</div>
      //       <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8}}>{status}</div>
      //     </div>  
      //   );
      // },
    },
    {
      title: t("shipments:table.title.documents", "Documents"),
      dataIndex: "documents",
      key: "documents",
      sorter: true,
      sortDirections: sortDirections,
      align: 'left',
      // render: (_, record) => {
      //   const [id, status] = record.documents.split("\n");
      //   return (
      //     <div style={{display: 'flex', flexDirection: 'column', height: '100%', fontWeight:'bold'}}>
      //       <div style={{textDecoration: 'underline', marginBottom: '20px'}}>{id}</div>
      //       <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8}}>{status}</div>
      //     </div>
      //   );
      // },
    },
    {
      title: t("shipments:table.title.actions", "Actions"),
      dataIndex: "actions",
      key: "actions",
      width: "120px",
      align: "left",
    },
  ];


  (data?.items ?? []).map((shipments) => {
    const {
      id,
      requestId,
    } = shipments;

    const pickupDelInfo = shipments.transportCarrier?.[0] || {};
    const possiblePickupFromDate = pickupDelInfo?.estimatedPickupDateTimeFrom;
    const possiblePickupToDate = pickupDelInfo?.estimatedPickupDateTimeTo;
    const possibleDeliveryFromDate = pickupDelInfo?.estimatedDeliveryDateTimeFrom;
    const possibleDeliveryToDate = pickupDelInfo?.estimatedDeliveryDateTimeTo;
    const isPickupConfirmed = shipments.isPickupConfirmed;
    const isDeliveryConfirmed = shipments.isDeliveryConfirmed;
    const isPODUploaded = shipments.isPODUploaded;
    const isPODConfirmed = shipments.isPODConfirmed;
    const isTruckAssigned = shipments.isTruckAssigned;
    const pickupDetails = shipments.transportPickup?.[0] || {}
    const deliveryDetails = shipments.transportDelivery?.[0] || {}

    return shipmentsTableData.push({
      key: id,
      requestId: (
        <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', height: '100%', fontWeight: 'bold' }}>
        <div>{requestId}</div>
        <div>{t("global.total-distance:", "Total Distance:")}</div>
        <div>{t("global.weight:", "Weight:")}</div>
        
        <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{ isTruckAssigned ? t("shipments:table.truck-assigned", "Truck Assigned"): t("shipments:table.truck-not-assigned", "Truck Not Assigned")}</div>
      </div>
      ),
      possiblePickup: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontWeight: 'bold' }}>
          <div>{formatDate2(possiblePickupFromDate) + " - " + formatDate2(possiblePickupToDate)}</div>
          <div>{formatTime(possiblePickupFromDate) + " - " + formatTime(possiblePickupToDate)}</div>
          <div>{pickupDetails.city + ", " + pickupDetails.postalCode + ", "+ pickupDetails.countryName}</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{isPickupConfirmed ? t("shipments:table.pickup-confirmed", "Pickup Confirmed") : t("shipments:table.pickup-not-confirmed", "Pickup Not Confirmed")}</div>
        </div>
      ),
      requestedDelivery: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontWeight: 'bold' }}>
          <div>{formatDate2(possibleDeliveryFromDate) + " - " + formatDate2(possibleDeliveryToDate)}</div>
          <div>{formatTime(possibleDeliveryFromDate) + " - " + formatTime(possibleDeliveryToDate)}</div>
          <div>{deliveryDetails.city + ", " + deliveryDetails.postalCode + ", "+ deliveryDetails.countryName}</div>
          <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{isDeliveryConfirmed ? t("shipments:table.delivery-confirmed", "Delivery Confirmed") : t("shipments:table.delivery-not-confirmed", "Delivery Not Confirmed")}</div>
        </div>
      ),
      documents: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontWeight: 'bold' }}>
          <div style={{ textDecoration: 'underline', marginBottom: '20px' }}>{t("shipments:table.pod-ivote", "POD iVote")}</div>
          {isPODUploaded ? (
            <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{t("shipments:table.pod-uploaded", "POD Uploaded")}</div>
          ) : (
            <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{t("shipments:table.pod-not-uploaded", "POD NOT Uploaded")}</div>
          )
          }
          {isPODConfirmed && (
            <div style={{ fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>{t("shipments:table.pod-confirmed", "POD Confirmed")}</div>
          )
          }
        </div>
      ),
      actions: (
        <div className="table-actions" style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', clear: "both" }}>
          {/* 👁 View */}
          <Tooltip title={t("global.view", "View")}>
          {hasPermission("my-shipments:view-details") &&
            <Button className="btn-icon" type="info" shape="circle">
              <Link to={`/my-shipment/${id}`}>
                <FeatherIcon icon="eye" size={18} style={{ display: "flex", justifyContent: "center" }} />
              </Link>
            </Button>
            }
          </Tooltip>
  
          {hasPermission("confirm-pod:add") && isPODUploaded && (
          <Tooltip title={t("global.confirm-pod", "Confirm POD")}>
          <Popconfirm
                title={
                    `${t(
                      "shippers:alert-toggle-confirm-pod",
                      `Are you sure you want to Confirm POD`
                    ) + " "}?`
                }
                onConfirm={() => (id)}
                okText="Yes"
                cancelText="No"
              >
            <Button
              type="default"
              onClick={() => window.location.href = `/shipments/${id}/confirm-pod`}
              style={{
                fontSize: 12,
                backgroundColor: '#888', 
                color: '#fff', 
                border: '1px solid #333',
                padding: '0 8px',
                height: 'auto'
            }}
            >
              {t("my-shipments.confirmPOD-title", "Confirm POD")} 
            </Button>
            </Popconfirm>
          </Tooltip>
          )}
        </div>
      ),
    });
  });

  const isInitialLoading = isLoading && !data?.items;

  // const rowClassName = (record) => {
  //   if (record.documents.includes("POD Uploaded")) return "sky-blue-row";
  //   if (record.documents.includes("POD NOT Uploaded")) return "row-error";
  //   if (record.documents.includes("POD Confirmed")) return "row-process";
  //   return "";
  // };

  const rowClassName = (record) => {
    if (record.isPODUploaded) return "sky-blue-row";
    if (!record.isPODUploaded) return "row-error";
    if (record.isPODConfirmed) return "row-process";
    return "";
  };

  return (
    <>
      {selectedUser && <ViewShipmentsDetails
        onCancel={() => setSelectedUser(null)}
        user={selectedUser}
        visible={selectedUser !== null}
      />}

      <Cards headless>
        <UserTableStyleWrapper>
          <TableWrapper className="table-responsive">
            {isInitialLoading ? (
              <Cards headless>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Cards>
            ) : (
              <Table
                dataSource={shipmentsTableData}
                columns={shipmentsTableColumns}
                showSorterTooltip={false}
                loading={isLoading}
                rowClassName={rowClassName}
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
                rowKey="key"
              />
            )}
          </TableWrapper>
        </UserTableStyleWrapper>
      </Cards>
      <style>
        {`
          /* === Table Layout & Spacing === */
          .ant-table-content table {
            border-collapse: separate !important;
            border-spacing: 0 12px !important;
          }

          .ant-table-tbody > tr > td {
            border-radius: 0 !important;
            background: transparent !important;
          }

          .ant-table,
          .ant-table-container,
          .ant-table-content,
          .ant-table-thead > tr > th {
            border-radius: 0 !important;
          }

          /* === Row Colors with strong specificity === */
          .ant-table-row.sky-blue-row .ant-table-cell {
            background-color: #e6f7ff !important;
            color: #096dd9 !important;
          }

          .ant-table-row.row-error .ant-table-cell {
            background-color: #fff1f0 !important;
            color: #cf1322 !important;
          }

          .ant-table-row.row-process .ant-table-cell {
            background-color: #e6fffb !important;
            color: #389e0d !important;
          }

          /* Optional: rounded corners for colored rows */
          .ant-table-row.sky-blue-row .ant-table-cell:first-child,
          .ant-table-row.row-error .ant-table-cell:first-child,
          .ant-table-row.row-process .ant-table-cell:first-child {
            border-top-left-radius: 6px !important;
            border-bottom-left-radius: 6px !important;
          }

          .ant-table-row.sky-blue-row .ant-table-cell:last-child,
          .ant-table-row.row-error .ant-table-cell:last-child,
          .ant-table-row.row-process .ant-table-cell:last-child {
            border-top-right-radius: 6px !important;
            border-bottom-right-radius: 6px !important;
          }
        `}
      </style>
    </>
  );
};

export default MyShipmentsTable;
