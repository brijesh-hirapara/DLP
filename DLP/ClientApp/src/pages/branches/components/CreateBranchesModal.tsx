import { Form, Input, Row, Select } from "antd";
import { Button } from "components/buttons/buttons";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { showServerErrors } from "utility/showServerErrors";
import { CompanyBranchesApi } from "../../../api/api";
import { CompanyBranchDto } from "api/models";
import { EMAIL_REGEX_PATTERN } from "constants/constants";
const { Option } = Select;

interface CreateBranchesModalProps {
  isVisible: boolean;
  branchToEdit?: CompanyBranchDto | null;
  onHide: () => void;
  onSubmitSuccess: () => void;
}

const companyBranchesApi = new CompanyBranchesApi();

const defaultValues = {
  branchOfficeName: "",
  idNumber: "",
  address: "",
  email: "",
  contactPerson: "",
  contactPhone: "",
  place: "",
  municipalityId: "",
};

export const CreateBranchesModal = ({
  isVisible,
  onHide,
  onSubmitSuccess,
  branchToEdit,
}: CreateBranchesModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!branchToEdit;

  const commonData = useContext(CommonDataContext);
  const { municipalities, stateEntities, cantons } = commonData as any;

  useEffect(() => {
    if (branchToEdit) {
      setFieldsForEdit(branchToEdit);
    }
  }, [branchToEdit]);

  const setFieldsForEdit = async (companyBranch: CompanyBranchDto) => {
    try {
      onMunicipalityChange(companyBranch?.municipalityId);
      const {
        id,
        address,
        contactPerson,
        email,
        branchOfficeName,
        contactPhone,
        municipalityId,
        idNumber,
        place,
      } = companyBranch;

      form.setFieldsValue({
        id,
        email,
        address,
        place,
        contactPerson,
        municipalityId,
        branchOfficeName,
        contactPhone,
        idNumber,
      });
    } catch (err) { }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (isEditMode) {
        values.branchId = values.id;
        await companyBranchesApi.apiCompanyBranchesIdPut({
          id: values.id,
          updateCompanyBranchCommand: values,
        });
      } else {
        await companyBranchesApi.apiCompanyBranchesPost({
          createCompanyBranchRequest: values,
        });
      }

      openNotificationWithIcon(
        "success",
        t(
          `branches.success.${isEditMode ? "edit" : "add"}`,
          `Branches ${isEditMode ? "updated" : "created"} successfully!`
        )
      );

      form.resetFields();
      onSubmitSuccess();
    } catch (err) {
      showServerErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const onMunicipalityChange = (value: any) => {
    const municipality = municipalities.find((item: any) => item.id === value);
    if (municipality) {
      form.setFieldsValue({
        cantonId: municipality.cantonId,
        stateEntityId: municipality.stateEntityId,
      });
    }
  };

  const modalTitle = t(
    `branches.${isEditMode ? "edit" : "add"}-modal-header-title`,
    `${isEditMode ? "Edit" : "Add New"} Company Branch`
  );


  const inputLabels = {
    name: t("global.branch-name", "Branch Office Name"),
    officeId: t("global.office-id", "Office Id"),
    responsiblePerson: t(
      "institution.responsible-person",
      "Responsible person"
    ),
    responsiblePersonFunction: t(
      "institution.responsible-person-function",
      "Function of the responsible person"
    ),
    address: t("global.address", "Address"),
    place: t("global.place", "Place"),
    email: t("global.branch-office-email", "Email"),
    phoneNumber: t("global.institution-phone", "Institution phone"),
    websiteUrl: t("global.website-url", "Website URL"),
    contactPerson: t(
      "global.contact-person",
      "Contact person"
    ),
    contactPhone: t(
      "global.contact-phone",
      "Contact Phone"
    ),
    contactPersonEmail: t(
      "global.contact-person-email",
      "Contact person email"
    ),
  };

  return (
    <Modal
      type={"primary"}
      title={modalTitle}
      visible={isVisible}
      onCancel={() => {
        form.resetFields();
        onHide();
      }}
      footer={null}
    >
      <div className="project-modal">
        <AddProfile>
          <BasicFormWrapper>
            <Form
              requiredMark
              form={form}
              name={isEditMode ? "editCompanyBranch" : "addCompanyBranch"}
              onFinish={handleSubmit}
              initialValues={defaultValues}
            >
              <Form.Item name="id" hidden>
                <Input placeholder="Id" />
              </Form.Item>
              <Form.Item
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("global.branch-name", "Branch Office Name"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name={"branchOfficeName"}
                label={inputLabels.name}
              >
                <Input
                  required
                  placeholder={inputLabels.name}
                  prefix={<FeatherIcon icon="user" size={14} />}
                />
              </Form.Item>

              <Form.Item name="idNumber" label={inputLabels.officeId}>
                <Input
                  prefix={<FeatherIcon icon="hash" size={14} />}
                  placeholder={inputLabels.officeId}
                />
              </Form.Item>

              <Form.Item
                name="address"
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("global.address", "Address"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                label={inputLabels.address}
              >
                <Input
                  required
                  prefix={<FeatherIcon icon="navigation" size={14} />}
                  placeholder={inputLabels.address}
                />
              </Form.Item>

              <Form.Item
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("global.branch-email", "Branch email address"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                  {
                    type: "email",
                    message: t("validations.invalid-email", {
                      defaultValue: "Invalid email format!"
                    }),
                  },
                ]}
                name={"email"}
                label={inputLabels.email}
              >
                <Input
                  required
                  type="email"
                  pattern={EMAIL_REGEX_PATTERN}
                  prefix={<FeatherIcon icon="mail" size={14} />}
                  placeholder={inputLabels.email}
                />
              </Form.Item>

              <Form.Item name="contactPerson" label={inputLabels.contactPerson}>
                <Input
                  prefix={<FeatherIcon icon="user-plus" size={14} />}
                  placeholder={inputLabels.contactPerson}
                />
              </Form.Item>

              <Form.Item name="contactPhone" label={inputLabels.contactPhone}>
                <Input
                  placeholder={inputLabels.contactPhone}
                  prefix={<FeatherIcon icon="phone" size={14} />}
                />
              </Form.Item>

              <Form.Item name="place" label={inputLabels.place}>
                <Input
                  placeholder={inputLabels.place}
                  prefix={<FeatherIcon icon="map-pin" size={14} />}
                />
              </Form.Item>

              <Form.Item
                name="municipalityId"
                label={t("global.select-municipality", "Select Municipality")}
                required
                rules={[
                  {
                    required: true,
                    message: t(
                      "validations.select-municipality",
                      "Please select Municipality"
                    ),
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={(input: string, option: any) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  className="sDash_fullwidth-select"
                  style={{ color: "rgb(90, 95, 125)" }}
                  aria-required
                  onChange={onMunicipalityChange}
                >
                  {municipalities &&
                    municipalities.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="cantonId"
                required
                label={t("global.select-canton", "Select Canton")}
              >
                <Select
                  className="sDash_fullwidth-select"
                  aria-required
                  style={{ color: "rgb(90, 95, 125)" }}
                  disabled
                >
                  {cantons &&
                    cantons.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="stateEntityId"
                required
                label={t("global.select-entity", "Select Entity")}
                requiredMark
              >
                <Select
                  className="sDash_fullwidth-select"
                  aria-required
                  style={{ color: "rgb(90, 95, 125)" }}
                  disabled
                >
                  {stateEntities &&
                    stateEntities.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Row justify="end">
                <Button
                  htmlType="submit"
                  size="default"
                  loading={loading}
                  type="primary"
                  key="submit"
                >
                  {isEditMode
                    ? t("global:edit", "Edit")
                    : t("global:add", "Add")}
                </Button>
              </Row>
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
};
