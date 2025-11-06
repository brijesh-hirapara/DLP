using DLP.Domain.Entities;
using System.Reflection;
using System.Text.RegularExpressions;

namespace DLP.Application.Common.Auth;

public class Policy
{
    public string Name { get; }
    public string Description { get; }

    public Policy(string name, string description)
    {
        Name = name;
        Description = description;
    }
}

public static class CustomPolicies
{
    public static class Dashboard
    {
        public static readonly Policy List = new("dashboard:view", "Can view Dashboard");
    }

    // Users Module
    public static class Users
    {
        public static readonly Policy List = new("users:list", "List Users");
        public static readonly Policy Search = new("users:search", "Search Users");
        public static readonly Policy AddNew = new("users:add", "Add New User");
        public static readonly Policy Edit = new("users:edit", "Edit User");
        public static readonly Policy Deactivate = new("users:deactivate", "Deactivate User");
        public static readonly Policy ResendConfirmationEmail = new("users:resend-confirmation-mails", "Resend Confirmation Emails");
        public static readonly Policy ListDeactivated = new("users:list-deactivated", "List Deactivated Users");
        public static readonly Policy Activate = new("users:activate", "Activate User");
        public static readonly Policy Delete = new("users:delete", "Delete User");
    }

    //Company Certified Technicians
    //public static class CompanyTechnicians
    //{
    //    public static readonly Policy List = new("company-technicians:list", "List Certified Technicians");
    //    public static readonly Policy ViewDetails = new("company-technicians:view-details", "View Certified Technician Details");
    //    public static readonly Policy Add = new("company-technicians:add", "Add Certified Technician");
    //    public static readonly Policy Edit = new("company-technicians:edit", "Edit Certified Technician");
    //    public static readonly Policy Delete = new("company-technicians:delete", "Delete Certified Technician");
    //}

    // User Groups Module
    public static class UserGroups
    {
        public static readonly Policy AddUser = new("user-groups:add-user", "Add User to Group");
        public static readonly Policy RemoveUser = new("user-groups:remove-user", "Remove User from Group");
        public static readonly Policy List = new("user-groups:list", "List User Groups");
        public static readonly Policy Search = new("user-groups:search", "Search User Groups");
        public static readonly Policy AddNew = new("user-groups:add", "Add New User Group");
        public static readonly Policy Edit = new("user-groups:edit", "Edit User Group");
        public static readonly Policy Deactivate = new("user-groups:deactivate", "Deactivate User Group");
        public static readonly Policy ListDeactivated = new("user-groups:list-deactivated", "List Deactivated User Groups");
        public static readonly Policy Activate = new("user-groups:activate", "Activate User Group");
    }

    // Institutions Module
    //public static class Institutions
    //{
    //    public static readonly Policy List = new("institutions:list", "List Institutions");
    //    public static readonly Policy ViewDetails = new("institutions:view-details", "View Institution Details");
    //    public static readonly Policy Add = new("institutions:add", "Add Institution");
    //    public static readonly Policy Edit = new("institutions:edit", "Edit Institution");
    //    public static readonly Policy Delete = new("institutions:delete", "Delete Institution");
    //}

    // Manage companies
    public static class ManageCompanies
    {
        public static readonly Policy List = new("manage-companies:list", "List Manage Companies");
        public static readonly Policy ViewDetails = new("manage-companies:view-details", "View Manage Company Details");
        public static readonly Policy Add = new("manage-companies:add", "Add Manage Company");
        public static readonly Policy Edit = new("manage-companies:edit", "Edit Manage Company");
        public static readonly Policy Delete = new("manage-companies:delete", "Delete Manage Company");
    }

