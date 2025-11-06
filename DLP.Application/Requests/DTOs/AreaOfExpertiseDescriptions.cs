using DLP.Domain.Enums;

namespace DLP.Application.Requests.DTOs;

public class AreaOfExpertiseDescriptions
{
    public static readonly Dictionary<AreaOfExpertise, string> Descriptions = new()
    {
        { AreaOfExpertise.InstallationMaintenanceAndVerification,
            @"Installation, maintenance, servicing, and verification of releases of ozone-depleting substances 
              or substitute substances from stationary refrigeration and air-conditioning equipment and heat pumps, 
              as well as fire protection equipment and fire extinguishers."
        },
        { AreaOfExpertise.CollectionAndRecovery,
            @"Collection and recovery of ozone-depleting substances or substitute substances from equipment 
              and systems containing them and equipment containing solvents."
        },
        { AreaOfExpertise.ImportExportAndMarketingOfSubstances,
            "Import, export, and marketing of substances that damage the ozone layer or substitute substances." },
        { AreaOfExpertise.ImportExportAndPlacingOnTheMarketOfEquipment,
            @"Import, export, and placing on the market of equipment containing substances that damage the ozone 
              layer or substitute substances." }
    };
}
