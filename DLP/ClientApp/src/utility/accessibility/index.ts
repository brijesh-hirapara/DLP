import { PredefinedRoles } from "constants/constants";
import { getRole } from "utility/decode-jwt";
import { getClaims } from "utility/getClaims";

export const menuItemsList = (t: any) => {
  const roles = getRole();
  const ownerLogin = Object.values(PredefinedRoles)
    .filter(role => role === PredefinedRoles.COMP_KGH_OWNER_OPERATOR)
    .some(role => roles.includes(role));


  const serviceCompanyLogin = Object.values(PredefinedRoles)
    .filter(role => role === PredefinedRoles.COMP_KGH_SERVICE)
    .some(role => roles.includes(role));


  const importExport = Object.values(PredefinedRoles)
    .filter(role => role === PredefinedRoles.COMP_KGH_IMPORT_EXPORT)
    .some(role => roles.includes(role));



  return {
    dashboardLog: {
      key: "dashboardLog",
      label: t("side-bar:dashboard", "Dashboard"),
      path: "/",
      icon: "home",
      claimName: "dashboard",
    },
    CarrierVehicleFleet: {
      key: "carriervehiclefleet",
      label: t("side-bar:carrier-vehicle-fleet", "Carrier Vehicle Fleet"),
      icon: "save",
      subMenuItems: [
        {
          key: "vehicle-fleet-request",
          label: t(
            "side-bar:carriervehiclefleet.vehicle-fleet-request",
            "Vehicle Fleet Request"
          ),
          path: "/vehicle-fleet-request",
          claimName: "carrier-vehical-fleet-request:list",
          checkOnlyPermission: true,
        },
        {
          key: "active-vehicle-fleet",
          label: t(
            "side-bar:carriervehiclefleet.active-vehicle-fleet",
            "Active Vehicle Fleet"
          ),
          path: "/active-vehicle-fleet",
          claimName: "carrier-active-vehical-fleet-request:list",
          checkOnlyPermission: true,
        },
      ],
    },

    ManageTransportRequests: {
      key: "manage-transport-requests",
      label: t("side-bar:manage-transport-requests", "Manage Transport Requests"),
      path: "/manage-transport-requests",
      claimName: "manage-transport-requests",
      icon: "truck",
    },

    // ManageTransportOffers: {
    //   key: "manage-transport-offers",
    //   label: t("side-bar:administration.manage-transport-offers", "Manage Transport Offers"),
    //   path: "/manage-transport-offers",
    //   claimName: "manage-transport-offers",
    //   icon: "truck",
    // },

    VehicleFleet: {
      key: "vehicle-fleet",
      label: t("side-bar:administration.vehicle fleet", "Vehicle Fleet"),
      path: "/vehicle-fleet",
      claimName: "vehical-fleet",
      icon: "truck",
    },

    // dashboard: {
    //   key: "dashboard",
    //   label: t("side-bar:administration", "Administration"),
    //   icon: "users",
    //   subMenuItems: [
    //     {
    //       key: "users",
    //       label: t("side-bar:administration.users", "Users"),
    //       path: "/users",
    //       claimName: "users",
    //     },
    //     {
    //       key: "user-groups",
    //       label: t("side-bar:administration.user-groups", "User Groups"),
    //       path: "/user-groups",
    //       claimName: "user-groups",
    //     },
    //     {
    //       key: "vehicle-fleet",
    //       label: t("side-bar:administration.vehicle fleet", "Vehicle Fleet"),
    //       path: "/vehicle-fleet",
    //       // claimName: "vehicle-fleet",
    //       checkOnlyPermission: true,
    //     },
    // {
    //   key: "branches",
    //   label: t("side-bar:administration.branches", "Branches"),
    //   path: "/branches",
    //   claimName: "branches",
    // },
    // {
    //   key: "database-connections",
    //   label: t("side-bar:administration.database-connections", "Database Connections"),
    //   path: "/database-connections",
    //   claimName: 'database-connections:list',
    //   checkOnlyPermission: true,
    // },
    // {
    //   key: "company-technicians",
    //   label: t(
    //     "side-bar:administration.company-technicians",
    //     "Company Certified Technicians"
    //   ),
    //   path: "/company-technicians",
    //   claimName: "company-technicians:list",
    //   checkOnlyPermission: true,
    // },
    //   ],
    // },
    requests: {
      key: "requests",
      label: t("side-bar:requests", "Requests"),
      icon: "save",
      subMenuItems: [
        {
          key: "requests-awaiting-approval",
          label: t("side-bar:requests.active-requests", "Active Requests"),
          path: "/requests",
          claimName: "requests:list-awaiting-approval",
          checkOnlyPermission: true,
        },
        // {
        //   key: "new-requests",
        //   label: t("side-bar:new-requests", "New requests"),
        //   subMenuItems: [
        //     ...(ownerLogin==false ? [
        //       {
        //         key: "add-requests-owners-operators-of-kgh-equipment",
        //         label: t(
        //           "side-bar:add-requests-owners-operators-of-equipment",
        //           "Owners and Operators of KGH equipment"
        //         ),
        //         path: "/requests/create/1",
        //         claimName:
        //           "requests:request-for-adding-owners-and-operators-of-kgh-equipment",
        //         checkOnlyPermission: true,
        //       },
        //     ]
        //       : []),
        //     ...(serviceCompanyLogin==false ? [
        //       {
        //         key: "add-requests-kgh-service-companies-entrepreneurs",
        //         label: t(
        //           "side-bar:add-requests-service-companies-entrepreneurs",
        //           "KGH service companies/entrepreneurs"
        //         ),
        //         path: "/requests/create/2",
        //         claimName:
        //           "requests:request-for-adding-and-licensing-of-kgh-companies",
        //         checkOnlyPermission: true,
        //       },
        //     ]
        //       : []),
        //     ...(serviceCompanyLogin==true ? [
        //       {
        //         key: "add-requests-for-license-extension-of-kgh-companies",
        //         label: t(
        //           "side-bar:add-request-for-license-extension-of-companies",
        //           "License extension for service companies/entrepreneurs"
        //         ),
        //         path: "/requests/create/4",
        //         claimName:
        //           "requests:request-for-extending-license-of-kgh-companies",
        //         checkOnlyPermission: true,
        //       },

        //     ]
        //       : []),
        //       ...(importExport==false ? [
        //         {
        //           key: "request-for-adding-importers-exporters-of-kgh-equipment",
        //           label: t(
        //             "side-bar:request-for-adding-importers-exporters-of-equipment",
        //             "Importers/Exporters of KGH equipment"
        //           ),
        //           path: "/requests/create/3",
        //           claimName:
        //             "requests:request-for-adding-importers-exporters-of-kgh-equipment",
        //           checkOnlyPermission: true,
        //         },

        //       ]
        //         : []),
        //     ...((!ownerLogin && !importExport && !serviceCompanyLogin) ? [
        //       {
        //         key: "add-requests-owners-operators-of-kgh-equipment",
        //         label: t(
        //           "side-bar:add-requests-owners-operators-of-equipment",
        //           "Owners and Operators of KGH equipment"
        //         ),
        //         path: "/requests/create/1",
        //         claimName:
        //           "requests:request-for-adding-owners-and-operators-of-kgh-equipment",
        //         checkOnlyPermission: true,
        //       },
        //       {
        //         key: "add-requests-kgh-service-companies-entrepreneurs",
        //         label: t(
        //           "side-bar:add-requests-service-companies-entrepreneurs",
        //           "KGH service companies/entrepreneurs"
        //         ),
        //         path: "/requests/create/2",
        //         claimName:
        //           "requests:request-for-adding-and-licensing-of-kgh-companies",
        //         checkOnlyPermission: true,
        //       },
        //       {
        //         key: "request-for-adding-importers-exporters-of-kgh-equipment",
        //         label: t(
        //           "side-bar:request-for-adding-importers-exporters-of-equipment",
        //           "Importers/Exporters of KGH equipment"
        //         ),
        //         path: "/requests/create/3",
        //         claimName:
        //           "requests:request-for-adding-importers-exporters-of-kgh-equipment",
        //         checkOnlyPermission: true,
        //       },
        //       {
        //         key: "add-requests-for-license-extension-of-kgh-companies",
        //         label: t(
        //           "side-bar:add-request-for-license-extension-of-companies",
        //           "License extension for service companies/entrepreneurs"
        //         ),
        //         path: "/requests/create/4",
        //         claimName:
        //           "requests:request-for-extending-license-of-kgh-companies",
        //         checkOnlyPermission: true,
        //       },
        //     ]
        //       : []),
        //   ].filter(
        //     (item, index, self) =>
        //       index === self.findIndex((t) => t.key === item.key)
        //   ),
        // },
        {
          key: "archived-requests",
          label: t("side-bar:requests.archived-request", "Archived Request"),
          path: "/archived-request",
          claimName: "requests:list-archived",
          checkOnlyPermission: true,
        },
      ],
    },

    managecompanies: {
      key: "manage-companies",
      label: t("side-bar:manage companies", "Manage Companies"),
      icon: "briefcase",
      subMenuItems: [
        {
          key: "companies",
          label: t("side-bar:manage companies.company list", "Company List"),
          path: "/companies",
          claimName: "manage-companies:list",
          checkOnlyPermission: true,
        },
        // {
        //   key: "branches",
        //   label: t("side-bar:administration.branches", "Branches"),
        //   path: "/branches",
        //   claimName: "branches",
        // },
        // {
        //   key: "database-connections",
        //   label: t("side-bar:administration.database-connections", ""),
        //   path: "/database-connections",
        //   claimName: 'database-connections:list',
        //   checkOnlyPermission: true,
        // },
        // {
        //   key: "company-technicians",
        //   label: t(
        //     "side-bar:administration.company-technicians",
        //     "Company Certified Technicians"
        //   ),
        //   path: "/company-technicians",
        //   claimName: "company-technicians:list",
        //   checkOnlyPermission: true,
        // },
      ],
    },
    transportRequests: {
      key: "transport-requests",
      label: t("side-bar:transport-requests", "Transport Requests"),
      icon: "briefcase",
      subMenuItems: [
        {
          key: "active-requests",
          label: t("side-bar:transport.active-requests", "Active Requests"),
          path: "/active-requests",
          claimName: "transport-active-requests:list",
          checkOnlyPermission: true,
        },
        {
          key: "archived-requests",
          label: t("side-bar:transport.archived-requests", "Archived Requests"),
          path: "/archived-requests",
          claimName: "transport-archived-requests:list",
          checkOnlyPermission: true,
        },
      ],
    },
    // configurations: {
    //   key: "configurations",
    //   label: t("side-bar:configurations", "Configurations"),
    //   icon: "settings",
    //   subMenuItems: [
    //     {
    //       key: "email",
    //       label: t("side-bar:configurations.email", "Email"),
    //       path: "/email",
    //       claimName: "email-options",
    //     },
    //     {
    //       key: "translations",
    //       label: t("side-bar:configurations.translations", "Translations"),
    //       path: "/translations",
    //       claimName: "translations",
    //     },
    //     {
    //       key: "languages",
    //       label: t("side-bar:configurations.languages", "Languages"),
    //       path: "/languages",
    //       claimName: "languages",
    //     },
    //   ],
    // },
    // codebooks: {
    //   key: "codebooks",
    //   label: t("side-bar:codebooks", "Codebooks"),
    //   icon: "file-text",
    //   subMenuItems: [
    //     {
    //       key: "type-of-trailers",
    //       label: t(
    //         "side-bar:codebooks.type-of-trailers",
    //         "Тype of trailers"
    //       ),
    //       path: "/type-of-trailers",
    //       claimName: "type-of-trailers",
    //     },
    //     // {
    //     //   key: "refrigeration-systems",
    //     //   label: t(
    //     //     "side-bar:codebooks.refrigeration-systems",
    //     //     "Refrigeration Systems"
    //     //   ),
    //     //   path: "/refrigeration-systems",
    //     //   claimName: "refrigeration-systems",
    //     // },
    //     {
    //       key: "countries",
    //       label: t(
    //         "side-bar:codebooks.countries",
    //         "Countries"
    //       ),
    //       path: "/countries",
    //       claimName: "countries",
    //     },
    //     {
    //       key: "operating-countries",
    //       label: t(
    //         "side-bar:codebooks.operating-countries",
    //         "Operating Countries"
    //       ),
    //       path: "/operating-countries",
    //       claimName: "operating-countries",
    //     },
    //     {
    //       key: "cemt-permits",
    //       label: t(
    //         "side-bar:codebooks.cemt-permits",
    //         "CEMT permits"
    //       ),
    //       path: "/cemt-permits",
    //       claimName: "cemt-permits",
    //     },
    //     {
    //       key: "certificates",
    //       label: t(
    //         "side-bar:codebooks.certificates",
    //         "Certificates"
    //       ),
    //       path: "/certificates",
    //       claimName: "certificates",
    //     },
    //     {
    //       key: "licenses",
    //       label: t(
    //         "side-bar:codebooks.licenses",
    //         "Licenses"
    //       ),
    //       path: "/licenses",
    //       claimName: "licenses",
    //     },
    //     {
    //       key: "goods-type",
    //       label: t(
    //         "side-bar:codebooks.goods-type",
    //         "Goods Type"
    //       ),
    //       path: "/goods-type",
    //       claimName: "goods-type",
    //     },
    //     {
    //       key: "vehicle-requirements",
    //       label: t(
    //         "side-bar:codebooks.vehicle-requirements",
    //         "Vehicle Requirements"
    //       ),
    //       path: "/vehicle-requirements",
    //       claimName: "vehicle-requirements",
    //     },
    //     // {
    //     //   key: "municipalities",
    //     //   label: t("side-bar:codebooks.municipalities", "Municipalities"),
    //     //   path: "/municipalities",
    //     //   claimName: "municipalities",
    //     // },
    //     // {
    //     //   key: "cantons",
    //     //   label: t("side-bar:codebooks.cantons", "Cantons"),
    //     //   path: "/cantons",
    //     //   claimName: "cantons",
    //     // },
    //     // {
    //     //   key: "entities",
    //     //   label: t("side-bar:codebooks.entities", "Entities"),
    //     //   path: "/entities",
    //     //   claimName: "entities",
    //     // },
    //   ],
    // },

    myorders: {
      key: "my-orders",
      label: t("side-bar:my-orders", "My Orders"),
      path: "/my-orders",
      claimName: "my-orders",
      icon: "save",
    },

    myrequests: {
      key: "my-requests",
      label: t("side-bar:my-requests", "My Requests"),
      path: "/my-requests",
      icon: "save",
      claimName: "my-requests",
    },

    myshipments: {
      key: "my-shipments",
      label: t("side-bar:my-shipments", "My Shipments"),
      path: "/my-shipments",
      icon: "save",
      claimName: "my-shipments",
    },
    shipments: {
      key: "shipments",
      label: t("side-bar:shipments", "Shipments"),
      path: "/shipments",
      claimName: "shipments",
      icon: "truck",
    },
    // registers: {
    //   key: "registers",
    //   label: t("side-bar:registers", "Registers"),
    //   icon: "clipboard",
    //   subMenuItems: [
    //     {
    //       key: "all-registers",
    //       label: t(
    //         "side-bar:registers.all-companies-entrepreneurs",
    //         "All registered companies/entrepreneurs"
    //       ),
    //       path: "/registers/all-companies-entrepreneurs",
    //       claimName: "registers:list-all-registered-companies-entrepreneurs",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "registers-owner-operators-of-kgh-equipment",
    //       label: t(
    //         "side-bar:registers.owner-operators-of-equipment",
    //         "Owners and Operators of KGH equipment"
    //       ),
    //       path: "/registers/owners-operators-of-kgh-equipment",
    //       claimName: "registers:list-of-owners-and-operators-of-kgh-equipment",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "registers-recoded-marked-equipment",
    //       label: t(
    //         "side-bar:registers.marked-equipment",
    //         "Recorded/Marked equipment"
    //       ),
    //       path: "/registers/marked-equipment",
    //       claimName: "registers:list-of-marked-equipment",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "registers-kgh-service-companies",
    //       label: t(
    //         "side-bar:registers.service-companies",
    //         "KGH service companies"
    //       ),
    //       path: "/registers/kgh-service-companies",
    //       claimName: "registers:list-of-kgh-companies",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "registers-certified-technicians",
    //       label: t(
    //         "side-bar:registers.certified-technicians",
    //         "Certified Service Technicians"
    //       ),
    //       path: "/registers/certified-technicians",
    //       claimName: "registers:list-of-certified-technicians",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "registers-importers",
    //       label: t("side-bar:registers.importers", "Importers"),
    //       path: "/registers/importers",
    //       claimName: "registers:list-of-importers",
    //       checkOnlyPermission: true,
    //     },
    //   ],
    // },
    // equipments: {
    //   key: "equipments",
    //   label: t("side-bar:equipments", "Equipment"),
    //   path: "/equipments",
    //   icon: "tool",
    //   claimName: "equipments",
    // },
    // reports: {
    //   key: "reports",
    //   label: t("side-bar:reports", "Reports"),
    //   path: "/reports",
    //   icon: "bar-chart-2",
    //   claimName: "reports",

    //   subMenuItems: [
    //     {
    //       key: "reports-technicians-by-training-center",
    //       label: t(
    //         "side-bar:reports.technicians-by-training-center",
    //         "Technicians by Training Center"
    //       ),
    //       path: "/reports/technicians-by-training-center",
    //       claimName: "reports:certified-technicians-by-training-center",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-technicians-by-qualifications",
    //       label: t(
    //         "side-bar:reports.technicians-by-qualifications",
    //         "Technicians by Qualifications"
    //       ),
    //       path: "/reports/technicians-by-qualifications",
    //       claimName: "reports:certified-technicians-by-certification-category",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-technicians-by-entity",
    //       label: t(
    //         "side-bar:reports.technicians-by-entity",
    //         "Technicians by Entity"
    //       ),
    //       path: "/reports/technicians-by-entity",
    //       claimName: "reports:certified-technicians-by-entity",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-equipments-by-municipality",
    //       label: t(
    //         "side-bar:reports.equipments-by-municipality",
    //         "Equipment by Municipality"
    //       ),
    //       path: "/reports/equipments-by-municipality",
    //       claimName: "reports:kgh-equipment-by-municipalities",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-equipments-by-purpose",
    //       label: t(
    //         "side-bar:reports.equipments-by-purpose",
    //         "Equipment by Purpose"
    //       ),
    //       path: "/reports/equipments-by-purpose",
    //       claimName: "reports:kgh-equipment-by-purpose-and-use",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-equipments-by-cooling-system",
    //       label: t(
    //         "side-bar:reports.equipments-by-cooling-system",
    //         "Equipment by Cooling System"
    //       ),
    //       path: "/reports/equipments-by-cooling-system",
    //       claimName: "reports:kgh-equipment-by-cooling-medium",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-companies-by-entity",
    //       label: t("side-bar:reports.companies-by-entity", "Companies by Entity"),
    //       path: "/reports/companies-by-entity",
    //       claimName: "reports:kgh-service-companies-by-entity",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-refrigerants-by-entity",
    //       label: t(
    //         "side-bar:reports.refrigerants-by-entity",
    //         "Refrigerants by Entity"
    //       ),
    //       path: "/reports/refrigerants-by-entity",
    //       claimName: "reports:refrigerants-by-entity",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-service-companies",
    //       label: t(
    //         "side-bar:reports.service-companies",
    //         "Service Companies"
    //       ),
    //       path: "/reports/service-companies",
    //       claimName: "reports:kgh-service-companies",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-annual-report-service-technician",
    //       label: t(
    //         "side-bar:reports.annual-report-on-collected-substances",
    //         "Annual Report On Collected Substances"
    //       ),
    //       path: "/reports/annual-report-service-technician",
    //       claimName: "reports:annual-report-service-technician",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-mvteo-annual-report-service-technician",
    //       label: t(
    //         "side-bar:reports.mvteo-annual-report-on-collected-substances",
    //         "MVTEO Annual Report On Collected Substances"
    //       ),
    //       path: "/reports/mvteo-annual-report-service-technician",
    //       claimName: "reports:mvteo-annual-report-service-technician",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-annual-report-on-import-export-substances",
    //       label: t(
    //         "side-bar:reports.annual-report-import-export-of-ozone-depleting-substance",
    //         "Annual Report On Import/Export Of Ozone Depleting Substance"
    //       ),
    //       path: "/reports/annual-report-on-import-export-substances",
    //       claimName: "reports:annual-report-on-import-export-substances",
    //       checkOnlyPermission: true,
    //     },
    //     {
    //       key: "reports-mvteo-annual-report-on-import-export-substances",
    //       label: t(
    //         "side-bar:reports.mvteo-annual-report-import-export-of-ozone-depleting-substance",
    //         "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance"
    //       ),
    //       path: "/reports/mvteo-annual-report-on-import-export-substances",
    //       claimName: "reports:mvteo-annual-report-on-import-export-substances",
    //       checkOnlyPermission: true,
    //     },
    //   ],
    // },
    // logs: {
    //   key: "logs",
    //   label: t("side-bar:logs", "Logs"),
    //   path: "/logs",
    //   icon: "rewind",
    //   claimName: "logs",
    // },
    // notifications: {
    //   key: "notifications",
    //   label: t("side-bar:newsfeed", "Newsfeed"),
    //   path: "/newsfeed",
    //   icon: "bell",
    //   claimName: "notifications",
    // },
  };
};

export const getCurrentUserModules = (): string[] => {
  const claims = getClaims();
  const modules = claims.map((x) => x?.split(":")[0]);
  return [...new Set<string>(modules)];
};
