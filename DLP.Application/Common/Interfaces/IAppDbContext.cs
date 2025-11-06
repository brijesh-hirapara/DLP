using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace DLP.Application.Common.Interfaces;

// Specific DbContext interfaces should extend the generic one

public interface IAppDbContext 
{
    DbSet<Domain.Entities.ActivityLog> ActivityLogs { get; set; }
    DbSet<EmailOption> EmailOptions { get; set; }
    DbSet<RefreshToken> RefreshTokens { get; set; }
    DbSet<Request> Requests { get; set; }
    DbSet<RequestFile> RequestFiles { get; set; }
    DbSet<Qualification> Qualifications { get; set; }
    DbSet<QualificationFile> QualificationFiles { get; set; }
    DbSet<Employment> EmploymentHistory { get; set; }
    DbSet<Equipment> Equipments { get; set; }
    DbSet<EquipmentActivity> EquipmentActivities { get; set; }
    DbSet<EquipmentFile> EquipmentFiles { get; set; }
    DbSet<EquipmentActivityFile> EquipmentActivityFiles { get; set; }
    DbSet<Post> Posts { get; set; }
    DbSet<PostAudience> PostAudiences { get; set; }
    DbSet<I18nLanguageCode> I18nLanguageCodes { get; set; }
    DbSet<StateEntity> StateEntities { get; set; }
    DbSet<Fallback> FailedSynchronizations { get; set; }
    DbSet<User> Users { get; set; }
    DbSet<Language> Languages { get; set; }
    DbSet<Translation> Translations { get; set; }
    DbSet<Canton> Cantons { get; set; }
    DbSet<Municipality> Municipalities { get; set; }
    DbSet<CompanyBranch> CompanyBranches { get; set; }
    DbSet<Organization> Organizations { get; set; }
    DbSet<CompanyRegisterType> CompanyRegisterTypes { get; set; }
    DbSet<RefrigerantType> RefrigerantTypes { get; set; }
    DbSet<Codebook> Codebooks { get; set; }
    DbSet<Role> Roles { get; set; }
    DbSet<UserRole> UserRoles { get; set; }
    DbSet<FileSynchronization> FileSynchronizations { get; set; }
    DbSet<ServiceTechnicianReport> ServiceTechnicianReport { get; set; }
    DbSet<ServiceTechnicianAnnualReport> ServiceTechnicianAnnualReport { get; set; }
    DbSet<ImportExportSubstancesReport> ImportExportSubstancesReport { get; set; }
    DbSet<ImportExportSubstancesAnnualReport> ImportExportSubstancesAnnualReport { get; set; }
    DbSet<Questionnaire> Questionnaire { get; set; }
    DbSet<VehicleFleetRequest> VehicleFleetRequests { get; set; }
    DbSet<TransportRequest> TransportRequests { get; set; }
    DbSet<TransportPickup> TransportPickups { get; set; }
    DbSet<TransportDelivery> TransportDeliverys { get; set; }
    DbSet<TransportGoods> TransportGoods { get; set; }
    DbSet<TransportInformation> TransportInformations { get; set; }
    DbSet<TransportCarrier> TransportCarriers { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    DatabaseFacade Database { get; }

    /// <summary>
    /// Executes a raw SQL query that will return an element of the given generic type.
    /// The type can be any type that has properties that match the names of the columns returned from the query, or can be a simple primitive type.
    /// The type does not have to be an entity type.
    /// The result of this query is never tracked by the context even if the type of object returned is an entity type.
    /// </summary>
    /// <param name="query">The SQL query string.</param>
    Task<T> SqlQuerySingleAsync<T>(FormattableString query);

    DbSet<TEntity> SetType<TEntity>() where TEntity : class;



}
