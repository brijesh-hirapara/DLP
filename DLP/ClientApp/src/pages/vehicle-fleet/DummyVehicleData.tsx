import { Tooltip } from "antd";
import { Button } from "components/buttons/buttons";
import OrdinalNumber from "components/common/OrdinalNumber";
//@ts-ignore
import FeatherIcon from "feather-icons-react";

export const staticTableData = [
  {
    key: 1,
    ordinalNumber: <OrdinalNumber value={1} />,
    carrierName: "Delivery LTD",
    createdAt: "17.09.2025",
    submitted: "08/09/2025",
    aprovalDate: "17/09/2025",
    noOfVehicle:"07",
    status: (
      <span className="ant-tag" style={{ background: "#20C997", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
       ACTIVE
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="View">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="eye" size={7} /></Button>
        </Tooltip>
      </div>
    ),
  },
  {
    key: 2,
    ordinalNumber: <OrdinalNumber value={2} />,
    carrierName: "Deliote tran",
    createdAt: "17.09.2025",
    submitted: "04/09/2025",
    aprovalDate: "05/09/2025",
    noOfVehicle:"16",
    status: (
      <span className="ant-tag" style={{ background: "#FB8B0D", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        PENDING
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="View">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="eye" size={7} /></Button>
        </Tooltip>
      </div>
    ),
  },
  {
    key: 3,
    ordinalNumber: <OrdinalNumber value={3} />,
    carrierName: "Transport LTD",
    createdAt: "17.09.2025",
    submitted: "31/08/2025",
    aprovalDate: "01/09/2025",
    noOfVehicle:"11",
    status: (
      <span className="ant-tag" style={{ background: "#FF4D50", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        REJECTED
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="edit" size={7} /></Button>
        </Tooltip>
      </div>
    ),
  },
  {
    key: 4,
    ordinalNumber: <OrdinalNumber value={4} />,
    carrierName: "Shipo Trans",
    createdAt: "17.09.2025",
    submitted: "27/08/2025",
    aprovalDate: "29/08/2025",
    noOfVehicle:"02",
    status: (
      <span className="ant-tag" style={{ background: "#FF4D50", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        REJECTED
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="edit" size={7} /></Button>
        </Tooltip>
      </div>
    ),
  },
  {
    key: 5,
    ordinalNumber: <OrdinalNumber value={5} />,
    carrierName: "Drive TRUE",
    createdAt: "17.09.2025",
    submitted: "17/08/2025",
    aprovalDate: "19/08/2025",
    noOfVehicle:"09",
    status: (
      <span className="ant-tag" style={{ background: "#20C997", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        ACTIVE
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        
        <Tooltip title="View">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="eye" size={7} /></Button>
        </Tooltip>

      </div>
    ),
  },
  {
    key: 6,
    ordinalNumber: <OrdinalNumber value={6} />,
    carrierName: "Grow LTR",
    createdAt: "17.09.2025",
    submitted: "02/08/2025",
    aprovalDate: "05/08/2025",
    noOfVehicle:"03",
    status: (
      <span className="ant-tag" style={{ background: "#FB8B0D", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        PENDING
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="View">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="eye" size={7} /></Button>
        </Tooltip>

      </div>
    ),
  },
  {
    key: 7,
    ordinalNumber: <OrdinalNumber value={7} />,
    carrierName: "Trucking Big",
    createdAt: "17.09.2025",
    submitted: "24/07/2025",
    aprovalDate: "27/07/2025",
    noOfVehicle:"14",
    status: (
      <span className="ant-tag" style={{ background: "#FB8B0D", color: "#fff", borderRadius: 4, padding: "2px 12px", fontWeight: 500 }}>
        PENDING
      </span>
    ),
    action: (
      <div className="table-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="View">
          <Button className="btn-icon" type="info" shape="circle"><FeatherIcon icon="eye" size={7} /></Button>
        </Tooltip>

      </div>
    ),
  },
];
