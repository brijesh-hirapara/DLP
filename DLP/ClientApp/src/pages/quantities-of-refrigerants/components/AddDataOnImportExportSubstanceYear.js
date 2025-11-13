import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Row, Col } from "antd";
import { useTranslation } from 'react-i18next';
import { AddProfile } from 'container/styled';
import { BasicFormWrapper } from "container/styled";
import { RefrigerantTypesApi } from "api/api";

const refrigerantTypesApi = new RefrigerantTypesApi();

function AddDataOnImportExportSubstanceYear({ onCancel, onFinish }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [refrigerantData, setRefrigerantData] = useState([]);
  const [selectedRefrigerant, setSelectedRefrigerant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 100000,
  });
  const twoDecimalRegex = /^-?\d*\.?\d+$/;

  const handleOnCancel = () => {
    onCancel();
  };

  useEffect(() => {
    getRefrigerants();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);


  const getRefrigerants = async () => {
    setIsLoading(true);

    const { data } =
      await refrigerantTypesApi.apiRefrigerantTypesGet({
        ...request,
      });
    setRefrigerantData(data.items);
    setIsLoading(false);
  };

  const handleRefrigerantChange = (value) => {
    const selected = refrigerantData.find(refrigerant => refrigerant.id === value);
    setSelectedRefrigerant(selected);
    if (selected) {
      form.setFieldsValue({
        refrigerantTypeChemicalFormula: selected.chemicalFormula,
        refrigerantTypeASHRAEDesignation: selected.ashraeDesignation,
        refrigerantTypeName: selected.name
      });
    }
  };

 

  const handleSubmit = async (values) => {
    try {
      setIsSubmitLoading(true);
      onFinish(values); // Send data to parent component
    } catch (error) {
    } finally {
      setIsSubmitLoading(false);
      onCancel();
    }
  };




  return (
    <Modal
      title={t("global:title.add-data-import-export-substance", "Add Data Import/Export Of Substances For The Year")}
      open={true}
      footer={null}
      width={760}
      onCancel={handleOnCancel}
    >
      <div className="project-modal">
        <AddProfile>
          <BasicFormWrapper>
            <Form form={form} name="dataOnAcquired" onFinish={handleSubmit}>
            <Form.Item label="Id" name="id" hidden>
                <Input placeholder="Id" />
              </Form.Item>
              <Form.Item label="Name Of Substance" name="refrigerantTypeName" hidden>
                <Input placeholder="Name Of Substance" />
              </Form.Item>
              <Form.Item label="State Of Substance" name="stateOfSubstanceName" hidden>
                <Input placeholder="State Of Substance" />
              </Form.Item>
              <Form.Item
                label={t("global.name-of-substance", "Name of the substance")}
                name="refrigerantTypeId"
                required
                requiredMark
                rules={[
                  {
                    required: true,
                    message: t("validations.required-field", {
                      field: t("global.name-of-substance", "Name of the substance"),
                      defaultValue: "{{field}} is required!",
                    }),
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t("global.name-of-substance", "Name of the substance")}
                  filterOption={(input, option) =>
                    option.props.children
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                  loading={isLoading}
                  onChange={handleRefrigerantChange}
                >
                  {Array.isArray(refrigerantData) && refrigerantData.map((refrigerant) => (
                    <Select.Option key={refrigerant.id} value={refrigerant.id}>
                      {refrigerant.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.chemical-formula", "Chemical formula")}
                    name="refrigerantTypeChemicalFormula"
                  >
                    <Input
                      placeholder={t("global.chemical-formula", "Chemical formula")}
                      type="text"
                      disabled={true}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.symbol", "Symbol (mark)")}
                    name="refrigerantTypeASHRAEDesignation"
                  >
                    <Input
                      placeholder={t("global.symbol", "Symbol (mark)")}
                      type="text"
                      disabled={true}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.tariff-number", "Tariff Number")}
                    name="tariffNumber"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.tariff-number", "Tariff Number"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.tariff-number", "Tariff Number")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.import", "Import")}
                    name="import"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.import", "Import"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.import", "Import")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.own-consumption", "Own consumption")}
                    name="ownConsumption"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.own-consumption", "Own consumption"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.own-consumption", "Own consumption")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.market-sale", "Market Sale")}
                    name="salesOnTheBiHMarket"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.market-sale", "Market Sale"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.market-sale", "Market Sale")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.total-imported-quantity", "Total imported quantity")}
                    name="totalExportedQuantity"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.total-imported-quantity", "Total imported quantity"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.total-imported-quantity", "Total imported quantity")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.stock-balance-on-31.12", "Stock Balane on 31.12")}
                    name="stockBalanceOnTheDay"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.stock-balance-on-31.12", "Stock Balane on 31.12"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                      {
                        pattern: twoDecimalRegex,
                        message: t(
                          "validations.number-required",
                          "Please enter a valid number."
                        ),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.stock-balance-on-31.12", "Stock Balane on 31.12")}
                      type="text"
                      onPaste={(e) => {
                        e.preventDefault(); // Prevent pasting
                      }}
                      onKeyPress={(e) => {
                        const charCode = e.charCode;
                        const isAllowedKey = (charCode >= 48 && charCode <= 57) || e.key === "." || e.key === "Enter";

                        // Check if the key pressed is allowed
                        if (!isAllowedKey) {
                          e.preventDefault(); // Prevent default behavior (input of disallowed characters)
                        }

                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={t("global.end-beneficiary", "End beneficiary")}
                    name="endUser"
                    required
                    requiredMark
                    rules={[
                      {
                        required: true,
                        message: t("validations.required-field", {
                          field: t("global.end-beneficiary", "End beneficiary"),
                          defaultValue: "{{field}} is required!",
                        }),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t("global.end-beneficiary", "End beneficiary")}
                      type="text"
                    />
                  </Form.Item>
                </Col>
            
              </Row>
              <Button
                disabled={isSubmitLoading}
                htmlType="submit"
                size="default"
                loading={isSubmitLoading}
                type="primary"
                key="submit"
              >
                {t("global:title.add-data-import-export-substance", "Add Data Import/Export Of Substances For The Year")}
              </Button>
            </Form>
          </BasicFormWrapper>
        </AddProfile>
      </div>
    </Modal>
  );
}

export default AddDataOnImportExportSubstanceYear;
