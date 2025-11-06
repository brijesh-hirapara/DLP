import { Avatar } from "antd";
import FeatherIcon from "feather-icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "../../dropdown/dropdown";
import Heading from "../../heading/heading";
import { Popover } from "../../popup/popup";
import { InfoWraper, NavAuth, UserDropDwon } from "./auth-info-style";
import { LanguagesApi, SyncApi, UsersApi } from "api/api";
import { useTranslation } from "react-i18next";
import { theme } from "config/theme/themeVariables";
import isSuperAdmin from "utility/isSuperAdmin";
import openNotificationWithIcon from "utility/notification";
import Message from "./message";
import Notification from "./notification";
import Settings from "./settings";
import Support from "./support";
// import flags from '../../../pages/localization/system-languages/flags'

const languagesApi = new LanguagesApi();
const userApi = new UsersApi();

function AuthInfo() {
  const isSuperAdministrator = isSuperAdmin();
  const navigate = useNavigate();
  const syncApi = new SyncApi();

  const { t, i18n } = useTranslation();

  const [languages, setLanguages] = useState([]);
  const [syncRecordsCount, setSyncRecordsCount] = useState(0);

  const userName = JSON.parse(localStorage.getItem("user"))?.userName;

  const [open, setOpen] = useState(false);

  const localURL = process.env.REACT_APP_API_URL;
  const basePath = window.location.hostname === "localhost" ? localURL : "/";

  const profileImage = localStorage.getItem("profileImage");

  const defaultAvatar =
  "https://dlp-web.sparkleweb.co.in/ProfileImages/52f6476b-8d94-49a4-8f69-4cfa1b7aa81c.png";

  const [avatarSrc, setAvatarSrc] = useState(defaultAvatar);

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setAvatarSrc(storedImage);
    } else {
      setAvatarSrc(defaultAvatar);
    }
  }, []);

  const getLanguages = async () => {
    const { data } = await languagesApi.apiLanguagesGet();
    const lng = localStorage.getItem("i18nextLng");
    setLanguages(data);

    if (lng === "en-US") {
      // eslint-disable-next-line array-callback-return
      data?.map((res) => {
        if (res.isDefault) {
          i18n.changeLanguage(res.i18nCode.code);
        }
      });
    }
  };

  useEffect(() => {
    if (!userName) {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [userName]);

  useEffect(() => {
    getLanguages();
    isSuperAdministrator && getSyncInfo();
  }, []);

  const getSyncInfo = async () => {
    try {
      const response = await syncApi.apiSyncGet();
      setSyncRecordsCount(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const triggerSyncJob = async () => {
    try {
      await syncApi.apiSyncTriggerFailedSyncHangfirePost();
      openNotificationWithIcon(
        "success",
        t("sync-job:success", "Syncing was trigger successfully in background!")
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onFlagChangeHandle = (value) => {
    try {
      i18n.changeLanguage(value);
      const languageObj =
        languages.find((x) => x?.i18nCode?.code === value) || null;

      if (!languageObj) return;

      userApi.usersSetDefaultLanguagePut({
        updateLanguageRequest: { languageId: languageObj?.id },
      });
    } catch (err) {}
  };

  const userContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info">
          {/* <img src={require('../../../static/img/avatar/chat-auth.png')} alt="" /> */}
          {/* <img src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" alt="profile" width={46} height={46} title="46px * 46px" /> */}
          <img
            src={
              profileImage
                ? profileImage
                : "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"
            }
            alt="profile"
            width={46}
            height={46}
            title="46px * 46px"
            onError={(e) => {
              e.currentTarget.onerror = null; // prevent infinite loop
              e.currentTarget.src =
                "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png";
            }}
          />
          <figcaption style={{ maxWidth: "160px", wordWrap: "break-word" }}>
            <Heading as="h5">{userName}</Heading>
            {/* <p>UI Expert</p> */}
          </figcaption>
        </figure>
        <ul className="user-dropdwon__links" onClick={() => setOpen(false)}>
          <li>
            <Link to="profile">
              <FeatherIcon icon="user" /> Profile
            </Link>
          </li>
        </ul>
        <Link
          className="user-dropdwon__bottomAction"
          to={"/login"}
          replace={true}
          onClick={() => localStorage.removeItem("user")}
        >
          <FeatherIcon icon="log-out" /> Sign Out
        </Link>
      </div>
    </UserDropDwon>
  );

  const country = (
    <NavAuth>
      {languages.map((language) => {
        const isDefaultLanguage = language?.i18nCode?.code === i18n?.language;
        return (
          <Link
            onClick={() => onFlagChangeHandle(language?.i18nCode?.code)}
            to="#"
            key={language?.i18nCode?.code}
            style={{
              backgroundColor: isDefaultLanguage ? theme["linkActive"] : "",
            }}
          >
            <span className={isDefaultLanguage ? "ant-menu-item-selected" : ""}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "2px" }}
              >
                <img
                  src={require(`../../../pages/localization/system-languages/flags/${language?.i18nCode?.code}.svg`)}
                  alt={`${language?.i18nCode?.name} Flag`}
                  style={{
                    width: "1.5em",
                    height: "1.5em",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                {language?.i18nCode?.name}
              </div>
            </span>
          </Link>
        );
      })}
    </NavAuth>
  );

  return (
    <InfoWraper>
      <Settings />
      <Message />
      <Notification />

      {/* <Support /> */}

      {/* {isSuperAdministrator && (
        <div className="nav-author">
          <div className="icon-container" onClick={triggerSyncJob}>
            <FeatherIcon size={20} icon="refresh-cw" />
            {syncRecordsCount > 0 && (
              <span className="sync-count">{syncRecordsCount > 15 ? '15+' : syncRecordsCount}</span>
            )}
          </div>
        </div>
      )} */}
      <div className="nav-author">
        <Dropdown placement="bottomRight" content={country}>
          <Link
            to="#"
            className="head-example"
            // style={{
            //   display: "flex",
            //   justifyContent: "center",
            //   alignItems: "center",
            //   flexDirection: "row",
            // }}
          >
            <img
              src={require(`../../../pages/localization/system-languages/flags/${i18n.language}.svg`)}
              alt={i18n.language}
              style={{
                width: "1.5em",
                height: "1.5em",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            {/* <FeatherIcon icon="globe" /> */}
            <p
              style={{
                fontWeight: 500,
                margin: 0,
                paddingLeft: 5,
                color: "white",
                display: "none",
              }}
            >
              {localStorage.getItem("i18nextLng").toUpperCase()}
            </p>
          </Link>
        </Dropdown>
      </div>

      <div className="nav-author">
        <Popover
          placement="bottomRight"
          content={userContent}
          action="click"
          open={open}
          onOpenChange={(val) => setOpen(val)}
        >
          <Link to="#" className="head-example">
            {/* <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" /> */}
            <Avatar
              // src={
              //   profileImage
              //     ? profileImage
              //     : "https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"
              // }
              src={avatarSrc}
              onError={() => {
                // Fallback if image fails to load
                setAvatarSrc("https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png");
                return false; // prevent default behavior
              }}
            />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
}

export default AuthInfo;
