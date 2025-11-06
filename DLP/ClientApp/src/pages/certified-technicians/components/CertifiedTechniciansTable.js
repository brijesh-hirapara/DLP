import { Popconfirm, Skeleton, Table, Tooltip } from "antd";
import { Cards } from "components/cards/frame/cards-frame";
import { TableWrapper } from "container/styled";
import FeatherIcon from "feather-icons-react";
import { UserTableStyleWrapper } from "pages/style";
import { Button } from "../../../components/buttons/buttons";
import Heading from "../../../components/heading/heading";

import { UsersApi } from "api";
import { sortDirections } from "constants/constants";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import openNotificationWithIcon from "utility/notification";
import OrdinalNumber from "components/common/OrdinalNumber";

const usersApi = new UsersApi();

const getUserStatus = (user) => {
  const color = user.isPending
    ? ""
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
  return <span className={`status-text ${color}`}>{text}</span>;
};

const CertifiedTechniciansTable = ({
  data,
  refetch,
  isLoading,
  onPaginationChange,
  onShowSizeChange,
  onSorterChange,
}) => {
  const usersTableData = [];

  const { t } = useTranslation();

  const usersTableColumns = [
    {
      title: t("global.ordinal-number", "No."),
      dataIndex: "ordinalNumber",
      key: "ordinalNumber",
      sorter: false,
    },
    {
      title: t("certified-technicians:table.title.fullname", "Full Name"),
      dataIndex: "user",
      key: "user",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("certified-technicians:table.title.email", "Email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.municipality",
        "Municipality"
      ),
      dataIndex: "municipality",
      key: "municipality",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.training-center",
        "Training Center"
      ),
      dataIndex: "trainingCenter",
      key: "trainingCenter",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title-certificate-number",
        "Certificate Number"
      ),
      dataIndex: "certificateNumber",
      key: "certificateNumber",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t(
        "certified-technicians:table.title.current-qualification",
        "Current Qualification"
      ),
      dataIndex: "currentQualification",
      key: "currentQualification",
      sorter: true,
      sortDirections: sortDirections,
    },
    {
      title: t("users:table.title.status", "Status"),
      dataIndex: "status",
      key: "status",
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
    } catch (error) {}
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
    } catch (error) {}
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
      municipality,
      certificateNumber,
      currentQualification,
      trainingCenter,
      isDeleted,
      isActive,
      isPending,
      isCreatedByMyGroup,
    } = user;

    const fullName = `${firstName} ${lastName}`;

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
      email,
      municipality,
      currentQualification,
      trainingCenter,
      certificateNumber,
      status: getUserStatus(user),
      action: (
        <div className="table-actions" style={{ clear: "both" }}>
        <Tooltip title={t("global.view", "View")}>
          <Link to={`/registers/certified-technicians/${id}`}>
            <Button className="btn-icon" type="info" shape="circle">
              <FeatherIcon icon="eye" size={25} />
            </Button>
          </Link>
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
                <Button
                  className="btn-icon"
                  type="primary"
                  to="#"
                  shape="circle"
                >
                  <FeatherIcon icon={"mail"} size={25} />
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              {!isDeleted &&  <Tooltip title={t("global:edit", "Edit")}>
              <Link to={`/registers/certified-technicians/${id}/edit`}>
                <Button className="btn-icon" type="info" shape="circle"  title={t("global:edit", "Edit")}>
                  <FeatherIcon icon="edit" size={25} />
                </Button>
              </Link></Tooltip>}
              {isCreatedByMyGroup && !isDeleted ? <Popconfirm
                      title={
                        !isActive
                          ? `${t(
                              "users:alert-toggle-enable",
                              "Are you sure you want to enable ",
                            )+ " " + fullName}`
                          : `${t(
                              "users:alert-toggle-disable",
                              "Are you sure you want to disable ",
                            )+ " " + fullName}`
                      }
                      onConfirm={() => onToggleActivate(id, !isActive)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        className="btn-icon"
                        type={isActive ? "danger" : "primary"}
                        to="#"
                        shape="circle"
                      >
                        <FeatherIcon
                          icon={isActive ? `toggle-right` : "toggle-left"}
                          size={25}
                        />
                      </Button>
                    </Popconfirm> : null}
            </>
          )}
          {isCreatedByMyGroup && !isDeleted &&
            <Popconfirm
              title={t(
                "users:alert.delete-confirm",
                "This step is irreversible, are you sure you want to delete {{dynamicValue}}?",
                { dynamicValue: fullName }
              )}
              onConfirm={() => onDeleteConfirm(id, isDeleted)}
              okText="Yes"
              cancelText="No"
            >
               <Tooltip title={t("global.delete", "Delete")}>
              <Button className="btn-icon" type="danger" to="#" shape="circle" title={t("global.delete", "Delete")}>
                <FeatherIcon icon="trash-2" size={25} />
              </Button>
              </Tooltip>
            </Popconfirm>
          }
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
                dataSource={usersTableData}
                columns={usersTableColumns}
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

export default CertifiedTechniciansTable;
