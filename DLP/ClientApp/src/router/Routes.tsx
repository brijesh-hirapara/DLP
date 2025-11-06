import { CodebookTypeEnum } from "api/models";
import ForgotPassword from "pages/authentication/ForgotPassword";
import ResetPasswordPage from "pages/authentication/ResetPasswordPage";
import SetNewPasswordPage from "pages/authentication/SetNewPasswordPage";
import SignIn from "pages/authentication/SignIn";
import NotFound from "pages/authorization/not-found/not-found";
import UnAuthorized from "pages/authorization/unAuthorized/unAuthorized";
import Branches from "pages/branches/BranchesPage";
import CreateTechnicianPage from "pages/certified-technicians/CreateTechnicianPage";
import TechniciansPage from "pages/certified-technicians/ListTechniciansPage";
import UpdateTechnicianPage from "pages/certified-technicians/UpdateTechnicianPage";
import ViewTechnicianDetails from "pages/certified-technicians/ViewTechnicianDetails";
import { CodebookCommonPage } from "pages/codebooks/CodebookCommonPage/CodebookCommonPage";
import { CantonsPage } from "pages/codebooks/cantons/CantonsPage";
import { EntitiesPage } from "pages/codebooks/entities/EntitiesPage";
import { MunicipalitiesPage } from "pages/codebooks/municipalities/MunicipalitiesPage";
import ComingSoon from "pages/coming-soon/ComingSoon";
import CreateEquipmentPage from "pages/equipments/CreateEquipmentPage";
import ListEquipmentsPage from "pages/equipments/ListEquipmentsPage";
import UpdateEquipmentPage from "pages/equipments/UpdateEquipmentPage";
import ViewEquipmentDetails from "pages/equipments/ViewEquipmentDetails";
import { InstitutionsPage } from "pages/institutions/InstitutionsPage";
import { VehicleFleetPage } from "pages/vehicle-fleet/vehicleFleetPage";
import EmailPage from "pages/localization/email/EmailPage";
import SystemLanguages from "pages/localization/system-languages/SystemLanguages";
import Translations from "pages/localization/translations/Translations";
import LogsPage from "pages/logs-audit/LogsPage";
import RefrigerantPage from "pages/refrigerants/RefrigerantsPage";
import ImporterExportersPage from "pages/registers/ImporterExporters/ImporterExportersPage";
import OwnerOperatorsPage from "pages/registers/OwnerOperators/OwnerOperatorsPage";
import ServiceCompaniesPage from "pages/registers/ServiceCompanies/ServiceCompaniesPage";
import { CreateInternalRequestPage } from "pages/requests/CreateInternalRequestPage";
import { RequestDetailsPage } from "pages/requests/RequestDetailsPage";
import { RequestsPage } from "pages/requests/RequestsPage";
import Settings from "pages/settings/Settings";
import UserGroupPage from "pages/user-groups/UserGroupPage";
import CompanyTechniciansPage from "pages/certified-technicians/CompanyTechniciansPage";
import CreateUserPage from "pages/users/CreateUserPage";
import UpdateUserPage from "pages/users/UpdateUserPage";
import UsersPage from "pages/users/UsersPage";
import { RouteProps } from "react-router-dom";
import { hasPermission } from "utility/accessibility/hasPermission";
import { RegisterDetailsPage } from "pages/registers/RegisterDetailsPage";
import MarkedEquipmentsPage from "pages/registers/MarkedEquipments/MarkedEquipmentsPage";
import NewsfeedPage from "pages/newsfeed/NewsfeedPage";
import TechniciansPageCenter from "pages/reports/TechniciansTrainingCenter";
import TechniciansByQualifications from "pages/reports/TechnicianByQualifications";
import TechniciansByEntity from "pages/reports/TechniciansByEntity";
import EquipmentsByMunicilipality from "pages/reports/EquipmentsByMunicipality";
import EquipmentsByPurpose from "pages/reports/EquipmentsByPurpose";
import EquipmentsByCoolingPurpose from "pages/reports/EquipmentsByCoolingSystem";
import CompaniesByEntity from "pages/reports/CompaniesByEntity";
import RefrigerantsByEntity from "pages/reports/RefrigerantsByEntity";
import ServiceCompaniesReport from "pages/reports/ServiceCompaniesReport";
import { Dashboard } from "pages/dashboard/Dashboard";
import { DatabaseConnections } from "pages/database-connections/DatabaseConnections";
import QuantitiesOfRefrigerants from "pages/reports/QuantitiesOfRefrigerants";
import ViewQuantitiesOfRefrigerant from "pages/quantities-of-refrigerants/ViewMVTEO";
import CreateQuantitiesOfRefrigerant from "pages/quantities-of-refrigerants/components/CreateQuantitiesOfRefrigerant";
import MVTEOReport from "pages/reports/MVTEOAnnualReportByServiceTechnician";
import PRILOGReport from "pages/reports/AnnualReportByServiceTechnician";
import ViewMVTEO from "pages/quantities-of-refrigerants/ViewMVTEO";
import PRILOGCreate from "pages/quantities-of-refrigerants/components/PRILOGCreateByServiceTechnician";
import MVTEOAnnualReportByServiceTechnician from "pages/reports/MVTEOAnnualReportByServiceTechnician";
import AnnualReportByServiceTechnician from "pages/reports/AnnualReportByServiceTechnician";
import AnnualReportOnImportExportSubstances from "pages/reports/AnnualReportOnImportExportSubstances";
import MVTEOAnnualReportOnImportExportSubstances from "pages/reports/MVTEOAnnualReportOnImportExportSubstances";
import PRILOGCreateByServiceTechnician from "pages/quantities-of-refrigerants/components/PRILOGCreateByServiceTechnician";
import PRILOGCreateImportExportSubstances from "pages/quantities-of-refrigerants/components/PRILOGCreateImportExportSubstances";
import ViewMVTEOAnnualReportByServiceTechnician from "pages/quantities-of-refrigerants/components/ViewMVTEOAnnualReportByServiceTechnician";
import ViewMVTEOImportExportSubstances from "pages/quantities-of-refrigerants/components/ViewMVTEOImportExportSubstances";
import ListMyRequestPage from "pages/myRequest/ListMyRequestPage";
import { AddVehicleFleet } from "pages/vehicle-fleet/createVehicleFleetPage";
import RequestWizzard from "pages/myRequest/newRequest/RequestWizzard";
import ActiveRequestsPage from "pages/transport-requests/ActiveRequestsPage";
// import SubmitOfferPage from "pages/transport-requests/OfferSubmitPage";
import { SubmitOfferPage } from "pages/transport-requests/OfferSubmitPage";
import ArchivedRequestsPage from "pages/transport-requests/ArchivedRequestsPage";
import ListMyShipmentsPage from "pages/myShipments/ListMyShipmentsPage";
import MyOrdersPage from "pages/myOrders/MyOrdersPage";
import { CarrierVehicleFleetPage } from "pages/vehicle-fleet/CarrierVehicleFleetPage";
import ListChooseOfferPage from "pages/myRequest/choose-offer/ListChooseOfferPage";
import ListMyTemplatesPage from "pages/myRequest/newRequest/myTemplates/ListMyTemplatesPage";
import { ManageTransportRequestsPage } from "pages/manage-transport-reuqests/ManageTransportRequestsPage";
import { VehicleFleetDetailsPage } from "pages/vehicle-fleet/VehicleFleetDetailsPage";
import ManageTransportOffers from "pages/manage-transport-reuqests/ManageTransportOffers";
import ShipmentsPage from "pages/shipments/ShipmentsPage";
import ViewShipmentsDetails from "pages/myShipments/ViewShipmentsDetails";
import { InvitedCarriersListPage } from "pages/manage-transport-reuqests/InvitedCarriersListPage";

