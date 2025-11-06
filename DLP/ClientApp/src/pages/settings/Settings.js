import { Col, Row, Skeleton } from "antd";
import { Suspense, useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";

import { UsersApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { PageHeader } from "components/page-headers/page-headers";
import { Main } from "container/styled";
import { SettingWrapper } from "./overview/style";
import SetNewPasswordPage from "pages/authentication/SetNewPasswordPage";
import EditProfile from "pages/profile/EditProfile";
import EmploymentStatusBox from "pages/settings/EmploymentStatusBox";
import propTypes from "prop-types";
import { useTranslation } from "react-i18next";
import AuthorBox, { BoxTypes } from "./overview/ProfileAuthorBox";
import { CreateInstitutionModal } from "pages/institutions/components/CreateInstitutionModal";
import { useOrganization } from "utility/useOrganization";
import loggedAsCompanyUser from "utility/loggedAsCompanyUser";
import openNotificationWithIcon from "utility/notification";
import { CompanyInfoForm } from "./overview/CompanyInfoForm";
import TechnicianQualifications from "pages/certified-technicians/components/TechnicianQualifications";
import { QualificationViewMode } from "pages/certified-technicians/components/QualificationForm";
import { Button } from "components/buttons/buttons";
import { ShareButtonPageHeader } from "components/buttons/share-button/share-button";
import { ExportButtonPageHeader } from "components/buttons/export-button/export-button";
import { CalendarButtonPageHeader } from "components/buttons/calendar-button/calendar-button";
import CoverSection from "pages/settings/overview/CoverSection";

const userApi = new UsersApi();

function Settings() {
  const { t } = useTranslation();
  const [typeOfBox, setTypeOfBox] = useState(BoxTypes.profile);
  const [id, setId] = useState();
  const [showEmploymentStatus, setShowEmploymentStatus] = useState(false);
  const { institution, fetchData } = useOrganization();
  const currentUserIsCompany = loggedAsCompanyUser();
  const [bannerImage, setBannerImage] = useState();
  const [profileImage, setProfileImage] = useState();
  const [profileImageFile, setProfileImageFile] = useState();
  const [bannerImageFile, setBannerImageFile] = useState();
  const [fullName, setFullName] = useState("");

  const handleAuthorBox = (value) => {
    setTypeOfBox(value);
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
    if (profileImageFile) {
      const previewUrl = URL.createObjectURL(profileImageFile);
      setProfileImage(previewUrl);

      // cleanup to avoid memory leaks
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [profileImageFile]);

  useEffect(() => {
    if (bannerImageFile) {
      const previewUrl = URL.createObjectURL(bannerImageFile);
      setBannerImage(previewUrl);

      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [bannerImageFile]);

  const fetchUserData = async () => {
    try {
      const {
        data: { roleName, id, bannerImage, profileImage, firstName, lastName },
      } = await userApi.usersMeGet();
      const isCertifiedTechician = roleName?.includes(
        "Service technicians - individuals"
      );
      setId(id);
      setShowEmploymentStatus(isCertifiedTechician);
      setProfileImage(profileImage);
      setBannerImage(bannerImage);
      if(firstName !==null || lastName !== null){
        setFullName(firstName + " " + lastName);
      }
    } catch (err) {}
  };

  const renderBoxComponent = () => {
    switch (typeOfBox) {
      case BoxTypes.profile:
        return (
          <EditProfile
            render={true}
            profileImage={profileImageFile}
            bannerImage={bannerImageFile}
          />
        );
      case BoxTypes.companyInfo:
        return (
          <CompanyInfoForm
            id={institution.id}
            isVisible={true}
            currentUserIsCompany={currentUserIsCompany}
            onSubmitSuccess={() => fetchData()}
            institutionToEdit={institution}
          />
        );
      case BoxTypes.setPassword:
        return <SetNewPasswordPage isOnBoardingMode={false} />;
      case BoxTypes.employmentStatus:
        return <EmploymentStatusBox />;
      case BoxTypes.qualifications:
        return <TechnicianQualifications id={id} hideAdd={true} />;
      default:
        return null;
    }
  };

  const getCardTitle = () => {
    const {
      employmentStatus,
      profile,
      companyInfo,
      setPassword,
      qualifications,
    } = BoxTypes;

    const titles = {
      [profile]: t("edit-profile:subtitle", "Set Up Your Personal Information"),
      [companyInfo]: t(
        "company-info:subtitle",
        "Update your Company Information"
      ),
      [setPassword]: t("password:subtitle", "Change Password"),
      [employmentStatus]: t("common:employment-status", "Employment status"),
      [qualifications]: t("common:employment-qualifications", "Qualifications"),
    };

    return titles[typeOfBox];
  };

  return (
    <>
      <PageHeader ghost title={t("profile:settings", "Profile Settings")} />
      {/* <PageHeader
        ghost
        title={t('profile:settings', "Profile Settings")}
        buttons={[
          <div key="1" className="page-header-actions">
            <CalendarButtonPageHeader />
            <ExportButtonPageHeader />
            <ShareButtonPageHeader />
            <Button size="small" type="primary">
              <FeatherIcon icon="plus" size={14} />
              Add New
            </Button>
          </div>,
        ]}
      /> */}

      <Main>
        <Row>
          <Col xxl={6} lg={8} md={10} xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton avatar />
                </Cards>
              }
            >
              <AuthorBox
                onClick={handleAuthorBox}
                type={typeOfBox}
                showEmploymentStatus={showEmploymentStatus}
                profileImage={profileImage}
                setProfileImageFile={setProfileImageFile}
                fullName={fullName}
              />
            </Suspense>
          </Col>
          <Col xxl={18} lg={16} md={14} xs={24}>
            <SettingWrapper>
              <Suspense
                fallback={
                  <Cards headless>
                    <Skeleton avatar />
                  </Cards>
                }
              >
                <CoverSection
                  onClick={handleAuthorBox}
                  type={typeOfBox}
                  bannerImage={bannerImage}
                  setBannerImageFile={setBannerImageFile}
                />
              </Suspense>
              <Main>
                {/* <div className="setting-card-title" style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: 0 }}>{t("edit-profile:title", "Edit Profile")}</h3>
                  <span style={{ color: "#888", fontSize: 14 }}>{getCardTitle()}</span>
                </div> */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Cards
                    style={{ maxWidth: "100%", width: "100%" }}
                    title={
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* <h6><strong>{t("edit-profile:title", "Edit Profile")}</strong></h6> */}
                        <h6 style={{ color: "#888", fontSize: 14 }}>
                          {getCardTitle()}
                        </h6>
                      </div>
                    }
                  >
                    <Row align="center" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {renderBoxComponent()}
                      </div>
                    </Row>
                  </Cards>
                </div>
              </Main>
            </SettingWrapper>
          </Col>
        </Row>
      </Main>
    </>
  );
}

Settings.propTypes = {
  match: propTypes.object,
};

export default Settings;
