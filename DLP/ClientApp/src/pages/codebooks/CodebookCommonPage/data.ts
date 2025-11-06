import { CodebookTypeEnum } from "api/models";
import { TFunction } from "i18next";
import { formatLabel } from "utility/utility";

export const codebookClaimNames: Record<CodebookTypeEnum, string> = {
  [CodebookTypeEnum.TypeOfTrailers]: "type-of-trailers",
  [CodebookTypeEnum.Countries]: "countries",
  [CodebookTypeEnum.OperatingCountries]: "operating-countries",
  [CodebookTypeEnum.CemtPermits]:
    "cemt-permits",
  [CodebookTypeEnum.Certificates]: "certificates",
  [CodebookTypeEnum.Licenses]: "licenses",
  [CodebookTypeEnum.GoodsType]: "goods-type",
  [CodebookTypeEnum.VehicleRequirements]: "vehicle-requirements",
  [CodebookTypeEnum.Currency]: "currency",
};

export const getCodebookTextsByType = (
  t: TFunction<"translation", undefined>,
  type: CodebookTypeEnum
) => {
  const claimName = codebookClaimNames[type];
  const moduleName = `codebook-${claimName}`;

  const texts = {
    title: t(`${moduleName}:title`, claimName),
    add: t(`${moduleName}:add`, `Add ${claimName}`),
    deleteConfirm: t(
      `${moduleName}.delete-confirmation`,
      "Are you sure you want to delete?"
    ),
    editModalTitle: t(`${moduleName}:edit-modal-title`, `Edit ${claimName}`),
    addModalTitle: t(`${moduleName}:add-modal-title`, `Add ${claimName}`),
    editedSuccessfully: t(
      `${formatLabel(moduleName)}:success-edit`,
      `${formatLabel(claimName)} updated successfully!`
    ),
    addedSuccessfully: t(
      `${formatLabel(moduleName)}:success-add`,
      `${formatLabel(claimName)} created successfully!`
    ),
  };

  return texts;
};
