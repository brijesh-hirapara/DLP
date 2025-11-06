import { Card, Col, DatePicker, Input, Row, Spin } from "antd";
import { RequestsApi } from "api/api";
import { Button } from "components/buttons/buttons";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import {
    CardToolbox,
    DatePickerWrapper,
    FileCardWrapper,
    Main,
} from "container/styled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
//@ts-ignore
import FeatherIcon from "feather-icons-react";
import { ApproveRequestDto, RequestDetailsDto, RequestStatus, RequestType, VehicleFleetRequestStatus } from "api/models";
import moment from "moment";
import { humanFileSize, shortenFileName } from "utility/utility";
import styled from "styled-components";
import renderStatusBadge from "components/tags/requestStatusTag";
import TextArea from "antd/lib/input/TextArea";
import openNotificationWithIcon from "utility/notification";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import loggedAsCompanyUser from "utility/loggedAsCompanyUser";
import { formatDate } from "api/common";

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

interface AddVehicleFleetProps {
    viewKey?: string;
}


const requestsApi = new RequestsApi();

export const VehicleFleetDetailsPage: React.FC<AddVehicleFleetProps> = ({ viewKey }) => {

    const params = useParams();
    const [requestData, setRequestData] = useState<RequestDetailsDto>({});
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestActData, setRequestActData] = useState<ApproveRequestDto>({});
    const [isApprovingRequest, setIsApprovingRequest] = useState(false);
    const [isRejectingRequest, setIsRejectingRequest] = useState(false);
    const [isInPendingStatus, setIsInPendingStatus] = useState(false);
    const [licenseDurationValid, setLicenseDurationValid] = useState(false);
    const currentUserIsCompany = loggedAsCompanyUser();
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setRequestLoading(true);
                const response = await requestsApi.apiVehicleFleetRequestsIdGet({ id: params.id as string });
                const responseData = response.data;
                setRequestData(responseData);
                setIsInPendingStatus(responseData.status === RequestStatus.PENDING);
            } catch (error) {
                console.error(error);
            } finally {
                setRequestLoading(false);
            }
        };

        if (params.id)
            fetchDetails();
    }, [params.id]);

    const downloadFile = (fileId: string, contentType: string) => {
        requestsApi.apiRequestsDownloadFileIdGet({ fileId: fileId }, { responseType: 'blob' })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileId);
                document.body.appendChild(link);
                link.click();
            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleInputChange = (key: keyof ApproveRequestDto, event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedData = { ...requestActData, [key]: event.target.value };
        setRequestActData(updatedData);
    }

    const onDateChange = (date: moment.Moment | null, key: any) => {
        // const data = moment(date, "DD.MM.yyyy").format("MM/DD/yyyy");
        const updatedData = { ...requestActData, [key]: date };
        setRequestActData(updatedData);
        key === 'licenseDuration' && setLicenseDurationValid(date !== null);
    };

    const renderLicenseDuration = () => {
        return (
            <CardKeyValue>
                <span>{t("requests:details.license-duration", "License Duration")}</span>
                {(requestData.status !== RequestStatus.PENDING || currentUserIsCompany) && (
                    <p>{requestData.licenseDuration ? moment(requestData.licenseDuration).format('MM.DD.yyyy') : '-'}</p>
                )}
                {isInPendingStatus && !currentUserIsCompany &&
                    <DatePickerWrapper style={{ height: "38px", width: '75%' }}>
                        <DatePicker
                            status={licenseDurationValid ? '' : 'error'}
                            onChange={(data) => onDateChange(data, 'licenseDuration')}
                            aria-required={true}
                            value={requestActData.licenseDuration ? moment(requestActData.licenseDuration) : null}
                            suffixIcon={<FeatherIcon icon="calendar" size={14} />}
                            format={"DD.MM.YYYY"}
                        />
                    </DatePickerWrapper>
                }
            </CardKeyValue>
        )
    }

    const getRequestStatus = (request: VehicleFleetRequestStatus, statusDesc: string) => {
        let color = "deactivate";
      
        if (request === VehicleFleetRequestStatus.PENDING) {
          color = "deactivate";
        } else if (request === VehicleFleetRequestStatus.REJECTED) {
          color = "blocked";
        } else if (request === VehicleFleetRequestStatus.CONFIRMED) {
          color = "active";
        }
      
        return <span className={`ant-tag ${color}`}>{statusDesc}</span>;
      };

    const checkLicenseValidations = () => {
        let isValid = true;
        // if (!requestActData.licenseId &&
        //     (isRegistrationOfServiceCompany || isRegistrationOfImportersExporters)) {
        //     openNotificationWithIcon(
        //         "error",
        //         t('approve-request:license-id-required', 'License ID is required')
        //     );
        //     isValid = false;
        // }

        // if (!licenseDurationValid &&
        //     (isRegistrationOfServiceCompany || isRegistrationOfImportersExporters || isRequestForLicenseExtension)) {
        //     openNotificationWithIcon(
        //         "error",
        //         t('approve-request:license-expiration-date-required', 'License duration is required')
        //     );
        //     isValid = false;
        // }

        return isValid;
    }

    const approveRequest = async () => {
        // const licenseInputsValid = checkLicenseValidations();
        // if (!licenseInputsValid) return;

        try {
            setIsApprovingRequest(true);
            await requestsApi.apiVehicleFleetRequestsIdApprovePut({ id: params.id as string, body: requestActData.comments as string });
            navigate("/vehicle-fleet-request");
            openNotificationWithIcon(
                "success",
                t("requests:success-approval", "Request approved successfully")
            );

        } catch (error) {
            // openNotificationWithIcon(
            //     "error",
            //     t('requests:error-approval', 'Request failed to be approved')
            // );
        } finally {
            setIsApprovingRequest(false);
        }
    }

    const rejectRequest = async () => {
        try {
            if (!requestActData.comments || requestActData.comments.trim() === "") {
                openNotificationWithIcon(
                    "error",
                    t("requests:validation.reject-comments-required", "Please enter comments before rejecting the request")
                );
                return;
            }
            setIsRejectingRequest(true);
            await requestsApi.apiVehicleFleetRequestsIdRejectPut({ id: params.id as string, body: requestActData.comments || '' });
            navigate("/vehicle-fleet-request");
            openNotificationWithIcon(
                "success",
                t("requests:success-reject", "Request rejected successfully")
            );
        } catch (error) {
            openNotificationWithIcon(
                "error",
                t('requests:error-reject', 'Request failed to be rejected')
            );
        } finally {
            setIsRejectingRequest(false);
        }
    }

    return (
        <>{
            requestLoading
                ? <Loader><Spin /> </Loader>
                :
                <>
                    <CardToolbox>
                        <PageHeader title={t('requests:details-title', 'Details of request')} 
                        buttons={[
                            <Button
                                type="primary"
                                onClick={() => navigate(-1)}
                            >
                                {t("global:go.back", "Go back")}{" "}
                                <FeatherIcon icon="arrow-left" size={16} />
                            </Button>
                        ]}/>
                    </CardToolbox>
                    <Main>
                        <Card>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={24} md={12} lg={12}>
                                    <>
                                        {/* Question 1 - Total number of vehicles */}
                                        <CardKeyValue>
                                            <span>{t("requests:details.total-number-of-vehicles-in-fleet", "What is the total number of vehicles in your fleet?")}</span>
                                            <p>
                                                {requestData.questionnaires?.find(q => q.questionNo === 1)?.values ?? "-"}
                                            </p>
                                        </CardKeyValue>

                                        {/* Question 2 - Trailer Types and Quantities */}
                                        <CardKeyValue>
                                            <span>{t("requests:details.trailer-type", "How many trailers do you operate by trailer type?")}</span>
                                            {(() => {
                                                const trailers = requestData.questionnaires?.filter(q => q.questionNo === 2) ?? [];
                                                return trailers.length ? (
                                                    <table className="min-w-full border border-gray-300 rounded-md mt-2 text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="border px-3 py-2 text-left">{t("add vehicle fleet:other trailer", "Trailer Type")}</th>
                                                                <th className="border px-3 py-2 text-left">{t("requests:details.trailer-qty", "Trailer Qty")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {trailers.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="border px-3 py-2">{item.codebookName ?? "-"}</td>
                                                                    <td className="border px-3 py-2">{item.trailerQTY ?? "-"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p>-</p>
                                                );
                                            })()}
                                        </CardKeyValue>

                                        {/* Question 3 - CEMT Permits and Countries */}
                                        <CardKeyValue>
                                            <span>{t("requests:details.cemt-permits", "How many CEMT permits do you possess, and for which countries?")}</span>
                                            {(() => {
                                                const cemt = requestData.questionnaires?.filter(q => q.questionNo === 3) ?? [];
                                                return cemt.length ? (
                                                    <table className="min-w-full border border-gray-300 rounded-md mt-2 text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="border px-3 py-2 text-left">{t("add-new-vehicle-fleet.cemt-permits-placeholder", "CEMT permits")}</th>
                                                                <th className="border px-3 py-2 text-left">{t("requests:details.country", "Country")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {cemt.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="border px-3 py-2">{item.codebookName ?? "-"}</td>
                                                                    <td className="border px-3 py-2">{item.countryName ?? "-"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p>-</p>
                                                );
                                            })()}
                                        </CardKeyValue>

                                        {/* Question 4 - Certifications & Licenses */}
                                        <CardKeyValue>
                                            <span>{t("requests:details.certifications", "Which certifications and licenses does your company hold?")}</span>
                                            <p>
                                                {(() => {
                                                    const certs = requestData.questionnaires?.filter(q => q.questionNo === 4) ?? [];
                                                    return certs.length
                                                        ? certs.map(c => c.codebookName).filter(Boolean).join(", ")
                                                        : "-";
                                                })()}
                                            </p>
                                        </CardKeyValue>

                                        {/* Question 5 - Operating Countries */}
                                        <CardKeyValue>
                                            <span>{t("requests:details.operating-countries", "Which countries do you operate in?")}</span>
                                            <p>
                                                {(() => {
                                                    const countries = requestData.questionnaires?.filter(q => q.questionNo === 5) ?? [];
                                                    return countries.length
                                                        ? countries.map(c => c.countryName).filter(Boolean).join(", ")
                                                        : "-";
                                                })()}
                                            </p>
                                        </CardKeyValue>
                                    </>
                                </Col>

                                <Col xs={24} sm={24} md={12} lg={12}>
                                    <CardKeyValue className="mt-3">
                                        <span>{t("requests:details.status", "Status")}</span>
                                        <p style={{ width: '30%' }}>{renderStatusBadge(requestData.status as RequestStatus,
                                            t(`requests:status.${requestData.status}`, requestData.statusText as string))}</p>
                                    </CardKeyValue>

                                   
                                    <CardKeyValue>
                                        {!isInPendingStatus &&
                                            <>
                                                <span>{t("requests:details.approve-comments", "Approve Comments")}</span>
                                                <i>{requestData.comments || ''}</i>
                                            </>
                                        }
                                         {!isInPendingStatus &&
                                            <>
                                                <span>{t("requests:details.approved-by", "Approved By")}</span>
                                                <i>{requestData.actionedName || ''}</i>
                                            </>
                                        }
                                          {!isInPendingStatus &&
                                            <>
                                                <span>{t("requests:details.approve-date", "Approve Date")}</span>
                                                <i>{formatDate(requestData.actionedAt) || ''}</i>
                                            </>
                                        }
                                        {isInPendingStatus && (
                                            <>
                                                <span>{t("requests:details.approve-comments", "Approve Comments")}</span>
                                                <i>{requestData.comments || ''}</i>
                                                {hasPermission("carrier-vehical-fleet-request:approve") && ( <TextArea
                                                    style={{ width: '100%' }}
                                                    rows={3}
                                                    status={!requestActData.comments?.trim() && isRejectingRequest ? "error" : ""}
                                                    onChange={e => handleInputChange('comments', e)}
                                                />)}
                                            </>
                                        )}

                                    </CardKeyValue>


                                    {isInPendingStatus && (
                                        <div
                                            className="mt-5 approve"
                                            style={{ display: "flex", gap: 20, justifyContent: "flex-end" }}
                                        >
                                             {hasPermission("carrier-vehical-fleet-request:approve") &&

                                            <Button
                                                type="success"
                                                loading={isApprovingRequest}
                                                disabled={isRejectingRequest}
                                                onClick={approveRequest}
                                            >
                                                {t('requests:details.approve', 'Approve')}
                                            </Button>
                                              }
                                            {hasPermission("carrier-vehical-fleet-request:reject") &&
                                            <Button
                                                type="danger"
                                                loading={isRejectingRequest}
                                                disabled={isApprovingRequest}
                                                onClick={rejectRequest}
                                            >
                                                {t('requests:details.reject', 'Reject')}
                                            </Button>
                                            }
                                        </div>
                                    )}
                                </Col>
                            </Row>

                        </Card>
                    </Main>
                </>
        }
        </>
    );
};