export type CustomRouteProps = {
  hasAccess: () => boolean;
} & RouteProps;

export const MainRoutes: CustomRouteProps[] = [
  {
    path: "/",
    element: <Dashboard />,
    hasAccess: () => hasPermission("dashboard:view"),
  } , {
    index: true,
    path: "*",
    element: <NewsfeedPage /> ,
    hasAccess: () => true,
  } ,
  {
    path: "/newsfeed",
    element: <NewsfeedPage />,
    hasAccess: () => true,
  },
  {
    index: false,
    path: "/languages",
    element: <SystemLanguages />,
    hasAccess: () => hasPermission("languages:list"),
  },
  {
    index: true,
    path: "/company-technicians/:id",
    element: <ViewTechnicianDetails />,
    hasAccess: () => hasPermission("company-technicians:view-details"),
  },
  {
    path: "/company-technicians",
    element: <CompanyTechniciansPage />,
    hasAccess: () => hasPermission("company-technicians:list"),
  },
  {
    index: true,
    path: "/users/:id/edit",
    element: <UpdateUserPage />,
    hasAccess: () => hasPermission("users:add"),
  },
  {
    index: false,
    path: "/users/create",
    element: <CreateUserPage />,
    hasAccess: () => hasPermission("users:add"),
  },
  {
    index: false,
    path: "/users",
    element: <UsersPage />,
    hasAccess: () => hasPermission("users:list"),
  },
  {
    index: false,
    path: "/database-connections",
    element: <DatabaseConnections />,
    hasAccess: () => hasPermission("users:list"),
  },
  {
    index: true,
    path: "/equipments/:id",
    element: <ViewEquipmentDetails />,
    hasAccess: () => hasPermission("equipments:view-details"), // to be updated
  },
  {
    index: true,
    path: "/my-requests",
    element: <ListMyRequestPage />,
    hasAccess: () => hasPermission("my-requests:list"),
  },
  {
    index: true,
    path: "/my-requests/:id/choose-offer",
    element: <ListChooseOfferPage />,
    hasAccess: () => hasPermission("choose-offer:list"),
  },
  {
    index: true,
    path: "/my-requests/new-transport-request",
    element: <RequestWizzard viewKey=""/>,
    hasAccess: () => hasPermission("new-transport-request:add"),
  },
  {
    index: true,
    path: "/my-requests/:id",
    element: <RequestWizzard viewKey="view"/>,
    hasAccess: () => hasPermission("new-transport-request:add"),
  },
  {
    index: true,
    path: "/my-requests/new-transport-request/:id",
    element: <RequestWizzard viewKey=""/>,
    hasAccess: () => hasPermission("new-transport-request:add"),
  },
  {
    index: true,
    path: "/my-requests/new-transport-request-template/:id",
    element: <RequestWizzard viewKey="TemplateEdit"/>,
    hasAccess: () => hasPermission("new-transport-request:add"),
  },
  {
    index: true,
    path: "/my-requests/new-transport-request/my-templates",
    element: <ListMyTemplatesPage />,
    hasAccess: () => hasPermission("my-templates:list"),
  },
  {
    index: true,
    path: "/my-shipments",
    element: <ListMyShipmentsPage />,
    hasAccess: () => hasPermission("my-shipments:list"),
  },
  {
    path: "/my-shipment/:id",
    element: <ViewShipmentsDetails />,
    hasAccess: () => hasPermission("my-shipments:view-details"),
  },
  {
    index: true,
    path: "/shipments",
    element: <ShipmentsPage />,
    hasAccess: () => hasPermission("shipments:list"),
  },
  {
    index: true,
    path: "/equipments/:id/edit",
    element: <UpdateEquipmentPage />,
    hasAccess: () => hasPermission("equipments:edit"), // to be updated
  },
  {
    index: true,
    path: "/equipments",
    element: <ListEquipmentsPage />,
    hasAccess: () => hasPermission("equipments:list"), // to be updated
  },
  {
    index: true,
    path: "/equipments/create",
    element: <CreateEquipmentPage />,
    hasAccess: () => hasPermission("equipments:add"), // to be updated
  },
  {
    index: true,
    path: "/registers/certified-technicians/:id",
    element: <ViewTechnicianDetails />,
    hasAccess: () =>
      hasPermission("registers:view-details-of-certified-technicians"),
  },
  {
    index: true,
    path: "/registers/certified-technicians/:id/edit",
    element: <UpdateTechnicianPage />,
    hasAccess: () => hasPermission("registers:edit-certified-technicians"),
  },
  {
    index: false,
    path: "/registers/certified-technicians",
    element: <TechniciansPage />,
    hasAccess: () => hasPermission("registers:list-of-certified-technicians"),
  },
  {
    index: false,
    path: "/registers/certified-technicians/create",
    element: <CreateTechnicianPage />,
    hasAccess: () => hasPermission("registers:add-certified-technicians"),
  },
  {
    path: "/registers/owners-operators-of-kgh-equipment",
    element: <OwnerOperatorsPage />,
    hasAccess: () =>
      hasPermission("registers:list-of-owners-and-operators-of-kgh-equipment"),
  },
  {
    path: "/registers/owners-operators-of-kgh-equipment/:id",
    element: (
      <RegisterDetailsPage
        isOwnerAndOperator={true}
        key={"owners-operators-of-kgh-equipment"}
      />
    ),
    hasAccess: () =>
      hasPermission(
        "registers:view-details-of-owners-and-operators-of-kgh-equipment"
      ),
  },
  {
    path: "/registers/kgh-service-companies",
    element: <ServiceCompaniesPage />,
    hasAccess: () => hasPermission("registers:list-of-kgh-companies"),
  },
  {
    path: "/registers/kgh-service-companies/:id",
    element: (
      <RegisterDetailsPage isKghService={true} key={"kgh-service-companies"} />
    ),
    hasAccess: () => hasPermission("registers:view-details-of-kgh-companies"),
  },
  {
    path: "/registers/importers",
    element: <ImporterExportersPage />,
    hasAccess: () => hasPermission("registers:list-of-importers"),
  },
  {
    path: "/registers/importers/:id",
    element: <RegisterDetailsPage isImporterExporter={true} />,
    hasAccess: () => hasPermission("registers:list-of-importers"),
  },
  {
    path: "/registers/marked-equipment",
    element: <MarkedEquipmentsPage />,
    hasAccess: () => hasPermission("registers:list-of-marked-equipment"),
  },
  {
    index: false,
    path: "/user-groups",
    element: <UserGroupPage />,
    hasAccess: () => hasPermission("user-groups:list"),
  },
  {
    index: false,
    path: "/logs",
    element: <LogsPage />,
    hasAccess: () => hasPermission("logs:list"),
  },
  {
    index: false,
    path: "/unauthorized",
    element: <UnAuthorized />,
    hasAccess: () => true,
  },
  {
    index: false,
    path: "/profile",
    element: <Settings />,
    hasAccess: () => hasPermission("profile:view"),
  },
  {
    index: false,
    path: "/branches",
    element: <Branches />,
    hasAccess: () => true,
  },
  {
    path: "/translations",
    element: <Translations />,
    hasAccess: () => hasPermission("translations:list"),
  },
  {
    path: "/type-of-trailers",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.TypeOfTrailers} />
    ),
    hasAccess: () => hasPermission("type-of-trailers:list"),
  },
  // {
  //   path: "/refrigeration-systems",
  //   element: <RefrigerantPage />,
  //   hasAccess: () => hasPermission("refrigeration-systems:list"),
  // },
  {
    path: "/countries",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.Countries} />
    ),
    hasAccess: () => hasPermission("countries:list"),
  },
  {
    path: "/operating-countries",
    element: (
      <CodebookCommonPage
        codebookType={CodebookTypeEnum.OperatingCountries}
      />
    ),
    hasAccess: () => hasPermission("operating-countries:list"),
  },
  {
    path: "/cemt-permits",
    element: (
      <CodebookCommonPage
        codebookType={CodebookTypeEnum.CemtPermits}
      />
    ),
    hasAccess: () => hasPermission("cemt-permits:list"),
  },
  {
    path: "/licenses",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.Licenses} />
    ),
    hasAccess: () => hasPermission("licenses:list"),
  },
  {
    path: "/goods-type",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.GoodsType} />
    ),
    hasAccess: () => hasPermission("goods-type:list"),
  },
  {
    path: "/certificates",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.Certificates} />
    ),
    hasAccess: () => hasPermission("certificates:list"),
  },
  {
    path: "/vehicle-requirements",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.VehicleRequirements} />
    ),
    hasAccess: () => hasPermission("vehicle-requirements:list"),
  },
  {
    path: "/currency",
    element: (
      <CodebookCommonPage codebookType={CodebookTypeEnum.Currency} />
    ),
    hasAccess: () => hasPermission("currency:list"),
  },
  {
    path: "/entities",
    element: <EntitiesPage />,
    hasAccess: () => hasPermission("entities:list"),
  },
  {
    path: "/municipalities",
    element: <MunicipalitiesPage />,
    hasAccess: () => hasPermission("municipalities:list"),
  },
  {
    path: "/cantons",
    element: <CantonsPage />,
    hasAccess: () => hasPermission("cantons:list"),
  },
  {
    path: "/email",
    element: <EmailPage />,
    hasAccess: () => hasPermission("email-options:add"),
  },
  {
    path: "/companies",
    element: <InstitutionsPage />,
    hasAccess: () => hasPermission("manage-companies:list"),
  },
  {
    path: "/vehicle-fleet",
    element: <VehicleFleetPage />,
    hasAccess: () => hasPermission("vehical-fleet:list"),
  },
  {
    path: "/vehicle-fleet/:id",
    element: <VehicleFleetDetailsPage viewKey="view"/>,
    hasAccess: () => hasPermission("vehical-fleet:view"),
  },
  {
    path: "/vehicle-fleet/:id/edit",
    element: <AddVehicleFleet viewKey="edit"/>,
    hasAccess: () => hasPermission("vehical-fleet:edit"),
  },
  {
    path: "/vehicle-fleet-request",
    element: <CarrierVehicleFleetPage key={"vehicle-fleet-request"}/>,
    hasAccess: () => true,
  },
  {
    path: "/active-vehicle-fleet",
    element: <CarrierVehicleFleetPage key={"active-vehicle-fleet"}/>,
    // hasAccess: () => hasPermission("requests:list-archived"),
    hasAccess: () => true,
  },
  { 
    path:"/vehicle-fleet/create",
    element: <AddVehicleFleet key={"add"}/>,
    hasAccess: () => true,
  },
  { 
    path:"/manage-transport-requests",
    element: <ManageTransportRequestsPage />,
    hasAccess: () => hasPermission("manage-transport-requests:list"),
  },
  // { 
  //   path:"/manage-transport-offers",
  //   element: <ManageTransportOffers />,
  //   hasAccess: () => hasPermission("manage-transport-offers:list"),
  // },
  { 
    path:"/manage-transport-requests/invited-carriers/:transportRequestId",
    element: <InvitedCarriersListPage />,
    hasAccess: () => true,
  },

  { 
    path:"/manage-transport-requests/manage-transport-offers/:id",
    element: <ManageTransportOffers />,
    hasAccess: () => hasPermission("manage-transport-offers:list"),
  },

  // {
  //   path: "/active-requests",
  //   element: <SubmitOfferPage />,
  //   hasAccess: () => true,
  // },
  {
    path: "/my-orders",
    element: <MyOrdersPage />,
    hasAccess: () => hasPermission("my-orders:list"),
  },
  {
    path: "/active-requests",
    element: <SubmitOfferPage />,
    hasAccess: () => hasPermission("transport-active-requests:list"),
  },
  {
    path: "/archived-requests",
    element: <ArchivedRequestsPage/>,
    hasAccess: () => hasPermission("transport-archived-requests:list"),
  },
  {
    path: "/requests",
    element: <RequestsPage key={"requests"} />,
    hasAccess: () => hasPermission("requests:list"),
  },
  {
    path: "/requests/:id",
    element: <RequestDetailsPage />,
    hasAccess: () => hasPermission("requests:view-details"),
  },
  {
    path: "/requests/create/:type",
    element: <CreateInternalRequestPage />,
    hasAccess: () => {
      return (
        hasPermission(
          "requests:request-for-adding-owners-and-operators-of-kgh-equipment"
        ) ||
        hasPermission(
          "requests:request-for-adding-and-licensing-of-kgh-companies"
        ) ||
        hasPermission(
          "requests:request-for-extending-license-of-kgh-companies"
        ) ||
        hasPermission(
          "requests:request-for-adding-importers-exporters-of-kgh-equipment"
        )
      );
    },
  },
  {
    path: "/archived-request",
    element: <RequestsPage key={"archived-requests"} />,
    hasAccess: () => hasPermission("requests:list-archived"),
  },

  // reports
  {
    index: false,
    path: "/reports/technicians-by-training-center",
    element: <TechniciansPageCenter />,
    hasAccess: () =>
      hasPermission("reports:certified-technicians-by-training-center"),
  },
  {
    index: false,
    path: "/reports/technicians-by-qualifications",
    element: <TechniciansByQualifications />,
    hasAccess: () =>
      hasPermission("reports:certified-technicians-by-certification-category"),
  },
  {
    index: false,
    path: "/reports/technicians-by-entity",
    element: <TechniciansByEntity />,
    hasAccess: () => 
    hasPermission("reports:certified-technicians-by-entity"),
  },
  {
    index: false,
    path: "/reports/equipments-by-municipality",
    element: <EquipmentsByMunicilipality />,
    hasAccess: () => 
    hasPermission("reports:kgh-equipment-by-municipalities"),
  },
  {
    index: false,
    path: "/reports/equipments-by-purpose",
    element: <EquipmentsByPurpose />,
    hasAccess: () => 
    hasPermission("reports:kgh-equipment-by-purpose-and-use"),
  },
  {
    index: false,
    path: "/reports/equipments-by-cooling-system",
    element: <EquipmentsByCoolingPurpose />,
    hasAccess: () => 
    hasPermission("reports:kgh-equipment-by-cooling-medium"),
  },
  {
    index: false,
    path: "/reports/companies-by-entity",
    element: <CompaniesByEntity />,
    hasAccess: () => 
    hasPermission("reports:kgh-service-companies-by-entity"),
  },
  {
    index: false,
    path: "/reports/refrigerants-by-entity",
    element: <RefrigerantsByEntity />,
    hasAccess: () => 
    hasPermission("reports:refrigerants-by-entity"),
  },
  {
    index: false,
    path: "/reports/service-companies",
    element: <ServiceCompaniesReport />,
    hasAccess: () => 
    hasPermission("reports:kgh-service-companies"),
  },

    {
        index: false,
        path: "/reports/mvteo-annual-report-service-technician",
        element: <MVTEOAnnualReportByServiceTechnician />,
        hasAccess: () =>
            hasPermission("reports:mvteo-annual-report-service-technician"),
    },
    {
        index: false,
        path: "/reports/mvteo/:id",
        element: <ViewMVTEO />,
        hasAccess: () =>
            hasPermission("mvteo:view-details"),
    },
    {
        index: false,
        path: "/reports/annual-report-service-technician",
        element: <AnnualReportByServiceTechnician />,
        hasAccess: () =>
            hasPermission("reports:annual-report-service-technician"),
    },
    {
        index: false,
        path: "/reports/create-report-by-service-technician",
        element: <PRILOGCreateByServiceTechnician />,
        hasAccess: () =>
            hasPermission("create-report-by-service-technician:add"),
    },
    {
        index: false,
        path: "/reports/edit-report-by-service-technician/:id",
        element: <PRILOGCreateByServiceTechnician />,
        hasAccess: () =>
            hasPermission("create-report-by-service-technician:add"),
    },
    {
        index: false,
        path: "/reports/view-mvteo-report-by-service-technician/:id",
        element: <ViewMVTEOAnnualReportByServiceTechnician />,
        hasAccess: () =>
            hasPermission("view-mvteo-report-by-service-technician:view"),
    },
    {
        index: false,
        path: "/reports/annual-report-on-import-export-substances",
        element: <AnnualReportOnImportExportSubstances />,
        hasAccess: () =>
            hasPermission("reports:annual-report-on-import-export-substances"),
    },
    {
        index: false,
        path: "/reports/mvteo-annual-report-on-import-export-substances",
        element: <MVTEOAnnualReportOnImportExportSubstances />,
        hasAccess: () =>
            hasPermission("reports:mvteo-annual-report-on-import-export-substances"),
    },
    {
        index: false,
        path: "/reports/create-import-export-substance",
        element: <PRILOGCreateImportExportSubstances />,
        hasAccess: () =>
            hasPermission("prelog-import-export-substance:add"),
    },
    {
        index: false,
        path: "/reports/edit-import-export-substance/:id",
        element: <PRILOGCreateImportExportSubstances />,
        hasAccess: () =>
            hasPermission("prelog-import-export-substance:add"),
    },

    {
        index: false,
        path: "/reports/view-mvteo-report-by-import-export-substance/:id",
        element: <ViewMVTEOImportExportSubstances />,
        hasAccess: () =>
            hasPermission("view-mvteo-report-by-import-export-substance:view"),
    },

  /////
  {
    index: false,
    path: "*",
    element: <NotFound />,
    hasAccess: () => true,
  },
];

export const AuthRoutes: RouteProps[] = [
  {
    index: false,
    path: "/login",
    element: <SignIn />,
  },
  {
    index: false,
    path: "/set-new-password",
    element: <SetNewPasswordPage />,
  },
  {
    index: false,
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    index: false,
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
];

// * Import Lazy loading component, but it's not working :)
// const LogsPage = lazy(() => import('pages/logs-audit/LogsPage'));
// const NotFound = lazy(() => import('pages/authorization/not-found/not-found'));
// const UnAuthorized = lazy(() => import('pages/authorization/unAuthorized/unAuthorized'));
// const ComingSoon = lazy(() => import('pages/coming-soon/ComingSoon'));
// const SystemLanguages = lazy(() => import('pages/localization/system-languages/SystemLanguages'));
// const Translations = lazy(() => import('pages/localization/translations/Translations'));
// const SignIn = lazy(() => import('container/profile/authentication/overview/SignIn'));
// const UsersPage = lazy(() => import('pages/users/UsersPage'));
// const CreateUserPage = lazy(() => import('pages/users/CreateUserPage'));
// const EmailPage = lazy(() => import('pages/localization/email/EmailPage'));
// const UserGroupPage = lazy(() => import("pages/user-groups/UserGroupPage"));
