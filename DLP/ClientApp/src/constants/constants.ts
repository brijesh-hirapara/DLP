import { SortOrder } from "antd/lib/table/interface";

export const SortTypeLong = {
  ASCEND: "ascend",
  DESCEND: "descend",
};

export const SortTypeShort = {
  ASC: "ASC",
  DESC: "DESC",
};

export const SortTypeMaper = {
  [SortTypeLong.ASCEND]: SortTypeShort.ASC,
  [SortTypeLong.DESCEND]: SortTypeShort.DESC,
};
export const sortDirections = [
  SortTypeLong.DESCEND as SortOrder,
  SortTypeLong.ASCEND as SortOrder,
  SortTypeLong.DESCEND as SortOrder,
];

export const EMAIL_REGEX_PATTERN =
  "/^[a-zA-Z0-9.! #$%&'*+/=? ^_`{|}~-]+@[a-zA-Z0-9-]+(?:. [a-zA-Z0-9-]+)*$/";

export const PredefinedRoles = {
  SUPER_ADMINISTRATOR: 'Super Administrator',
  COMP_KGH_OWNER_OPERATOR: "Company owner and operator of KGH equipment",
  COMP_KGH_SERVICE: "KGH service company/entrepreneur",
  COMP_KGH_IMPORT_EXPORT: "Company importer/exporter of KGH equipment",
}
