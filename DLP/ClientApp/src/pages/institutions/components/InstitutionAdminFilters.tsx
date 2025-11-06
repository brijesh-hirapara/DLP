import { Select } from "antd";
import { OrganizationsApiApiOrganizationsGetRequest } from "api/api";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import isSuperAdmin from "utility/isSuperAdmin";
const { Option } = Select;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

interface InstituionAdminFiltersProps {
  onChangeQuery: (query: {
    entityId?: string;
    municipalityId?: string;
  }) => void;
}

const InstitutionAdminFilters = ({
  onChangeQuery,
}: InstituionAdminFiltersProps) => {
  const { t } = useTranslation();
  const commonData = useContext(CommonDataContext);
  const { municipalities, stateEntities } = commonData as any;

  if (!isSuperAdmin()) return null;

  return (
    <Container>
      <Select
        showSearch
        placeholder={t("global:municipality", "Municipality")}
        style={{
          color: "rgb(90, 95, 125)",
          width: 150,
          marginLeft: 10,
        }}
        allowClear
        size="small"
        onChange={(value) => onChangeQuery({ municipalityId: value || "" })}
      >
        {municipalities &&
          municipalities.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
      </Select>
      <Select
        size="small"
        allowClear
        placeholder={t("global:entity", "Entity")}
        style={{ color: "rgb(90, 95, 125)", width: 150, marginLeft: 10 }}
        onChange={(value) => onChangeQuery({ entityId: value || "" })}
      >
        {stateEntities &&
          stateEntities.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
      </Select>
    </Container>
  );
};

export default InstitutionAdminFilters;
