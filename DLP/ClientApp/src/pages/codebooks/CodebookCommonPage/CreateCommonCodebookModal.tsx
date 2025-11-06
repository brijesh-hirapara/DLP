import { Form, Input, Row } from "antd";
import { CodebookApi } from "api/api";
import { Button } from "components/buttons/buttons";
import { Modal } from "components/modals/antd-modals";
import { AddProfile, BasicFormWrapper } from "container/styled";
import { getCodebookTextsByType } from "pages/codebooks/CodebookCommonPage/data";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import openNotificationWithIcon from "utility/notification";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { CodebookDto, CodebookTypeEnum } from "api/models";
import { formatLabel } from "utility/utility";

interface CreateCommonCodebookModalProps {
  codebookType: CodebookTypeEnum;
  isVisible: boolean;
  codebookToEdit?: CodebookDto | null;
  onHide: () => void;
  onSuccess: () => void;
}

const codebookApi = new CodebookApi();

const defaultValues = {
  name: "",
};

export const CreateCommonCodebookModal = ({
  codebookType,
  isVisible,
  onHide,
  onSuccess,
  codebookToEdit,
}: CreateCommonCodebookModalProps) => {
  const { t } = useTranslation();
  const {
    addModalTitle,
    editModalTitle,
    editedSuccessfully,
    addedSuccessfully,
  } = getCodebookTextsByType(t, codebookType);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(codebookToEdit);

  const handleCancel = () => {
    onHide?.();
  };

  useEffect(() => {
    if (isEditMode && codebookToEdit?.name) {
      const trimmedName = codebookToEdit.name.trim();  // Trim the name on open

      // Set the trimmed value in the form
      form.setFieldsValue({
        id: codebookToEdit.id,
        name: trimmedName,
      });
    }
  }, [isEditMode, codebookToEdit, form]);

  const handleSubmit = async (values: any) => {
    try {
      const { id, name } = values;
      const trimmedName = name?.trim();
      if (!trimmedName) {
        form.setFields([
          {
            name: "name",
            errors: [
              t("user-groups:validations.whitespace-not-allowed", {
                field: t("global.name", "Name"),
                defaultValue: "{{field}} cannot be empty or whitespace only.",
              }),
            ],
          },
        ]);
        return; 
      }
      setLoading(true);

      if (isEditMode) {
        await codebookApi.apiCodebookIdPut({
          id,
          updateCodebookCommand: { id, name },
        });
      } else {
        await codebookApi.apiCodebookPost({
          addCodebookCommand: { name, type: codebookType },
        });
      }

      openNotificationWithIcon(
        "success",
        isEditMode ? editedSuccessfully : addedSuccessfully
      );

      form.resetFields();
      onSuccess();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      type={"primary"}
      title={formatLabel(isEditMode ? editModalTitle : addModalTitle)}
      visible={isVisible}
      onCancel={handleCancel}
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
                      field: t("global.name", "Name"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
                name={"name"}
                label={t("global.name", "Name")}
              >
                <Input
                  required
                  placeholder={t("global.name", "Name") + "*"}
                  prefix={<FeatherIcon icon="user" size={14} />}
                />
              </Form.Item>

              <Row justify="start">
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
                <Button className="mx-3" size="default" type="white" key="back" outlined onClick={handleCancel}>
                  Cancel
                </Button>
              </Row>
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
};
