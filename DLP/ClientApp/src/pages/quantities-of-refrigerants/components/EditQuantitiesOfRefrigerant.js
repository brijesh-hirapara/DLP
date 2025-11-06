import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Row, Col } from "antd";
import { useTranslation } from 'react-i18next';
import { AddProfile } from 'container/styled';
import { BasicFormWrapper } from "container/styled";
import { RefrigerantTypesApi, CodebookApi } from "api/api";

const refrigerantTypesApi = new RefrigerantTypesApi();
const codebookApi = new CodebookApi();

function EditQuantitiesOfRefrigerant({ initialValue, onCancel, onFinish }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [refrigerantData, setRefrigerantData] = useState([]);
    const [selectedRefrigerant, setSelectedRefrigerant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [codebookItemsLoading, setCodebookItemsLoading] = useState(false);
    const twoDecimalRegex = /^-?\d*\.?\d+$/;
    const [codebookData, setCodebookData] = useState({
        items: [],
    });
    const [request, setRequest] = useState({
        search: "",
        pageNumber: 1,
        pageSize: 10000000,
    });
    let apiData = []

    const handleOnCancel = () => {
        onCancel();
    };



    useEffect(() => {
        getRefrigerants();
        fetchCodebookItems(8);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Set initial values when the component mounts
        form.setFieldsValue(initialValue);
    }, []);

    const getRefrigerants = async () => {
        setIsLoading(true);
        const { data } =
            await refrigerantTypesApi.apiRefrigerantTypesGet({
                ...request,
            });
        setRefrigerantData(data.items);
        apiData = data?.items;
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


    const handleStateOfSubstanceChange = (value) => {
        const selected = codebookData.find(codebook => codebook.id === value);
        setSelectedRefrigerant(selected);
        if (selected) {
            form.setFieldsValue({
                stateOfSubstanceId: selected.id,
                stateoOfSubstance: selected.name
            });
        }
    };


    const fetchCodebookItems = async (type) => {
        try {
            setCodebookItemsLoading(true);

            const response = await codebookApi.apiCodebookByTypeGet({
                type,
                ...request,

            });

            setCodebookData(response.data.items);
        } catch (error) {
        } finally {
            setCodebookItemsLoading(false);
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
            title={t("global:title.edit-data-on-acquired", "Edit Data On Acquired")}
            open={true}
            footer={null}
            width={760}
            onCancel={handleOnCancel}
        >
            <div className="project-modal">
                <AddProfile>
                    <BasicFormWrapper>
                        <Form form={form} name="dataOnAcquired" onFinish={handleSubmit} >
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
                                label={t("global.name-of-substance-mixture", "Name of the substance (mixture)")}
                                name="refrigerantTypeId"
                                required
                                requiredMark
                                rules={[
                                    {
                                        required: true,
                                        message: t("validations.required-field", {
                                            field: t("global.name-of-substance-mixture", "Name of the substance (mixture)"),
                                            defaultValue: "{{field}} is required!",
                                        }),
                                    },
                                ]}

                            >
                                <Select
                                    showSearch
                                    placeholder={t("global.name-of-substance-mixture", "Name of the substance (mixture)")}
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                                        label={t("global.purchased-acquired", "Purchased/ acquired")}
                                        name="purchased"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.purchased-acquired", "Purchased/ acquired"),
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
                                            placeholder={t("global.purchased-acquired", "Purchased/ acquired")}
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
                                        label={t("global.collected", "Collected")}
                                        name="collected"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.collected", "Collected"),
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
                                            placeholder={t("global.collected", "Collected")}
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
                                        label={t("global.renewed", "Renewed")}
                                        name="renewed"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.renewed", "Renewed"),
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
                                            placeholder={t("global.renewed", "Renewed")}
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
                                        label={t("global.Sold", "Sold")}
                                        name="sold"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.Sold", "Sold"),
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
                                            placeholder={t("global.Sold", "Sold")}
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
                                        label={t("global.used-1", "Used (*) (1)")}
                                        name="used1"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.used-1", "Used (*) (1)"),
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
                                            placeholder={t("global.used-1", "Used (*) (1)")}
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
                                        label={t("global.used-2", "Used (*) (2)")}
                                        name="used2"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.used-2", "Used (*) (2)"),
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
                                            placeholder={t("global.used-2", "Used (*) (2)")}
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
                                        label={t("global.used-3", "Used (*) (3)")}
                                        name="used3"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.used-3", "Used (*) (3)"),
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
                                            placeholder={t("global.used-3", "Used (*) (3)")}
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
                                        label={t("global.used-4", "Used (*) (4)")}
                                        name="used4"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.used-4", "Used (*) (4)"),
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
                                            placeholder={t("global.used-4", "Used (*) (4)")}
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
                                        label={t("global.state-of-substance-mixture", "State of substance - mixture (**)")}
                                        name="stateOfSubstanceId"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.state-of-substance-mixture", "State of substance - mixture (**)"),
                                                    defaultValue: "{{field}} is required!",
                                                }),
                                            },

                                        ]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder={t("global.state-of-substance-mixture", "State of substance - mixture (**)")}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            loading={isLoading}
                                            onChange={handleStateOfSubstanceChange}

                                        >
                                            {Array.isArray(codebookData) && codebookData.map((codebook) => (
                                                <Select.Option key={codebook.id} value={codebook.id}>
                                                    {codebook.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        label={t("global.stock-balance", "Stock balance (kg) on ​​31.8")}
                                        name="stockBalance"
                                        required
                                        requiredMark
                                        rules={[
                                            {
                                                required: true,
                                                message: t("validations.required-field", {
                                                    field: t("global.stock-balance", "Stock balance (kg) on ​​31.8"),
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
                                            placeholder={t("global.stock-balance", "Stock balance (kg) on ​​31.8")}
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
                            </Row>
                            <Button
                                disabled={isSubmitLoading}
                                htmlType="submit"
                                size="default"
                                loading={isSubmitLoading}
                                type="primary"
                                key="submit"
                            >
                                {t("global:title.update-data-on-acquired", "Update Data On Acquired")}
                            </Button>
                        </Form>
                    </BasicFormWrapper>
                </AddProfile>
            </div>
        </Modal>
    );
}

export default EditQuantitiesOfRefrigerant;
