import { Menu } from "antd";
import FeatherIcon from "feather-icons-react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useResolvedPath } from "react-router-dom";
import { menuItemsList } from "utility/accessibility";
import { isMenuItemVisible } from "utility/accessibility/isMenuItemVisible";

const { SubMenu } = Menu;

const MenuItems = ({ darkMode, toggleCollapsed, topMenu }) => {
  const { pathname } = useResolvedPath();
  const pathName = window.location.pathname;
  const pathArray = pathName?.split(pathname);
  const mainPath = pathArray[1];
  const mainPathSplit = mainPath?.split("/");


  const { t } = useTranslation();

  const defaultOpenKeys = !topMenu
    ? [`${mainPathSplit?.length > 2 ? mainPathSplit[1] : "dashboard"}`]
    : [];

  const canSeeMenuItem = (item) => {
    if (item.claimName) {
      return isMenuItemVisible(item);
    }
    if (item.subMenuItems) {
      return item.subMenuItems.some((subItem) => canSeeMenuItem(subItem));
    }
    return true;
  };

  const renderMenuItems = (menuItems) => {
    return menuItems.map((item) => {
      if (canSeeMenuItem(item)) {
        if (item.subMenuItems) {
          const subMenuItems = item.subMenuItems.filter((subItem) =>
            canSeeMenuItem(subItem)
          );

          if (subMenuItems.length > 0) {
            return (
              <SubMenu
                key={item.key}
                icon={!topMenu && <FeatherIcon icon={item.icon} />}
                title={item.label}
                defaultOpenKeys={defaultOpenKeys} // Set the defaultOpenKeys here
              >
                {renderMenuItems(subMenuItems)}
              </SubMenu>
            );
          }
        } else {
          return (
            <Menu.Item
             key={item.path}
                   className={({ isActive }) =>
                  isActive ? "ant-menu-item-selected" : pathName === item.path ?"ant-menu-item-selected" : ""
                }
              icon={!topMenu && <FeatherIcon icon={item.icon} />}
          
            >
              <NavLink
                className={({ isActive }) =>
                  isActive ? "ant-menu-item-selected" : pathName === item.path ?"ant-menu-item-selected" : ""
                }
                to={item.path}
              >
                {item.label}
              </NavLink>
            </Menu.Item>
          );
        }
      }

      return null;
    });
  };

  return (
    <Menu
      mode={!topMenu || window.innerWidth <= 991 ? "inline" : "horizontal"}
      theme={darkMode && "dark"}
      inlineCollapsed={!toggleCollapsed}
      selectedKeys={[pathName]}
      defaultSelectedKeys={
        !topMenu
          ? [
              `${
                mainPathSplit?.length === 1
                  ? "home"
                  : mainPathSplit?.length === 2
                  ? mainPathSplit[1]
                  : mainPathSplit[2]
              }`,
            ]
          : []
      }
      overflowedIndicator={<FeatherIcon icon="more-vertical" />}
    >
      {renderMenuItems(Object.values(menuItemsList(t)))}
    </Menu>
  );
};

MenuItems.propTypes = {
  darkMode: PropTypes.bool,
  toggleCollapsed: PropTypes.func,
  topMenu: PropTypes.bool,
};

export default MenuItems;