    public static class CarrierVehicalFleet
    {
        public static readonly Policy RequestList = new("carrier-vehical-fleet-request:list", "List Vehicle Fleets Request");
        public static readonly Policy RequestViewDetails = new("carrier-vehical-fleet-request:view-details", "View Vehicle Fleet Request Details");
        public static readonly Policy RequestEdit = new("carrier-vehical-fleet-request:edit", "Edit Vehicle Fleet Request");
        public static readonly Policy Approve = new("carrier-vehical-fleet-request:approve", "Approve Requests");
        public static readonly Policy Reject = new("carrier-vehical-fleet-request:reject", "Reject Requests");
        public static readonly Policy ActiveRequestList = new("carrier-active-vehical-fleet-request:list", "List Active Vehicle Fleets Request");
        public static readonly Policy ActiveRequestViewDetails = new("carrier-active-vehical-fleet-request:view-details", "View Active Vehicle Fleet Request Details");
        public static readonly Policy ActiveRequestEdit = new("carrier-active-vehical-fleet-request:edit", "Edit Active Vehicle Fleet Request");
    }

    public static class VehicalFleet
    {
        public static readonly Policy List = new("vehical-fleet:list", "Carrier - List Vehicle Fleets");
        public static readonly Policy ViewDetails = new("vehical-fleet:view-details", "Carrier - View Vehicle Fleet Details");
        public static readonly Policy Add = new("vehical-fleet:add", "Carrier - Add Vehicle Fleet");
        public static readonly Policy Edit = new("vehical-fleet:edit", "Carrier - Edit Vehicle Fleet");
    }

    // Transport Requests
    public static class TransportRequests
    {
        public static readonly Policy ActiveRequestList = new("transport-active-requests:list", "Carrier - List Transport Requests");
        public static readonly Policy ActiveRequestAdd = new("transport-active-requests:add", "Carrier - Add Transport Requests");
        public static readonly Policy ArchivedRequestsList = new("transport-archived-requests:list", "Carrier - List Archived Requests");
        public static readonly Policy ArchivedRequestsViewDetails = new("transport-archived-requests:view-details", "Carrier - View Archived Requests Details");
    }

    // My Orders
    public static class MyOrders
    {
        public static readonly Policy List = new("my-orders:list", "Carrier - List My Orders");
        public static readonly Policy ViewDetails = new("my-orders:view-details", "Carrier - View My Orders Details");
    }

    // Shipments
    public static class Shipments
    {
        public static readonly Policy List = new("shipments:list", "Shipments");
    }


    // Branches Module
    public static class Branches
    {
        public static readonly Policy List = new("branches:list", "List Branches");
        public static readonly Policy ViewDetails = new("branches:view-details", "View Branch Details");
        public static readonly Policy Add = new("branches:add", "Add Branch");
        public static readonly Policy Edit = new("branches:edit", "Edit Branch");
        public static readonly Policy Delete = new("branches:delete", "Delete Branch");
    }

    // Codebooks Module
    public static class Codebooks
    {
        //public static readonly Policy TypeOfEquipments = new("type-of-equipments:list", "List Types of Equipments");
        //public static readonly Policy TypeOfEquipmentsViewDetails = new("type-of-equipments:view-details", "View Type of Equipment");
        //public static readonly Policy TypeOfEquipmentsAdd = new("type-of-equipments:add", "Add Type of Equipment");
        //public static readonly Policy TypeOfEquipmentsEdit = new("type-of-equipments:edit", "Edit Type of Equipment");
        //public static readonly Policy TypeOfEquipmentsDelete = new("type-of-equipments:delete", "Delete Type of Equipment");

        //public static readonly Policy RefrigirationSystems = new("refrigeration-systems:list", "List Refrigeration Systems");
        //public static readonly Policy RefrigirationSystemsViewDetails = new("refrigeration-systems:view-details", "View Refrigeration System Details");
        //public static readonly Policy RefrigirationSystemsAdd = new("refrigeration-systems:add", "Add Refrigeration System");
        //public static readonly Policy RefrigirationSystemsEdit = new("refrigeration-systems:edit", "Edit Refrigeration System");
        //public static readonly Policy RefrigirationSystemsDelete = new("refrigeration-systems:delete", "Delete Refrigeration System");

        //public static readonly Policy EquipmentPurposes = new("equipment-purposes:list", "List Equipment Purposes");
        //public static readonly Policy EquipmentPurposesViewDetails = new("equipment-purposes:view-details", "View Equipment Purpose Details");
        //public static readonly Policy EquipmentPurposesAdd = new("equipment-purposes:add", "Add Equipment Purpose");
        //public static readonly Policy EquipmentPurposesEdit = new("equipment-purposes:edit", "Edit Equipment Purpose");
        //public static readonly Policy EquipmentPurposesDelete = new("equipment-purposes:delete", "Delete Equipment Purpose");

