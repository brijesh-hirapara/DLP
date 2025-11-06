import { Card, Col, Collapse, Row, Spin, Button, Popconfirm } from "antd";
import { OrganizationsApi, RegistersApi } from "api/api";
import { PageHeader } from "components/page-headers/page-headers";
import {
    CardToolbox,
    Main,
} from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
//@ts-ignore
import { BranchWithEquipmentsDetailsDto, EquipmentDto, OrganizationStatus, RegisterDetailsDto } from "api/models";
import moment from "moment";
import styled from "styled-components";
import { hasPermission } from "utility/accessibility/hasPermission";
import { Modal } from "components/modals/antd-modals";
import EquipmentForm, { EquipmentViewMode } from "pages/equipments/components/EquipmentForm";
//@ts-ignore
import FeatherIcon from 'feather-icons-react';
import openNotificationWithIcon from "utility/notification";
const { Panel } = Collapse;

const Loader = styled.div`
    display: flex; 
    height: 400px;
    width: 100%; 
    justify-content: center; 
    justifyItems: center; 
    align-items: center
`

const CardKeyValue = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  span {
    color: #323548;
    font-size: 13px;
    display: block;
    font-weight:bold;
    margin-bottom: 3px;
  }

  p {
    font-weight: 500;
  }
`;


const registersApi = new RegistersApi();
const organizationsApi = new OrganizationsApi();

export const RegisterDetailsPage = ({ isOwnerAndOperator = false, isKghService = false, isImporterExporter = false }) => {
    const params = useParams();
    const [details, setDetails] = useState<RegisterDetailsDto>({});
    const [loading, setLoading] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentDto>({});
    const [showEquipmentDetailsModal, setShowEquipmentDetailsModal] = useState(false);
    const [isCompanyActive, setIsCompanyActive] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await registersApi.apiRegistersIdGet({ id: params.id as string });
                setIsCompanyActive(response.data.status === OrganizationStatus.NUMBER_1);
                setDetails(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id)
            fetchDetails();
    }, [params.id]);

    const openEquipmentDetailsModal = (equipment: EquipmentDto) => {
        setSelectedEquipment(equipment);
        setShowEquipmentDetailsModal(true);
    }

    const onCompanyStatusChange = async (id: any, status: OrganizationStatus) => {
        try {
            let statusDesc = '';
            await organizationsApi.apiOrganizationsIdPatch({ id, body: status })
            if (status === OrganizationStatus.NUMBER_1) {
                openNotificationWithIcon(
                    "success",
                    t("registers:company-activated", "Company status was changed to Active.")
                );
                statusDesc = t(
                    `registers:company-status-Active`,
                    'Active'
                );
                setIsCompanyActive(true);
            } else {
                openNotificationWithIcon(
                    "success",
                    t("registers:company-suspended", "Company status was changed to Suspended.")
                );
                statusDesc = t(
                    `registers:company-status-Suspended`,
                    'Suspended'
                );
                setIsCompanyActive(false);
            }
            setDetails({ ...details, status, companyStatusDesc: statusDesc });
        } catch (error) { }
    };

    return (
        <>{
            loading
                ? <Loader><Spin /> </Loader>
                :
                <>
                    <CardToolbox>
                        <PageHeader title={`${t('registers:details-of-title', 'Details of')} ${details.companyName}`} />
                    </CardToolbox>
                    <Main>
                        <Card>
                            <Row gutter={[16, 16]}>
                                <Col xs={6}>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.id-number", "Id number")}</span>
                                        <p>{details.companyIdNumber}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4" style={{ backgroundColor: '#ddd', borderRadius: 3, paddingLeft: 5, paddingRight: 5 }}>
                                        <span>{t("registers:details.company-name", "Company name")}</span>
                                        <p>{details.companyName}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.phone-number", "Phone number")}</span>
                                        <p>{details.companyPhoneNumber || '-'}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.tax-number", "Tax number")}</span>
                                        <p>{details.companyTaxNumber || '-'}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.email", "Email address")}</span>
                                        <p>{details.companyEmail}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.address", "Address")}</span>
                                        <p>{details.companyAddress}</p>
                                    </CardKeyValue>

                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.place", "Place")}</span>
                                        <p>{details.companyPlace}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.website", "Website")}</span>
                                        <p>{details.companyWebsite || '-'}</p>
                                    </CardKeyValue>
                                    {isKghService &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("global:company-type", "Company Type")}</span>
                                            <p>{details.companyType || '-'}</p>
                                        </CardKeyValue>
                                    }
                                    {isKghService &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("global.business-activity", "Business Activity")}</span>
                                            <p>{details.companyActivity || '-'}</p>
                                        </CardKeyValue>
                                    }
                                    {isImporterExporter &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("global:license-id", "License Id")}</span>
                                            <p>{details.companyLicenseId || '-'}</p>
                                        </CardKeyValue>
                                    }
                                    {isImporterExporter &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("global:license-duration", "License Duration")}</span>
                                            <p>{details.companyLicenseDuration ? moment(details.companyLicenseDuration).format('MM.DD.yyyy') : '-'}</p>
                                        </CardKeyValue>
                                    }
                                </Col>
                                <Col xs={6}>
                                    {isKghService &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("registers:details.license-id", "License Id")}</span>
                                            <p>{details.companyLicenseId || '-'}</p>
                                        </CardKeyValue>
                                    }
                                    {isKghService &&
                                        <CardKeyValue className="mt-4">
                                            <span>{t("registers:details.license-duration", "License Duration")}</span>
                                            <p>{details.companyLicenseDuration
                                                ? moment(details.companyLicenseDuration).format('MM.DD.yyyy')
                                                : '-'
                                            }</p>
                                        </CardKeyValue>
                                    }
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.address", "Headquarter (address)")}</span>
                                        <p>{details.companyAddress || '-'}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.place-city", "Place (city)")}</span>
                                        <p>{details.companyPlace || '-'}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("global.municipality", "Municipality")}</span>
                                        <p>{details.companyMunicipality}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("global.canton", "Canton")}</span>
                                        <p>{details.companyCanton}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("global.entity", "Entity")}</span>
                                        <p>{details.companyEntity}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.contact-person", "Contact person")}</span>
                                        <p>{details.companyContactPerson}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.contact-person-email", "Contact person email")}</span>
                                        <p>{details.companyContactPersonEmail}</p>
                                    </CardKeyValue>
                                    <CardKeyValue className="mt-4">
                                        <span>{t("registers:details.date-of-register", "Registration date")}</span>
                                        <p>{moment(details.companyEnrollmentDate).format('MM.DD.yyyy')}</p>
                                    </CardKeyValue>
                                </Col>
                                {isOwnerAndOperator &&
                                    <Col xs={10}>
                                        {details.branchesWithEquipments && (
                                            <>
                                                <strong>{t("global:branches", "Branches")}</strong>
                                                <div style={{ marginTop: 20, marginBottom: 20 }}>
                                                    {details.branchesWithEquipments.map((branch: BranchWithEquipmentsDetailsDto) => (
                                                        <Collapse
                                                            style={{
                                                                background: "white !important",
                                                                borderRadius: 2,
                                                                marginBottom: 20,
                                                            }}
                                                        >
                                                            <Panel
                                                                key={branch.email as any}
                                                                header={<>
                                                                    <strong>{branch.name}</strong>
                                                                    <span style={{ opacity: 0.8, marginLeft: '0.5px' }}>({branch?.equipmentsCount ?? 0} {t("global:equipments", "Equipment")})</span>
                                                                </>}
                                                                style={{
                                                                    background: "white !important",
                                                                    borderRadius: 2,
                                                                }}
                                                                forceRender
                                                            >
                                                                <Row>
                                                                    <Col xs={12} >
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:contact-person", "Contact Person")}</span>
                                                                            <p>{branch.contactPerson}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:email", "Email")}</span>
                                                                            <p>{branch.email}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:phone-number", "Phone number")}</span>
                                                                            <p>{branch.contactPhone}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:address", "Address")}</span>
                                                                            <p>{branch.address}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:place", "Place")}</span>
                                                                            <p>{branch.place}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:municipality", "Municipality")}</span>
                                                                            <p>{branch.municipality}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:canton", "Canton")}</span>
                                                                            <p>{branch.canton}</p>
                                                                        </CardKeyValue>
                                                                        <CardKeyValue className="mt-3">
                                                                            <span>{t("global:entity", "Entity")}</span>
                                                                            <p>{branch.entity}</p>
                                                                        </CardKeyValue>
                                                                    </Col>
                                                                    <Col xs={12}>
                                                                        {branch.equipments && (
                                                                            <>
                                                                                <b>{t("global:equipments", "Equipment")}</b>
                                                                                <br />
                                                                                {branch.equipments.map((equipment: EquipmentDto, index: number) => (
                                                                                    <Row>
                                                                                        <Button onClick={() => openEquipmentDetailsModal(equipment)} type="ghost" className="mt-2">
                                                                                            <FeatherIcon icon="eye" size={14} /> &nbsp; {equipment.refrigerantType} ({equipment.serialNumber})
                                                                                        </Button>
                                                                                    </Row>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                        {branch.equipments?.length === 0 && <span>-</span>}
                                                                    </Col>
                                                                </Row>
                                                            </Panel>
                                                        </Collapse>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {details.branchesWithEquipments?.length === 0 && <span>-</span>}
                                    </Col>
                                }
                                {isKghService &&
                                    <Col xs={10}>
                                        <CardKeyValue className="mt-4">
                                            <span>{t('global:status', 'Status')}</span>
                                            <p>{t(
                                                `registers:company-status-${details.companyStatusDesc}`,
                                                details.companyStatusDesc as string
                                            )}
                                                {hasPermission('registers:change-license-status') &&
                                                    <Popconfirm
                                                        title={
                                                            !isCompanyActive
                                                                ? `${t(
                                                                    "registers:activate-company",
                                                                    "Are you sure you want to activate this company"
                                                                )}`
                                                                : `${t(
                                                                    "registers:suspend-company",
                                                                    "Are you sure you want to suspend this company"
                                                                )}`
                                                        }
                                                        onConfirm={() =>
                                                            onCompanyStatusChange(params.id, !isCompanyActive
                                                                ? OrganizationStatus.NUMBER_1
                                                                : OrganizationStatus.NUMBER_2)}
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <Button
                                                            className="btn-icon btn-popconfirm-no-border"
                                                            shape="circle"
                                                        >
                                                            <FeatherIcon
                                                                icon={isCompanyActive ? `toggle-right` : "toggle-left"}
                                                                size={25}
                                                            />
                                                        </Button>
                                                    </Popconfirm>
                                                }
                                            </p>
                                        </CardKeyValue>
                                        <CardKeyValue className="mt-3">
                                            <strong>{t("global:certified-service-technicians", "Certified Service Technicians")}</strong>
                                            {details.certificationNumbers?.map((x, i) => (
                                                <label>{i + 1}. {x.certificateNumber} {x.certifiedTechnicianFullName && (`(${x.certifiedTechnicianFullName})`)}<br /></label>
                                            ))}
                                        </CardKeyValue>
                                    </Col>
                                }
                            </Row>
                        </Card>
                    </Main>
                    {showEquipmentDetailsModal && (
                        <Modal
                            width={800}
                            footer={null}
                            visible={showEquipmentDetailsModal}
                            onCancel={() => {
                                setShowEquipmentDetailsModal(false);
                                setSelectedEquipment({});
                            }}
                        >
                            <EquipmentForm mode={EquipmentViewMode.VIEW} equipment={selectedEquipment} showArchiveButton={false} />
                        </Modal>
                    )}
                </>
        }
        </>
    );
};
