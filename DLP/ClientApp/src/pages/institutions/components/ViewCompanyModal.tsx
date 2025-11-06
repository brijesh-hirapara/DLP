import { Divider, Form, Input, Row, Select } from "antd";
import { Button } from "components/buttons/buttons";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { CommonDataContext } from "contexts/CommonDataContext/CommonDataContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { EMAIL_REGEX_PATTERN } from "constants/constants";
import { OrganizationsApi } from "api/api";
import { OrganizationDto, OrganizationRequest } from "api/models";

const { Option } = Select;

interface ViewCompanyModalProps {
  id: string | undefined;
  isVisible: boolean;
  institutionToEdit?: OrganizationDto | null;
  onHide: () => void;
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
  country: "", // Add country field to default values
};

export const ViewCompanyModal = ({
  id,
  isVisible,
  onHide,
  institutionToEdit,
}: ViewCompanyModalProps) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!institutionToEdit;

  const commonData = useContext(CommonDataContext);
  const { municipalities, userGroups, stateEntities, cantons, countries } = commonData as any; // Assuming countries are available

  useEffect(() => {
    if (institutionToEdit) {
      setFieldsForView(institutionToEdit);
    }
  }, [institutionToEdit]);

  const setFieldsForView = async (institution: OrganizationRequest) => {
    try {
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
        // userGroups,
        country 
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
        // userGroups,
        country, 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const modalTitle = t("companies.view-modal-title", "View Companies");

  const inputLabels = {
    name: t("global.company-name", "Company name"),
    idNumber: t("global.id-number", "Id number"),
    taxNumber: t("global.tax-number", "Tax number"),
    responsiblePerson: t("institution.responsible-person", "Responsible person"),
    responsiblePersonFunction: t(
      "institution.responsible-person-function",
      "Function of the responsible person"
    ),
    address: t("global.address", "Address"),
    place: t("global.city", "City"),
    emailAddress: t("global.institution-email", "Institution email address"),
    phoneNumber: t("global.institution-phone", "Institution phone"),
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
              name="viewCompanies"
              initialValues={defaultValues}
            >
              <Form.Item name="id" hidden>
                <Input placeholder="Id" />
              </Form.Item>

              <Form.Item name="name" label={inputLabels.name}>
                <Input
                  disabled
                  prefix={<FeatherIcon icon="user" size={14} />}
                  placeholder={inputLabels.name}
                />
              </Form.Item>

              <Form.Item name="taxNumber" label={inputLabels.taxNumber}>
                <Input
                  disabled
                  prefix={<FeatherIcon icon="hash" size={14} />}
                  placeholder={inputLabels.taxNumber}
                />
              </Form.Item>
              
              {/* Country Dropdown */}
              <Form.Item name="country" label="Country">
                <Select
                  disabled
                  placeholder="Select a country"
                  style={{ width: "100%" }}
                >
                  {countries &&
                    countries.map((country: any) => (
                      <Option value={country?.name} key={country?.id}>
                        {country?.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item name="address" label={inputLabels.address}>
                <Input
                  disabled
                  prefix={<FeatherIcon icon="navigation" size={14} />}
                  placeholder={inputLabels.address}
                />
              </Form.Item>

              <Form.Item name="place" label={inputLabels.place}>
                <Input
                  disabled
                  placeholder={inputLabels.place}
                  prefix={<FeatherIcon icon="map-pin" size={14} />}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                name="contactPersonFirstName"
                label={inputLabels.contactPersonFirstName}
              >
                <Input
                  disabled
                  prefix={<FeatherIcon icon="user-plus" size={14} />}
                  placeholder={inputLabels.contactPersonFirstName}
                />
              </Form.Item>

              <Form.Item
                name="contactPersonLastName"
                label={inputLabels.contactPersonLastName}
              >
                <Input
                  disabled
                  prefix={<FeatherIcon icon="user-plus" size={14} />}
                  placeholder={inputLabels.contactPersonLastName}
                />
              </Form.Item>

              <Form.Item
                name="contactPersonEmail"
                label={inputLabels.contactPersonEmail}
              >
                <Input
                  disabled
                  prefix={<FeatherIcon icon="mail" size={14} />}
                  pattern={EMAIL_REGEX_PATTERN}
                  placeholder={inputLabels.contactPersonEmail}
                />
              </Form.Item>

              {/* <Form.Item name="userGroups" label="User Groups">
                <Select
                  disabled
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Please select"
                >
                  {userGroups &&
                    userGroups.map((item: any) => (
                      <Option value={item?.name} key={item?.name}>
                        {item?.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item> */}

              {/* Removed the submit button as it's for view only */}
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
};