        //public static readonly Policy TypeOfEquipmentModification = new("type-of-equipment-modification:list", "List Types of Equipment Modification");
        //public static readonly Policy TypeOfEquipmentModificationViewDetails = new("type-of-equipment-modification:view-details", "View Type of Equipment Modification");
        //public static readonly Policy TypeOfEquipmentModificationAdd = new("type-of-equipment-modification:add", "Add Type of Equipment Modification");
        //public static readonly Policy TypeOfEquipmentModificationEdit = new("type-of-equipment-modification:edit", "Edit Type of Equipment Modification");
        //public static readonly Policy TypeOfEquipmentModificationDelete = new("type-of-equipment-modification:delete", "Delete Type of Equipment Modification");

        //public static readonly Policy TypeOfQualifications = new("type-of-qualifications:list", "List Types of Qualifications");
        //public static readonly Policy TypeOfQualificationsViewDetails = new("type-of-qualifications:view-details", "View Type of Qualifications");
        //public static readonly Policy TypeOfQualificationsAdd = new("type-of-qualifications:add", "Add Type of Qualifications");
        //public static readonly Policy TypeOfQualificationsEdit = new("type-of-qualifications:edit", "Edit Type of Qualifications");
        //public static readonly Policy TypeOfQualificationsDelete = new("type-of-qualifications:delete", "Delete Type of Qualifications");


        //public static readonly Policy TypeOfCoolingSystems = new("type-of-cooling-systems:list", "List Types of Cooling Systems");
        //public static readonly Policy TypeOfCoolingSystemsDelete = new("type-of-cooling-systems:delete", "Delete Type of Cooling Systems");
        //public static readonly Policy TypeOfCoolingSystemsEdit = new("type-of-cooling-systems:edit", "Edit Type of Cooling Systems");
        //public static readonly Policy TypeOfCoolingSystemsAdd = new("type-of-cooling-systems:add", "Add Type of Cooling Systems");
        //public static readonly Policy TypeOfCoolingSystemsViewDetails = new("type-of-cooling-systems:view-details", "View Type of Cooling Systems");


        //public static readonly Policy TypeOfStateOfSubstance = new("type-of-state-of-substance:list", "List Types of State Of Substance");
        //public static readonly Policy TypeOfStateOfSubstanceDelete = new("type-of-state-of-substance:delete", "Delete Types of State Of Substance");
        //public static readonly Policy TypeOfStateOfSubstanceEdit = new("type-of-state-of-substance:edit", "Edit Types of State Of Substance");
        //public static readonly Policy TypeOfStateOfSubstanceAdd = new("type-of-state-of-substance:add", "Add Types of State Of Substance");
        //public static readonly Policy TypeOfStateOfSubstanceViewDetails = new("type-of-state-of-substance:view-details", "View Types of State Of Substance");

        //public static readonly Policy Municipalities = new("municipalities:list", "List Municipalities");
        //public static readonly Policy MunicipalitiesViewDetails = new("municipalities:view-details", "View Municipality Details");
        //public static readonly Policy MunicipalitiesAdd = new("municipalities:add", "Add Municipality");
        //public static readonly Policy MunicipalitiesEdit = new("municipalities:edit", "Edit Municipality");
        //public static readonly Policy MunicipalitiesDelete = new("municipalities:delete", "Delete Municipality");

        //public static readonly Policy Cantons = new("cantons:list", "List Cantons");
        //public static readonly Policy CantonsViewDetails = new("cantons:view-details", "View Canton Details");
        //public static readonly Policy CantonsAdd = new("cantons:add", "Add Canton");
        //public static readonly Policy CantonsEdit = new("cantons:edit", "Edit Canton");
        //public static readonly Policy CantonsDelete = new("cantons:delete", "Delete Canton");

