import { RequestStatus } from "api/models";
import { Badge } from "antd";

const statusBadgeMapping: Record<RequestStatus, { color: string }> = {
    [RequestStatus.APPROVED]: {
        color: "success"
    },
    [RequestStatus.PENDING]: {
        color: "warning"
    },
    [RequestStatus.REJECTED]: {
        color: "error"
    }
};

const renderStatusBadge = (status: RequestStatus, statusDesc: string) => {
    const badgeInfo = statusBadgeMapping[status];

    if (!badgeInfo) return null;  // If status is not found in the mapping, don't render anything

    return (
        <Badge
            className={`ant-badge badge badge-${badgeInfo.color}`}
            count={statusDesc}
        />
    );
}

export default renderStatusBadge;