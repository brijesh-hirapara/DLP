import { Divider, Form, Input, Row, Select } from "antd";
import { Button } from "components/buttons/buttons";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { EMAIL_REGEX_PATTERN } from "constants/constants";
import { showServerErrors } from "utility/showServerErrors";
import { OrganizationsApi } from "api/api";
import { OrganizationDto, OrganizationRequest } from "api/models";
import { log } from "console";

const { Option } = Select;

interface CreateInstitutionModalProps {
  id: string | undefined;
  isVisible: boolean;
  institutionToEdit?: OrganizationDto | null;
  onHide: () => void;
  onSubmitSuccess: () => void;
}

const organizationApi = new OrganizationsApi();

const defaultValues = {
  name: "",
  idNumber: "",
  taxNumber: "",
  responsiblePersonFullName: "",
  responsiblePersonFunction: "",
  address: "",
  place: "",
  email: "",
  municipalityId: "",
  stateEntityId: "",
  phoneNumber: "",
  websiteUrl: "",
  contactPersonFirstName: "",
  contactPersonLastName: "",
  contactPersonEmail: "",
};

export const CreateInstitutionModal = ({
  id,
  isVisible,
  onHide,
  onSubmitSuccess,
  institutionToEdit,
}: CreateInstitutionModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!institutionToEdit;
  const commonData = useContext(CommonDataContext);
  const { municipalities, userGroups, stateEntities, cantons } = commonData as any;


  useEffect(() => {
    
    if (institutionToEdit) {
      setFieldsForEdit(institutionToEdit);
    }
  }, [institutionToEdit]);

  const setFieldsForEdit = async (institution: OrganizationRequest) => {
    try {
      onMunicipalityChange(institution?.municipalityId);
      const {
        address,
        contactPersonFirstName,
        contactPersonLastName,
        contactPersonEmail,
        name,
        email,
        phoneNumber,
        municipalityId,
        place,
        responsiblePersonFullName,
        responsiblePersonFunction,
        idNumber,
        taxNumber,
        websiteUrl,
        userGroups
      } = institution;

      form.setFieldsValue({
        id,
        municipalityId,
        name,
        idNumber,
        taxNumber,
        email,
        responsiblePersonFullName,
        responsiblePersonFunction,
        address,
        place,
        phoneNumber,
        websiteUrl,
        contactPersonFirstName,
        contactPersonLastName,
        contactPersonEmail,
        userGroups
      });
    } catch (err) { }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (isEditMode) {
        await organizationApi.apiOrganizationsIdPut({
          id: values.id,
          organizationRequest: values,
        });
      } else {
        await organizationApi.apiOrganizationsPost({
          organizationRequest: values,
        });
      }

      openNotificationWithIcon(
        "success",
        t(
          `institutions.success.${isEditMode ? "edit" : "add"}`,
          `Company ${isEditMode ? "updated" : "created"} successfully!`
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
    `institution.${isEditMode ? "edit" : "add"}-modal-title`,
    `${isEditMode ? "Edit" : "Add New"} Company`
  );

  const inputLabels = {
    name: t("global.institution-name", "Company name"),
    idNumber: t("global.id-number", "Id number"),
    taxNumber: t("global.tax-number", "Tax number"),
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
    emailAddress: t("global.institution-email", "Company email address"),
    phoneNumber: t("global.institution-phone", "Company phone"),
    websiteUrl: t("global.website-url", "Website URL"),
    contactPersonFirstName: t(
      "global.contact-person-first-name",
      "Contact person first name"
    ),
    contactPersonLastName: t(
      "global.contact-person-last-name",
      "Contact person last name"
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
      onCancel={onHide}
      footer={null}
    >
      <div className="project-modal">
        <AddProfile>
          <BasicFormWrapper>
            <Form
              requiredMark
              form={form}
              name={isEditMode ? "editInstitution" : "addInstitution"}
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
                      field: t("global.institution-name", "Company name"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name={"name"}
                label={inputLabels.name}
              >
                <Input
                  required
                  placeholder={inputLabels.name}
                  prefix={<FeatherIcon icon="user" size={14} />}
                />
              </Form.Item>

              <Form.Item
                name="idNumber"
                label={inputLabels.idNumber}
                required
                rules={[
                  {
                    required: true,
                    message: t('create-institution:id-number-required-validation', 'ID Number is required'),
                  },
                  {
                    len: 13,
                    message: t('create-institution:id-number-length-validation', 'ID Number should be at Exact 13 characters'),
                  },
                ]}>
                <Input
                  prefix={<FeatherIcon icon="hash" size={14} />}
                  placeholder={inputLabels.idNumber}
                  disabled={isEditMode}
                  maxLength={13}
                />
              </Form.Item>

              <Form.Item name="taxNumber" label={inputLabels.taxNumber}
                rules={[
                  {
                    len: 12,
                    message: t('create-institution:tax-number-validation', 'Tax Number should be at Exact 12 characters'),
                  },
                ]}>
                <Input
                  prefix={<FeatherIcon icon="hash" size={14} />}
                  placeholder={inputLabels.taxNumber}
                  maxLength={12} // Limit input length to 12 characters
                />
              </Form.Item>

              {/* <Form.Item
                required
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.responsiblePerson,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                label={inputLabels.responsiblePerson}
                name={"responsiblePersonFullName"}
              >
                <Input
                  prefix={<FeatherIcon icon="user" size={14} />}
                  placeholder={inputLabels.responsiblePerson}
                />
              </Form.Item> */}

              {/* <Form.Item
                required
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.responsiblePersonFunction,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name={"responsiblePersonFunction"}
                label={inputLabels.responsiblePersonFunction}
              >
                <Input
                  required
                  placeholder={inputLabels.responsiblePersonFunction}
                />
              </Form.Item> */}

              <Form.Item name="address" label={inputLabels.address}>
                <Input
                  prefix={<FeatherIcon icon="navigation" size={14} />}
                  placeholder={inputLabels.address}
                />
              </Form.Item>

              <Form.Item name="place" label={inputLabels.place}>
                <Input
                  placeholder={inputLabels.place}
                  prefix={<FeatherIcon icon="map-pin" size={14} />}
                />
              </Form.Item>

              {/* <Form.Item
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
              </Form.Item> */}

              {/* <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.emailAddress,
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
                label={inputLabels.emailAddress}
              >
                <Input
                  type="email"
                  placeholder={inputLabels.emailAddress}
                  pattern={EMAIL_REGEX_PATTERN}
                  prefix={<FeatherIcon icon="mail" size={14} />}
                />
              </Form.Item> */}

              <Form.Item name="phoneNumber" label={inputLabels.phoneNumber}>
                <Input
                  prefix={<FeatherIcon icon="phone" size={14} />}
                  placeholder={inputLabels.phoneNumber}
                />
              </Form.Item>

              {/* <Form.Item name="websiteUrl" label={inputLabels.websiteUrl}>
                <Input
                  prefix={<FeatherIcon icon="globe" size={14} />}
                  placeholder={inputLabels.websiteUrl}
                />
              </Form.Item> */}

              <Divider />

              <Form.Item
                name="contactPersonFirstName"
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.contactPersonFirstName,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                label={inputLabels.contactPersonFirstName}
              >
                <Input
                  prefix={<FeatherIcon icon="user-plus" size={14} />}
                  disabled={isEditMode}
                  placeholder={inputLabels.contactPersonFirstName}
                />
              </Form.Item>

              <Form.Item
                name="contactPersonLastName"
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.contactPersonLastName,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                label={inputLabels.contactPersonLastName}
              >
                <Input
                  prefix={<FeatherIcon icon="user-plus" size={14} />}
                  disabled={isEditMode}
                  placeholder={inputLabels.contactPersonLastName}
                />
              </Form.Item>

              <Form.Item
                name="contactPersonEmail"
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: inputLabels.contactPersonEmail,
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
                label={inputLabels.contactPersonEmail}
              >
                <Input
                  prefix={<FeatherIcon icon="mail" size={14} />}
                  pattern={EMAIL_REGEX_PATTERN}
                  disabled={isEditMode}
                  placeholder={inputLabels.contactPersonEmail}
                />
              </Form.Item>

              <Form.Item
                name="userGroups"
                required
                label="Select User Groups"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one group",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  disabled={isEditMode}
                  placeholder="Please select"
                  className="basic-multi-select"
                >
                  {userGroups &&
                    userGroups.map((item: any) => (
                      <Option value={item?.name} key={item?.name}>
                        {item?.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

            {!isEditMode &&
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
            }
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
};