        //public static readonly Policy Entities = new("entities:list", "List Entities");
        //public static readonly Policy EntitiesViewDetails = new("entities:view-details", "View Entity Details");
        //public static readonly Policy EntitiesAdd = new("entities:add", "Add Entity");
        //public static readonly Policy EntitiesEdit = new("entities:edit", "Edit Entity");
        //public static readonly Policy EntitiesDelete = new("entities:delete", "Delete Entity");


        //public static readonly Policy BusinessActivitiesList = new("business-activities:list", "List Business Activities");
        //public static readonly Policy BusinessActivitiesDetails = new("business-activities:view-details", "View Business Activity Details");
        //public static readonly Policy BusinessActivitiesAdd = new("business-activities:add", "Add Business Activity");
        //public static readonly Policy BusinessActivitiesEdit = new("business-activities:edit", "Edit Business Activity");
        //public static readonly Policy BusinessActivitiesDelete = new("business-activities:delete", "Delete Business Activity");

        // TrailerType
        public static readonly Policy TypeOfTrailers = new("type-of-trailers:list", "List Type of Trailers");
        public static readonly Policy TypeOfTrailersViewDetails = new("type-of-trailers:view-details", "View Type of Trailer");
        public static readonly Policy TypeOfTrailersAdd = new("type-of-trailers:add", "Add Type of Trailer");
        public static readonly Policy TypeOfTrailersEdit = new("type-of-trailers:edit", "Edit Type of Trailer");
        public static readonly Policy TypeOfTrailersDelete = new("type-of-trailers:delete", "Delete Type of Trailer");

        // Country
        public static readonly Policy Countries = new("countries:list", "List Countries");
        public static readonly Policy CountriesViewDetails = new("countries:view-details", "View Country");
        public static readonly Policy CountriesAdd = new("countries:add", "Add Country");
        public static readonly Policy CountriesEdit = new("countries:edit", "Edit Country");
        public static readonly Policy CountriesDelete = new("countries:delete", "Delete Country");

        // OperatingCountry
        public static readonly Policy OperatingCountries = new("operating-countries:list", "List Operating Countries");
        public static readonly Policy OperatingCountriesViewDetails = new("operating-countries:view-details", "View Operating Country");
        public static readonly Policy OperatingCountriesAdd = new("operating-countries:add", "Add Operating Country");
        public static readonly Policy OperatingCountriesEdit = new("operating-countries:edit", "Edit Operating Country");
        public static readonly Policy OperatingCountriesDelete = new("operating-countries:delete", "Delete Operating Country");

        // CemtPermit
        public static readonly Policy CemtPermits = new("cemt-permits:list", "List CEMT Permits");
        public static readonly Policy CemtPermitsViewDetails = new("cemt-permits:view-details", "View CEMT Permit");
        public static readonly Policy CemtPermitsAdd = new("cemt-permits:add", "Add CEMT Permit");
        public static readonly Policy CemtPermitsEdit = new("cemt-permits:edit", "Edit CEMT Permit");
        public static readonly Policy CemtPermitsDelete = new("cemt-permits:delete", "Delete CEMT Permit");

        // Certificate
        public static readonly Policy Certificates = new("certificates:list", "List Certificates");
        public static readonly Policy CertificatesViewDetails = new("certificates:view-details", "View Certificate");
        public static readonly Policy CertificatesAdd = new("certificates:add", "Add Certificate");
        public static readonly Policy CertificatesEdit = new("certificates:edit", "Edit Certificate");
        public static readonly Policy CertificatesDelete = new("certificates:delete", "Delete Certificate");

        // License
        public static readonly Policy Licenses = new("licenses:list", "List Licenses");
        public static readonly Policy LicensesViewDetails = new("licenses:view-details", "View License");
        public static readonly Policy LicensesAdd = new("licenses:add", "Add License");
        public static readonly Policy LicensesEdit = new("licenses:edit", "Edit License");
        public static readonly Policy LicensesDelete = new("licenses:delete", "Delete License");

