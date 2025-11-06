import React from "react";
import { Upload, message } from "antd";
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
import propTypes from "prop-types";
import CoverImage from "../../../static/img/profile/CoverImage.png";
import { useTranslation } from "react-i18next";

function CoverSection({ bannerImage, setBannerImageFile }) {
  const { t } = useTranslation();

  const props = {
    // name: 'file',
    // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    // headers: {
    //   authorization: 'authorization-text',
    // },
    multiple: false,
    onChange(info) {
      if (info.file.status === "done" || info.file.status === "uploading") {
        const fileObj = info.file.originFileObj; // real File object
        setBannerImageFile(fileObj);
      }
    },
  };

  return (
    <div className="cover-image">
      <img
        style={{ width: "100%" }}
        src={bannerImage ?? CoverImage}
        alt="banner"
        title={t("users:users.profile-photo-cover-size", "1180px x 220px")}
        onError={(e) => {
          e.currentTarget.onerror = null; // 👈 prevent infinite loop
          e.currentTarget.src = CoverImage;
        }}
      />
      <Upload 
      {...props}   
      accept=".jpg,.jpeg,.png" 
       showUploadList={false} 
       >
        <Link to="#">
          <FeatherIcon icon="camera" size={16} /> Change Cover
        </Link>
      </Upload>
    </div>
  );
}

CoverSection.propTypes = {
  match: propTypes.object,
};

export default CoverSection;
