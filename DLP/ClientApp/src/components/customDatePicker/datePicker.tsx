// eslint-disable-next-line max-classes-per-file
import React, { useState } from "react";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Col, DatePicker, Row } from "antd";
import { Button } from "../buttons/buttons";

interface CustomDateRangeProps {
  setDisabledDate: (disabledDate: any) => void;
  disabledDate: any;
  setQuery: (query: any) => void;
  query: any;
  getData: () => void;
}

const CustomDateRange: React.FC<CustomDateRangeProps> = ({
  setDisabledDate,
  disabledDate,
  setQuery,
  query,
  getData,
}) => {
  const onStartChange = (value: any) => {
    if (value && query.to && value > query.to) {
      console.error("Invalid date range: To date must be later than From date");
      setDisabledDate({
        ...disabledDate,
        startDate: true,
        endDate: false,
      });
    } else {
      onChange("from", value);
    }
  };

  const onEndChange = (value: any) => {
    if (value && query.from && value < query.from) {
      setDisabledDate({
        ...disabledDate,
        startDate: false,
        endDate: true,
      });
      console.error("Invalid date range: To date must be later than From date");
    } else {
      onChange("to", value);
    }
  };

  const onChange = (field: string, value: any) => {
    setQuery({
      ...query,
      [field]: value,
    });
  };

  return (
    <Row style={{ alignItems: "center" }}>
      <DatePicker
        disabledDate={(date) => {
          // Disable dates that are later than the 'to' date
          return query.to ? date.isAfter(query.to, "day") : false;
        }}
        format="YYYY-MM-DD"
        style={{ marginRight: 15 }}
        showTime={false}
        value={query.from}
        placeholder="From"
        onChange={onStartChange}
      />
      <DatePicker
        disabledDate={(date) => {
          // Disable dates that are earlier than the 'from' date
          return query.from ? date.isBefore(query.from, "day") : false;
        }}
        format="YYYY-MM-DD"
        showTime={false}
        value={query.to}
        style={{ marginRight: 15 }}
        placeholder="To"
        onChange={onEndChange}
      />
      <Button onClick={getData} type="primary">
        Apply
      </Button>
    </Row>
  );
};

export default CustomDateRange;