        // GoodsType
        public static readonly Policy GoodsType = new("goods-type:list", "List Goods Types");
        public static readonly Policy GoodsTypeViewDetails = new("goods-type:view-details", "View Goods Type");
        public static readonly Policy GoodsTypeAdd = new("goods-type:add", "Add Goods Type");
        public static readonly Policy GoodsTypeEdit = new("goods-type:edit", "Edit Goods Type");
        public static readonly Policy GoodsTypeDelete = new("goods-type:delete", "Delete Goods Type");

        // VehicleRequirement
        public static readonly Policy VehicleRequirements = new("vehicle-requirements:list", "List Vehicle Requirements");
        public static readonly Policy VehicleRequirementsViewDetails = new("vehicle-requirements:view-details", "View Vehicle Requirement");
        public static readonly Policy VehicleRequirementsAdd = new("vehicle-requirements:add", "Add Vehicle Requirement");
        public static readonly Policy VehicleRequirementsEdit = new("vehicle-requirements:edit", "Edit Vehicle Requirement");
        public static readonly Policy VehicleRequirementsDelete = new("vehicle-requirements:delete", "Delete Vehicle Requirement");

        //Currency
        public static readonly Policy Currency = new("currency:list", "List Currency");
        public static readonly Policy CurrencyViewDetails = new("currency:view-details", "View Currency");
        public static readonly Policy CurrencyAdd = new("currency:add", "Add Currency");
        public static readonly Policy CurrencyEdit = new ("currency:edit", "Edit Currency");
        public static readonly Policy CurrencyDelete = new("currency:delete", "Delete Currency");

    }

    // Requests Module
    public static class Requests
    {
        public static readonly Policy List = new("requests:list", "List Requests");
        public static readonly Policy Add = new("requests:add", "Add Request");
        public static readonly Policy ViewDetails = new("requests:view-details", "View Request Details");
        public static readonly Policy Approve = new("requests:approve", "Approve Requests");
        public static readonly Policy Reject = new("requests:reject", "Reject Requests");
        public static readonly Policy ListArchived = new("requests:list-archived", "List Archived Requests");
        public static readonly Policy ViewArchivedDetails = new("requests:view-archived-request", "View Details of Archived Requests");
        public static readonly Policy ListAwaitingApproval = new("requests:list-awaiting-approval", "List Requests that are Awaiting Approval");
        public static readonly Policy ViewAwaitingApprovalDetails = new("requests:view-awaiting-approval", "View Details of Requests that are Awaiting Approval");
    }


    // Registers Module
    public static class Registers
    {
        public static readonly Policy List = new("registers:list", "List Registers");

        public static readonly Policy ListRegistersOfShipper = new("registers:list-register-of-shipper", "List Register Shippers");
        public static readonly Policy ViewDetailsRegistersOfShipper = new("registers:view-details-of-register-shipper", "View Details of Register Shipper");

        public static readonly Policy ListRegistersOfCarrier = new("registers:list-register-of-carrier", "List Register Carriers");
        public static readonly Policy ViewDetailsRegistersOfCarrier = new("registers:view-details-of-register-carrier", "View Details of Register Carrier");

        public static readonly Policy ExportRegisters = new("registers:export-register", "Export Registers");
        public static readonly Policy ChangeLicenseStatusOfRegisters = new("registers:change-license-status", "Change License Status of Registers");
    }


    // Email Configuration Module
    public static class EmailOptions
    {
        public static readonly Policy Add = new("email-options:add", "Add Email Options");
        public static readonly Policy Edit = new("email-options:edit", "Edit Email Options");
        public static readonly Policy SendTest = new("email-options:send-test-email", "Send Test Email");
    }


    // Equipments Module
    //public static class Equipments
    //{
    //    public static readonly Policy List = new("equipments:list", "List Equipment");
    //    public static readonly Policy ViewEquipmentDetails = new("equipments:view-details", "View Equipment Details");
    //    public static readonly Policy AddEquipment = new("equipments:add", "Add Equipment");
    //    public static readonly Policy EditEquipment = new("equipments:edit", "Edit Equipment");
    //    public static readonly Policy DeleteEquipment = new("equipments:delete", "Delete Equipment");
    //    public static readonly Policy ExportEquipment = new("equipments:export", "Export Equipment Data");
    //    public static readonly Policy AddNewActivityOfEquipment = new("equipments:new-activity", "Add New Activity for Equipment");
    //    public static readonly Policy ViewActivityHistoryOfEquipment = new("equipments:activity-history", "View Activity History of Equipment");
    //}


