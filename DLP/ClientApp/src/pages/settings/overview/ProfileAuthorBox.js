import FeatherIcon from "feather-icons-react";
import { Link, NavLink } from "react-router-dom";
import { Upload } from "antd";
import Heading from "components/heading/heading";

import { ProfileAuthorBox } from "./style";
import { Cards } from "components/cards/frame/cards-frame";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import loggedAsCompanyUser from "utility/loggedAsCompanyUser";
import { isInstitution } from "utility/decode-jwt";

const ProfileLink = styled(NavLink)`
  color: ${(props) => (props.active ? "#5F63F2" : "#9299B8")} !important;
  font-weight: ${(props) => (props.active ? "600" : "400")} !important;
  background-color: ${(props) => (props.active ? "#f0f3ff" : "")} !important;
`;

export const BoxTypes = {
  profile: "profile",
  companyInfo: "companyInfo",
  setPassword: "setPassword",
  employmentStatus: "employmentStatus",
  qualifications: "qualifications",
};
function AuthorBox({
  onClick,
  type,
  showEmploymentStatus,
  profileImage,
  setProfileImageFile,
  fullName,
}) {
  const { t } = useTranslation();
  const currentUserIsCompany = loggedAsCompanyUser();
  const currentUserIsInstitution = isInstitution();

  const labels = {
    profile: t("common:edit-profile", "Edit Profile"),
    companyInfo: t("common:company-info", "Company Info"),
    setPassword: t("common:change-password", "Change Password"),
    employmentStatus: t("common:employment-status", "Employment status"),
    qualifiaction: t("common:employee-qualifications", "My Qualifications"),
  };

  const props = {
    // name: 'file',
    // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    // headers: {
    //   authorization: 'authorization-text',
    // },
    multiple: false,
    onChange(info) {
      if (info.file.status === "done" || info.file.status === "uploading") {
        const fileObj = info.file.originFileObj; 
        setProfileImageFile(fileObj);
      }
    },
  };
  return (
    <ProfileAuthorBox>
      <Cards headless>
        <div className="author-info">
          <figure>
            <img
              src={
                profileImage ??
                "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"
              }
              alt=""
              title="120px * 120px"
              onError={(e) => {
                e.currentTarget.src =
                  "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png";
              }}
            />
            <Upload
             {...props}   
             accept=".jpg,.jpeg,.png"
              showUploadList={false} 
              >
              <Link to="#">
                <FeatherIcon icon="camera" size={16} />
              </Link>
            </Upload>
          </figure>
          <figcaption>
            <div className="info">
              <Heading as="h4">{fullName}</Heading>
              {/* <p>Company Excutive</p> */}
            </div>
          </figcaption>
        </div>
        <nav className="settings-menmulist">
          <ul>
            <li>
              <ProfileLink
                active={type === BoxTypes.profile}
                onClick={() => onClick(BoxTypes.profile)}
              >
                <FeatherIcon icon="user" size={14} />
                {labels.profile}
              </ProfileLink>
            </li>
            {/* {(currentUserIsCompany || currentUserIsInstitution) &&  */}
            <li>
              <ProfileLink
                active={type === BoxTypes.companyInfo}
                onClick={() => onClick(BoxTypes.companyInfo)}
              >
                <FeatherIcon icon="server" size={14} />
                {labels.companyInfo}
              </ProfileLink>
            </li>
            {/* } */}
            <li>
              <ProfileLink
                active={type === BoxTypes.setPassword}
                onClick={() => onClick(BoxTypes.setPassword)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-key"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                {labels.setPassword}
              </ProfileLink>
            </li>
            {showEmploymentStatus && (
              <li>
                <ProfileLink
                  active={type === BoxTypes.employmentStatus}
                  onClick={() => onClick(BoxTypes.employmentStatus)}
                >
                  <FeatherIcon icon="briefcase" size={14} />
                  {labels.employmentStatus}
                </ProfileLink>
              </li>
            )}

            {showEmploymentStatus && (
              <li>
                <ProfileLink
                  active={type === BoxTypes.qualifications}
                  onClick={() => onClick(BoxTypes.qualifications)}
                >
                  <FeatherIcon icon="award" size={14} />
                  {labels.qualifiaction}
                </ProfileLink>
              </li>
            )}
          </ul>
        </nav>
      </Cards>
    </ProfileAuthorBox>
  );
}

AuthorBox.propTypes = {};

export default AuthorBox;
