namespace DLP.Domain.Enums;

/// <summary>
/// Represents the area of expertise related to the installation, maintenance,
/// servicing, and verification of releases of ozone-depleting substances or substitute
/// substances from stationary refrigeration and air-conditioning equipment and heat pumps,
/// as well as fire protection equipment and fire extinguishers.
/// </summary>
public enum AreaOfExpertise
{
    /// <summary>
    /// Installation, maintenance, servicing, and verification of releases of ozone-depleting
    /// substances or substitute substances from stationary refrigeration and air-conditioning
    /// equipment and heat pumps, as well as fire protection equipment and fire extinguishers.
    /// </summary>
    InstallationMaintenanceAndVerification = 1,

    /// <summary>
    /// Collection and recovery of ozone-depleting substances or substitute substances from
    /// equipment and systems containing them and equipment containing solvents.
    /// </summary>
    CollectionAndRecovery,

    /// <summary>
    /// Import, export, and marketing of substances that damage the ozone layer or substitute substances.
    /// </summary>
    ImportExportAndMarketingOfSubstances,

    /// <summary>
    /// Import, export, and placing on the market of equipment containing substances that damage the ozone layer
    /// or substitute substances.
    /// </summary>
    ImportExportAndPlacingOnTheMarketOfEquipment
}