    // Profile Module
    public static class Profile
    {
        public static readonly Policy View = new("profile:view", "View Profile");
        public static readonly Policy Edit = new("profile:edit", "Edit Profile");
        public static readonly Policy ViewQuestionnaire = new("profile:view-questionnaire", "View Questionnaire");
    }

    // Notifications Module
    public static class Notifications
    {
        public static readonly Policy List = new("notifications:list", "List Notifications");
        public static readonly Policy ViewDetails = new("notifications:view-details", "View Notification Details");
    }

    //Reportin Module//
    public static class Reporting
    {
        public static readonly Policy ReportingList = new("reporting:list", "List Reports");
        public static readonly Policy KGHServiceCompaniesReport = new("reports:dlp-service-companies", "KGH Service Companies Report");
        public static readonly Policy KGHServiceCompaniesByEntityReport = new("reports:dlp-service-companies-by-entity", "KGH Service Companies by Entity Report");
        public static readonly Policy CertifiedTechniciansByTrainingCenterReport = new("reports:certified-technicians-by-training-center", "Certified Technicians by Training Center Report");
        public static readonly Policy CertifiedTechniciansByEntityReport = new("reports:certified-technicians-by-entity", "Certified Technicians by Entity Report");
        public static readonly Policy CertifiedTechniciansByCertificationCategoryReport = new("reports:certified-technicians-by-certification-category", "Certified Technicians by Certification Category Report");
        public static readonly Policy RefrigerantsByEntityReport = new("reports:refrigerants-by-entity", "Refrigerants by Entity");
        public static readonly Policy KGHEquipmentByCoolingMediumReport = new("reports:dlp-equipment-by-cooling-medium", "KGH Equipment by Cooling Medium Report");
        public static readonly Policy KGHEquipmentByMunicipalitiesReport = new("reports:dlp-equipment-by-municipalities", "KGH Equipment by Municipalities Report");
        public static readonly Policy KGHEquipmentByPurposeAndUseReport = new("reports:dlp-equipment-by-purpose-and-use", "KGH Equipment by Purpose and Use Report");

        public static readonly Policy AnnualReportOnCollectedSubstances = new("reports:annual-report-service-technician", "Annual Report On Collected Substances");
        public static readonly Policy MVTEOAnnualReportOnCollectedSubstances = new("reports:mvteo-annual-report-service-technician", "MVTEO Annual Report On Collected Substances");
        public static readonly Policy AddAnnualReportByServiceTechnician = new("create-report-by-service-technician:add", "Add Annual Report By Service Technician");
        public static readonly Policy AddImportExportSubstances = new("prelog-import-export-substance:add", "Add Import Export Substances");
        public static readonly Policy AnnualReportOnImportExportOfOzoneDepletingSubstance = new("reports:annual-report-on-import-export-substances", "Annual Report On Import/Export Of Ozone Depleting Substance");
        public static readonly Policy MVTEOAnnualReportOnImportExportOfOzoneDepletingSubstance = new("reports:mvteo-annual-report-on-import-export-substances", "MVTEO Annual Report On Import/Export Of Ozone Depleting Substance");
        public static readonly Policy ViewMVTEOAnnualReportByServiceTechnician = new("view-mvteo-report-by-service-technician:view", "View MVTEO Annual Report By Service Technician");
        public static readonly Policy ViewMVETOAnnualReportOnImportExportSubstances = new("view-mvteo-report-by-import-export-substance:view", "View MVETO Annual Report On Import Export Substances");
    }

    // Logs Module
    public static class Logs
    {
        public static readonly Policy List = new("logs:list", "List Logs");
        public static readonly Policy ViewDetails = new("logs:view-details", "View Log Details");
    }

