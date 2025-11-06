/* eslint-disable */

import { Table, Popconfirm, Skeleton, Tooltip } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import { UserTableStyleWrapper } from "pages/style";
import FeatherIcon from "feather-icons-react";
import Heading from "../../components/heading/heading";
import { Button } from "../../components/buttons/buttons";

import { UsersApi } from "api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
import moment from "moment";
import ViewUserDetais from "./ViewUserDetails";
import { useState } from "react";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import OrdinalNumber from "components/common/OrdinalNumber";
import { hasPermission } from "utility/accessibility/hasPermission";

const usersApi = new UsersApi();

const getUserStatus = (user) => {
  const color = user.isPending
    ? "not-confirm"
    : user.isDeleted
      ? "blocked"
      : user.isActive
        ? "active"
        : "deactivate";
  const text = user.isPending
    ? "Not Confirmed"
    : user.isDeleted
      ? "Deleted"
      : user.isActive
        ? "Active"
        : "Disabled";
  return <span className={`ant-tag ${color}`}>{text}</span>;
};

const UsersTable = ({
  data,
  refetch,
  isLoading,
  onPaginationChange,
  onShowSizeChange,
  onSorterChange,
}) => {
  const usersTableData = [];
  const sortDirectionsInit = ["descend", "ascend", "descend"];
  const [selectedUser, setSelectedUser] = useState(null);
  const token = useDecodeJWT();
  const { t } = useTranslation();

  const usersTableColumns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
      colSpan: 1,
      onCell: () => ({
        colSpan: 1,
      }),
    },
    {
      title: t("users:table.title.user", "User"),
      dataIndex: "user",
      key: "user",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("users:table.title.email", "Email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections: sortDirectionsInit,
    },
    {
      title: t("users:table.title.user-group", "User Group"),
      dataIndex: "position",
      key: "position",
      sorter: false,
      colSpan: 3,
      onCell: () => ({
        colSpan: 3,
      }),
    },
    {
      title: t("users:table.title.status", "Status"),
      dataIndex: "status",
      key: "status",
      sorter: false,
    },
    {
      title: t("users:table.title.createdAt", "Join Date"),
      dataIndex: "joinDate",
      key: "joinDate",
      sorter: false,
    },
    {
      title: t("users:table.title.action", "Action"),
      dataIndex: "action",
      key: "action",
      width: "90px",
    },
  ];

  const onDeleteConfirm = async (id, isDeleted) => {
    try {
      await usersApi.usersIdDelete({ id, body: isDeleted });
      await refetch();
      openNotificationWithIcon(
        "success",
        t("users:notification.delete.title.success", "Success"),
        t(
          "users:notification.delete.description.success",
          "This is description about delete successfuly alert"
        )
      );
    } catch (error) { }
  };

  const onToggleDeleteActivate = async (id, isDeleted) => {
    try {
      await usersApi.usersIdDeleteTooglePut({
        id,
        toggleUserActivateCommand: { isDeleted },
      });
      if (isDeleted) {
        openNotificationWithIcon(
          "success",
          t("users:notification.toggle-enable.title.success", "Success"),
          t(
            "users:notification.toggle-enable.description.success",
            "User enable successfully."
          )
        );
      } else {
        openNotificationWithIcon(
          "success",
          t("users:notification.toggle-disable.title.success", "Success"),
          t(
            "users:notification.toggle-disable.description.success",
            "User disable successfully."
          )
        );
      }
      await refetch();
    } catch (error) { }
  };

  const onToggleActivate = async (id, isActive) => {
    try {
      await usersApi.usersIdTooglePut({
        id,
        toggleUserActivateCommand: { isActive },
      });
      if (isActive) {
        openNotificationWithIcon(
          "success",
          t("users:notification.toggle-enable.title.success", "Success"),
          t(
            "users:notification.toggle-enable.description.success",
            "This is description about enable successfuly alert"
          )
        );
      } else {
        openNotificationWithIcon(
          "success",
          t("users:notification.toggle-disable.title.success", "Success"),
          t(
            "users:notification.toggle-disable.description.success",
            "This is description about disable successfuly alert"
          )
        );
      }
      await refetch();
    } catch (error) { }
  };

  const onResendEmailConfirmation = async (id) => {
    await usersApi.usersIdResendConfirmationPost({ id });
    openNotificationWithIcon(
      "success",
      t(
        "users:resend.confirmation.email.success",
        "Email confirmation was send successfully."
      )
    );
  };

  data?.items?.map((user) => {
    const {
      id,
      ordinalNumber,
      firstName,
      lastName,
      email,
      roleName,
      createdAt,
      isActive,
      isDeleted,
      isPending,
      isAdmin,
    } = user;

    const fullName = `${firstName} ${lastName}`;
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleString("ba-BS", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    return usersTableData.push({
      key: id,
      ordinalNumber: <OrdinalNumber value={ordinalNumber} />,
      user: (
        <div className="user-info">
          <figcaption>
            <Heading className="user-name" as="h6">
              {fullName}
            </Heading>
          </figcaption>
        </div>
      ),
      email: email,
      position: roleName,
      status: getUserStatus(user),
      joinDate: moment(formattedDate).format("DD/MM/yyyy"),
      action: (
        <div className="table-actions" style={{ clear: "both" }}>
          <Tooltip title={t("global.view", "View")}>
            <Button
              className="btn-icon"
              type="info"
              shape="circle"
              onClick={() => setSelectedUser(user)}
              title={t("global.view", "View")}
            >
              <FeatherIcon icon="eye" size={25} />
            </Button>
          </Tooltip>
          {isPending ? (
            <>
              <Popconfirm
                title={`${t(
                  "users:actions.send.confirmation.email",
                  "Resend email confirmation for {{dynamicValue}}",
                  { dynamicValue: fullName }
                )}`}
                onConfirm={() => onResendEmailConfirmation(id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title={t("global.mail", "Mail")}>
                  <Button
                    className="btn-icon"
                    type="primary"
                    to="#"
                    shape="circle"
                    title={t("global.mail", "Mail")}
                  >
                    <FeatherIcon icon={"mail"} size={25} />
                  </Button>
                </Tooltip>
              </Popconfirm>
            </>
          ) : (
            <>
              {!isDeleted ? (
                <>
                  {hasPermission("users:edit") && (
                    <Tooltip title={t("global:edit", "Edit")}>
                      <Link to={`/users/${id}/edit`}>
                        <Button className="btn-icon" type="info" shape="circle" title={t("global:edit", "Edit")}>
                          <FeatherIcon icon="edit" size={25} />
                        </Button>
                      </Link>
                    </Tooltip>
                  )}
                  {
                    token?.email != email && !isAdmin && 
                    (
                      (isActive && hasPermission("users:deactivate")) ||
                      (!isActive && hasPermission("users:activate"))
                    ) && (
                      <Popconfirm
                        title={
                          !isActive
                            ? `${t(
                              "users:alert-toggle-enable",
                              `Are you sure you want to enable`
                            ) + " "+ fullName}?`
                            : `${t(
                              "users:alert-toggle-disable",
                              `Are you sure you want to disable`
                            )+ " " + fullName}?`
                        }
                        onConfirm={() => onToggleActivate(id, !isActive)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title={t("global:enable-disable", "Enable-Disable")}>
                          <Button
                            className="btn-icon"
                            type={isActive ? "danger" : "primary"}
                            to="#"
                            shape="circle"
                            title={t("global:enable-disable", "Enable-Disable")}
                          >
                            <FeatherIcon
                              icon={isActive ? `toggle-right` : "toggle-left"}
                              size={25}
                            />
                          </Button>
                        </Tooltip>
                      </Popconfirm>
                    )
                  }

                </>
              ) : null}
              {isDeleted ? (
                <>
                  {hasPermission("users:delete") && !isAdmin &&
                    <Popconfirm
                      title={
                        !isActive
                          ? `${t(
                            "users:alert.toggle-active",
                            "Are you sure you want to active {{dynamicValue}}",
                            { dynamicValue: fullName }
                          )}`
                          : `${t(
                            "users:alert.toggle-delete",
                            "Are you sure you want to Delete {{dynamicValue}}",
                            { dynamicValue: fullName }
                          )}`
                      }
                      onConfirm={() => onToggleDeleteActivate(id, !isDeleted)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title={t("global.active", "Active")}>
                        <Button
                          className="btn-icon"
                          type={isActive ? "danger" : "primary"}
                          to="#"
                          shape="circle"
                          title={t("global.active", "Active")}
                        >
                          <FeatherIcon
                            icon={isActive ? `toggle-right` : "toggle-left"}
                            size={25}
                          />
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  }
                </>
              ) : null}
            </>
          )}
          {token?.email != email && (
            !isAdmin && <Popconfirm
              title={t(
                "users:alert.delete-confirm",
                "This step is irreversible, are you sure you want to delete {{dynamicValue}}?",
                { dynamicValue: fullName }
              )}
              onConfirm={() => onDeleteConfirm(id, isDeleted)}
              okText="Yes"
              cancelText="No"
            >
              {hasPermission("users:delete") && !isDeleted &&
                <Tooltip title={t("global.delete", "Delete")}>
                  <Button className="btn-icon" type="danger" to="#" shape="circle" title={t("global.delete", "Delete")}>
                    <FeatherIcon icon="trash-2" size={25} />
                  </Button>
                </Tooltip>
              }
            </Popconfirm>
          )}
        </div>
      ),
    });
  }); 4

  const isInitialLoading = isLoading && !data?.items;

  return (
    <>
      {selectedUser && <ViewUserDetais
        onCancel={() => setSelectedUser(null)}
        user={selectedUser}
        visible={selectedUser !== null}
      />}

        <UserTableStyleWrapper>
          <TableWrapper className="table-responsive">
            {isInitialLoading ? (
              <Cards headless>
                <Skeleton active paragraph={{ rows: 5 }} />
              </Cards>
            ) : (
              <Table
                dataSource={usersTableData}
                columns={usersTableColumns}
                showSorterTooltip={true}
                loading={isLoading}
                pagination={{
                  pageSize: data.pageSize,
                  current: data.pageIndex,
                  total: data.totalCount,
                  onChange: onPaginationChange,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 50, 100, 1000],
                  onShowSizeChange: onShowSizeChange,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={(_, __, sorter) => onSorterChange(sorter)}
              />
            )}
          </TableWrapper>
        </UserTableStyleWrapper>
    </>
  );
};

export default UsersTable;
