import { Popconfirm, Skeleton, Table, Tooltip } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import FeatherIcon from "feather-icons-react";
import { UserTableStyleWrapper } from "pages/style";
import { Button } from "components/buttons/buttons";
import {  UsersApi } from "api";
import { sortDirections } from "constants/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import OrdinalNumber from "components/common/OrdinalNumber";
import { formatDate } from "api/common";
import { hasPermission } from "utility/accessibility/hasPermission";

const usersApi = new UsersApi();

const MyTemplatesTable = ({
  data,
  isLoading,
  onPaginationChange,
  onShowSizeChange,
  onSorterChange,
  refetch
}) => {
  const templatesTableData = [];

  const { t } = useTranslation();
  const templatesTableColumns = [
    {
        title: t("global.ordinal-number", "No."),
        dataIndex: "_ordinalNumber",
        key: "_ordinalNumber",
        sorter: false,
      },
      {
        title: t("templates:table.title.template-name", "Template Name"),
        dataIndex: "templateName",
        key: "templateName",
        sorter: true,
        sortDirections: sortDirections,
      },
      {
        title: t("templates:table.title.pickup-delivery", "Pickup – Delivery (addresses)"),
        dataIndex: "pickupDelivery",
        key: "pickupDelivery",
        sorter: false,
      },
      {
        title: t("templates:table.title.type-of-goods", "Type of Goods"),
        dataIndex: "typeOfGoodsName",
        key: "typeOfGoodsName",
        sorter: false,
      },
      {
        title: t("templates:table.title.date-created", "Date Created"),
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        sortDirections: sortDirections,
      },
      {
        title: t("templates:table.title.actions", "Actions"),
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

  const pickupDeliveryFormat = (data) =>{
    const pickupCountry = data.transportPickup[0].countryName;
    const deliveryCountry = data.transportDelivery[0].countryName;
    const pickupCity = data.transportPickup[0].city;
    const deliveryCity = data.transportDelivery[0].city;
    const pickupCountryCode = pickupCountry?.match(/\(([^)]+)\)/)?.[1] || pickupCountry;
    const deliveryCountryCode = deliveryCountry?.match(/\(([^)]+)\)/)?.[1] || deliveryCountry;
    // "Bitola, MK – Sofia, BG",
    const combineData = pickupCity + ", " + pickupCountryCode + " - " + deliveryCity + ", " + deliveryCountryCode;
    return combineData
  }

  const typeOfGoodsName = (data) =>{
    const goods = data.transportGoods[0].typeOfGoodsName;
    return goods
  }



  data?.items?.map((templates) => {
    const {
      id,
      ordinalNumber,
      templateName,
      createdAt,
    } = templates;

    return templatesTableData.push({
      key: id,
      ordinalNumber: ordinalNumber,
      _ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
      templateName: ( <Link 
        to={`/my-requests/new-transport-request/${id}`} 
        style={{ color: "black", textDecoration: "underline" }}
      >
        {templateName}
      </Link>),
      pickupDelivery: pickupDeliveryFormat(templates),
      typeOfGoodsName: typeOfGoodsName(templates),
      createdAt: formatDate(createdAt),
      actions: (
        <div className="table-actions" style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap", paddingBottom: "4px 0"}}>
  
          {/* ✏ Edit */}
          {hasPermission("my-templates:edit") && (
          <Tooltip title={t("global.edit", "Edit")}>
            <Link to={`/my-requests/new-transport-request-template/${id}`}>
              <Button className="btn-icon" type="primary" shape="circle">
                <FeatherIcon icon="edit" size={18} />
              </Button>
            </Link>
          </Tooltip>
        )}
          {/* 🗑 Delete */}
          {hasPermission("my-templates:delete") && (
          <Popconfirm
            title={t(
              "codebook-countries.delete-confirmation",
              "Are you sure you want to delete?",
              { dynamicValue: ordinalNumber }
            )}
            onConfirm={() => onDeleteConfirm(id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={t("global.delete", "Delete")}>
              <Button className="btn-icon" type="danger" shape="circle">
                <FeatherIcon icon="trash-2" size={18} />
              </Button>
            </Tooltip>
          </Popconfirm>
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
                dataSource={templatesTableData}
                columns={templatesTableColumns}
                showSorterTooltip={false}
                loading={isLoading}
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

export default MyTemplatesTable;