    // My Requests Module
    public static class MyRequests
    {
        public static readonly Policy List = new("my-requests:list", "Shipper - List My Requests");
        public static readonly Policy ViewDetails = new("my-requests:view-details", "Shipper - View My Requests Details");
        public static readonly Policy Delete = new("my-requests:delete", "Shipper - Delete Request");
        public static readonly Policy OffersList = new("choose-offer:list", "Shipper - Choose Offer");
        public static readonly Policy Add = new("new-transport-request:add", "Shipper - Add New Transport Request");
        public static readonly Policy TemplatesList = new("my-templates:list", "Shipper - View My Templates");
        public static readonly Policy TemplatesEdit = new("my-templates:edit", "Shipper - Edit My Template");
        public static readonly Policy TemplatesDelete = new("my-templates:delete", "Shipper - Delete My Template");
    }

    // My Shipments Module
    public static class MyShipments
    {
        public static readonly Policy List = new("my-shipments:list", "Shipper - List My Shipments");
        public static readonly Policy ViewDetails = new("my-shipments:view-details", "Shipper - View My Shipments Details");
        public static readonly Policy Add = new("confirm-pod:add", "Shipper - Confirm POD");
    }

    // ManageTransportRequests
    public static class ManageTransportRequests
    {

        public static readonly Policy List = new("manage-transport-requests:list", "List Manage Transport Requests");
        public static readonly Policy ViewDetails = new("manage-transport-requests:view-details", "View Manage Transport Requests");
        public static readonly Policy Add = new("manage-transport-requests:add", "Add Manage Transport Requests");
        public static readonly Policy OfferList = new("manage-transport-offers:list", "List Manage Transport Offers");
    }

    // Languages Module
    public static class Languages
    {
        public static readonly Policy List = new("languages:list", "List Languages");
        public static readonly Policy Add = new("languages:add", "Add Language");
        public static readonly Policy Edit = new("languages:edit", "Edit Language");
        public static readonly Policy Delete = new("languages:delete", "Delete Language");
    }

    // Translations Module
    public static class Translations
    {
        public static readonly Policy List = new("translations:list", "Can list translations");
        public static readonly Policy Edit = new("translations:edit", "Can edit translations");
    }

    public static class Configurations
    {
        public static readonly Policy List = new("database-connections:list", "Can view Database Connections");
    }

   




    public static (int Id, string ModuleName, List<Policy> Functionalities)[] GetAllPolicies()
    {
        var policyList = new List<(int, string, List<Policy>)>();

        // Get all nested classes which represent Modules
        var nestedClasses = typeof(CustomPolicies).GetNestedTypes(BindingFlags.Public | BindingFlags.Static);

        int policyCount = 1;
        foreach (var module in nestedClasses)
        {
            var moduleName = module.Name;
            if (module.Name == "UserGroups")
            {
                moduleName = "User Groups";
            }
            if (module.Name == "EmailOptions")
            {
                moduleName = "Email Configuration";
            }
            if (module.Name == "Equipments")
            {
                moduleName = "Equipment";
            }
            if (module.Name == "CompanyTechnicians")
            {
                moduleName = "Company Technicians";
            }
            if (module.Name == "ManageCompanies")
            {
                moduleName = "Manage Companies";
            } 
            if (module.Name == "VehicalFleet")
            {
                moduleName = "Carrier - Vehicle Fleet";
            } 
            if (module.Name == "CarrierVehicalFleet")
            {
                moduleName = "Admin - Vehicle Fleet";
            }
            if (module.Name == "TransportRequests")
            {
                moduleName = "Transport Requests";
            }
            if (module.Name == "MyRequests")
            {
                moduleName = "Shipper - My Requests";
            }
            if (module.Name == "MyShipments")
            {
                moduleName = "Shipper - My Shipments";
            }
            if (module.Name == "Shipments")
            {
                moduleName = "Admin - Shipments";
            }


            // Get all fields from module class
            var policies = module.GetFields(BindingFlags.Public | BindingFlags.Static)
                .Where(f => f.FieldType == typeof(Policy))
                .Select(f => f.GetValue(null) as Policy)
                .ToList();

            policyList.Add((policyCount, moduleName, policies));
            policyCount++;
        }

        return policyList.ToArray();
    }
}
