import { Form, Input, Row } from "antd";
import { RefrigerantTypesApi } from "api/api"; // Update the import
import { CreateRefrigerantTypeCommand } from "api/models";
import { Button } from "components/buttons/buttons";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";

interface CreateRefrigerantModalProps {
  isVisible: boolean;
  refrigerantToEdit?: any; // Replace 'any' with the actual type
  onHide: () => void;
  onSuccess: () => void;
}

const refrigerantTypesApi = new RefrigerantTypesApi();

const defaultValues: CreateRefrigerantTypeCommand = {
  name: "",
  ashraeDesignation: "",
  typeOfCoolingFluid: "",
  globalWarmingPotential: "",
};

export const CreateRefrigerantModal = ({
  isVisible,
  onHide,
  onSuccess,
  refrigerantToEdit,
}: CreateRefrigerantModalProps) => {
  const { t } = useTranslation();

  const labels = {
    name: t("global.name", "Name"),
    ashraeDesignation: t("refrigerant:ashraeDesignation", "ASHRAE Designation"),
    typeOfCoolingFluid: t(
      "refrigerant:typeOfCoolingFluid",
      "Type of Cooling Fluid"
    ),
    globalWarmingPotential: t(
      "refrigerant:globalWarmingPotential",
      "Global Warming Potential"
    ),
    addModalTitle: t("refrigerant:add-modal-title", "Add new Refrigerant"),
    editModalTitle: t("refrigerant:edit-modal-title", "Edit Refrigerant"),
    editedSuccessfully: t(
      "refrigerant:success-edit",
      "Refrigerant edited successfully"
    ),
    addedSuccessfully: t(
      "refrigerant:success-add",
      "Refrigerant added successfully"
    ),
  };

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(refrigerantToEdit);

  useEffect(() => {
    if (!refrigerantToEdit) {
      return;
    }
    console.log({ refrigerantToEdit });
    form.setFieldsValue(refrigerantToEdit);
  }, [refrigerantToEdit, form]);

  const handleSubmit = async (values: CreateRefrigerantTypeCommand) => {
    try {
      setLoading(true);

      if (isEditMode) {
        await refrigerantTypesApi.apiRefrigerantTypesIdPut({
          id: refrigerantToEdit.id,
          updateRefrigerantTypeCommand: { ...values },
        });
      } else {
        await refrigerantTypesApi.apiRefrigerantTypesPost({
          createRefrigerantTypeCommand: { ...values },
        });
      }

      openNotificationWithIcon(
        "success",
        isEditMode ? labels.editedSuccessfully : labels.addedSuccessfully
      );

      form.resetFields();
      onSuccess();
    } catch (err) {
      // Handle errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      type={"primary"}
      title={isEditMode ? labels.editModalTitle : labels.addModalTitle}
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
              name={isEditMode ? "editRefrigerant" : "addRefrigerant"}
              onFinish={handleSubmit}
              initialValues={defaultValues}
            >
              {isEditMode && (
                <Form.Item name="id" hidden>
                  <Input placeholder="Id" />
                </Form.Item>
              )}
              <Form.Item
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: labels.name,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name="name"
                label={labels.name}
              >
                <Input
                  required
                  placeholder={labels.name + "*"}
                  prefix={<FeatherIcon icon="user" size={14} />}
                />
              </Form.Item>
              <Form.Item
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: labels.ashraeDesignation,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name="ashraeDesignation"
                label={labels.ashraeDesignation}
              >
                <Input placeholder={labels.ashraeDesignation} />
              </Form.Item>

              <Form.Item
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: labels.typeOfCoolingFluid,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name="typeOfCoolingFluid"
                label={labels.typeOfCoolingFluid}
              >
                <Input placeholder={labels.typeOfCoolingFluid} />
              </Form.Item>

              <Form.Item
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: labels.globalWarmingPotential,
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                  {
                    pattern: /^-?\d*\.?\d+$/,
                    message: t(
                      "validations.number-required",
                      "Please enter a valid number."
                    ),
                  },
                ]}
                name="globalWarmingPotential"
                label={labels.globalWarmingPotential}
              >
                <Input placeholder={labels.globalWarmingPotential} />
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
