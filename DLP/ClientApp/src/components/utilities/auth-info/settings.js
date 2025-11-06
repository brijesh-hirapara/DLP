import FeatherIcon from 'feather-icons-react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { SettingDropdwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import { useTranslation } from "react-i18next";
import { isMenuItemVisible } from 'utility/accessibility/isMenuItemVisible';
import { useState } from 'react';

const { SubMenu } = Menu;

function Settings() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation(); // get current path
  const currentPath = location.pathname; // e.g., "/users"
  const menuList = {
    dashboard: {
      key: "dashboard",
      label: t("side-bar:administration", "Administration"),
      icon: "users",
      subMenuItems: [
        {
          key: "users",
          label: t("side-bar:administration.users", "Users"),
          path: "/users",
          claimName: "users",
        },
        {
          key: "user-groups",
          label: t("side-bar:administration.user-groups", "User Groups"),
          path: "/user-groups",
          claimName: "user-groups",
        },
        // {
        //   key: "vehicle-fleet",
        //   label: t("side-bar:administration.vehicle fleet", "Vehicle Fleet"),
        //   path: "/vehicle-fleet",
        //   claimName: "vehical-fleet",
        // },
      ],
    },
    configurations: {
      key: "configurations",
      label: t("side-bar:configurations", "Configurations"),
      icon: "settings",
      subMenuItems: [
        {
          key: "email",
          label: t("side-bar:configurations.email", "Email"),
          path: "/email",
          claimName: "email-options",
        },
        {
          key: "translations",
          label: t("side-bar:configurations.translations", "Translations"),
          path: "/translations",
          claimName: "translations",
        },
        {
          key: "languages",
          label: t("side-bar:configurations.languages", "Languages"),
          path: "/languages",
          claimName: "languages",
        },
      ],
    },
    codebooks: {
      key: "codebooks",
      label: t("side-bar:codebooks", "Codebooks"),
      icon: "file-text",
      subMenuItems: [
        {
          key: "type-of-trailers",
          label: t(
            "side-bar:codebooks.type-of-trailers",
            "Тype of trailers"
          ),
          path: "/type-of-trailers",
          claimName: "type-of-trailers",
        },
        {
          key: "countries",
          label: t(
            "side-bar:codebooks.countries",
            "Countries"
          ),
          path: "/countries",
          claimName: "countries",
        },
        {
          key: "operating-countries",
          label: t(
            "side-bar:codebooks.operating-countries",
            "Operating Countries"
          ),
          path: "/operating-countries",
          claimName: "operating-countries",
        },
        {
          key: "cemt-permits",
          label: t(
            "side-bar:codebooks.cemt-permits",
            "CEMT permits"
          ),
          path: "/cemt-permits",
          claimName: "cemt-permits",
        },
        {
          key: "certificates",
          label: t(
            "side-bar:codebooks.certificates",
            "Certificates"
          ),
          path: "/certificates",
          claimName: "certificates",
        },
        {
          key: "licenses",
          label: t(
            "side-bar:codebooks.licenses",
            "Licenses"
          ),
          path: "/licenses",
          claimName: "licenses",
        },
        {
          key: "goods-type",
          label: t(
            "side-bar:codebooks.goods-type",
            "Goods Type"
          ),
          path: "/goods-type",
          claimName: "goods-type",
        },
        {
          key: "vehicle-requirements",
          label: t(
            "side-bar:codebooks.vehicle-requirements",
            "Vehicle Requirements"
          ),
          path: "/vehicle-requirements",
          claimName: "vehicle-requirements",
        },
        {
          key: "currency",
          label: t(
            "side-bar:codebooks.currency",
            "Currency"
          ),
          path: "/currency",
          claimName: "currency",
        },
      ],
    },
    logs: {
      key: "logs",
      label: t("side-bar:logs", "Logs"),
      path: "/logs",
      icon: "rewind",
      claimName: "logs",
    },
  };

  const canSeeMenuItem = (item) => {
    if (item.claimName) {
      return isMenuItemVisible(item);
    }
    if (item.subMenuItems) {
      return item.subMenuItems.some((subItem) => canSeeMenuItem(subItem));
    }
    return true;
  };

  const handleMenuClick = () => {
    setOpen(false); // close popover when clicking any menu item
  };

  const renderMenu = () => {
    return Object.values(menuList)
      .filter(canSeeMenuItem) // ✅ filter out menus the user cannot see
      .map((menu) => {
        if (menu.subMenuItems) {
          const visibleSubItems = menu.subMenuItems.filter(canSeeMenuItem); // ✅ filter children

          if (visibleSubItems.length === 0) return null; // if no children visible, skip this submenu

          return (
            <SubMenu
              key={menu.key}
              icon={<FeatherIcon icon={menu.icon} size={16} />}
              title={menu.label}
              popupPlacement="rightTop"
            >
              {visibleSubItems.map((item) => (
                <Menu.Item key={item.key} onClick={handleMenuClick}>
                  <Link to={item.path}>{item.label}</Link>
                </Menu.Item>
              ))}
            </SubMenu>
          );
        }

        // ✅ render a single menu item if visible
        return (
          <Menu.Item onClick={handleMenuClick} key={menu.key} style={{ display: "flex", justifyContent: "center", alignItems: "center" }} icon={<FeatherIcon icon={menu.icon} size={16} />}>
            <Link to={menu.path}>{menu.label}</Link>
          </Menu.Item>
        );
      });
  };

  const selectedKey = Object.values(menuList)
    .flatMap(menu => menu.subMenuItems || [menu])
    .find(item => currentPath.startsWith(item.path))?.key;

  const content = (
    <SettingDropdwon>
      <div className="setting-dropdwon">
        <Menu style={{ width: 256 }} mode="vertical" selectedKeys={[selectedKey]} >
          {renderMenu()}
        </Menu>
      </div>
    </SettingDropdwon>
  );

  return (
    <div className="settings">
      <Popover placement="bottomRight" content={content} action="click" open={open}
        onOpenChange={(val) => setOpen(val)}>
        <Link to="#" className="head-example">
          <FeatherIcon icon="settings" size={20} />
        </Link>
      </Popover>
    </div>
  );
}

export default Settings;
