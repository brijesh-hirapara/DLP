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
import { RequestsApi } from "api/api";

const { Option } = Select;

const requestsApi = new RequestsApi();

interface CreateInstitutionModalProps {
  id: string | undefined;
  isVisible: boolean;
  institutionToEdit?: OrganizationDto | null;
  onHide: () => void;
  onSubmitSuccess: () => void;
}

const organizationApi = new OrganizationsApi();

export const InviteCarriersModal = ({
  id,
  isVisible,
  onHide,
  // onSubmitSuccess,
  transportRequestId,
}: {
  id?: string;
  isVisible: boolean;
  onHide: () => void;
  // onSubmitSuccess: () => void;
  transportRequestId: any;
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const commonData = useContext(CommonDataContext);
  const { municipalities, userGroups } = commonData as any;
    const [organizations, setOrganizations] = useState<any[]>([]);

  const defaultValues = {
    name: "",
    idNumber: "",
  };


  useEffect(() => {
    if (isVisible) {
      const fetchOrganizations = async () => {
        try {
          const query = { type: 2 };
          const sorting = {}; // add sorting params if needed
          const response = await organizationApi.apiOrganizationsGet({ ...query, ...sorting });
          setOrganizations(response.data.items ?? []);
        } catch (err) {
          // handle error as desired
          console.error("Failed to fetch organizations", err);
        }
      };
      fetchOrganizations();
    }
  }, [isVisible]);

  
const handleSubmit = async (values: any) => {
  console.log("TransportRequestId debug", transportRequestId);
  try {
    setLoading(true);
    console.log("Submitting payload", {
  transportRequestId,
  organizationIds: values.inviteCarriers,
});
    await requestsApi.apiTransportManagementInviteCarriersPost({
      trasportRequestId: transportRequestId, 
      organizationIds: values.inviteCarriers,
    } as any);
    openNotificationWithIcon(
      "success",
      t("institutions.success.add", "Invitation sent successfully!")
    );
    form.resetFields();
    // onSubmitSuccess();
  } catch (err) {
    showServerErrors(err);
  } finally { 
    setLoading(false);
  }
};


  // const onMunicipalityChange = (value: any) => {
  //   const municipality = municipalities.find((item: any) => item.id === value);
  //   if (municipality) {
  //     form.setFieldsValue({
  //       cantonId: municipality.cantonId,
  //       stateEntityId: municipality.stateEntityId,
  //     });
  //   }
  // };

  return (
    <Modal
      type={"primary"}
      title={t("invite-carrier-modal.add-modal-title", "Add New Carrier")}
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
              name="addInstitution"
              onFinish={handleSubmit}
              initialValues={defaultValues}
            >
              {/* Form Items */}
              {/* <Form.Item
                required
                name="name"
                label={t("global.institution-name", "Company name")}
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("global.institution-name", "Company name"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
              >
                <Input
                  required
                  placeholder={t("global.institution-name", "Company name")}
                  prefix={<FeatherIcon icon="user" size={14} />}
                />
              </Form.Item> */}

              <Form.Item
                name="inviteCarriers"
                required
                label="Invite carriers"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one carrier",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  className="basic-multi-select"
                >
                  {organizations &&
                    organizations.map((item: any) => (
                      <Option value={item?.id} key={item?.id}>
                        {item?.name}
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
                  {t("global:send-invitation", "Send Invitation")}
                </Button>
              </Row>
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
};
