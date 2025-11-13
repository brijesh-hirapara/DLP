using System.Diagnostics.CodeAnalysis;
using Duende.IdentityServer.EntityFramework.Entities;
using Duende.IdentityServer.EntityFramework.Extensions;
using Duende.IdentityServer.EntityFramework.Interfaces;
using Duende.IdentityServer.EntityFramework.Options;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Common;
using DLP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Options;

namespace DLP.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<User, Role, string, IdentityUserClaim<string>, UserRole, IdentityUserLogin<string>, RoleClaim, IdentityUserToken<string>>, IAppDbContext, IPersistedGrantDbContext
{
    private readonly IOptions<OperationalStoreOptions> _operationalStoreOptions;

    public AppDbContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options)
    {
        _operationalStoreOptions = operationalStoreOptions;
    }

    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<I18nLanguageCode> I18nLanguageCodes { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<Translation> Translations { get; set; }
    public DbSet<StateEntity> StateEntities { get; set; }
    public DbSet<Canton> Cantons { get; set; }
    public DbSet<Municipality> Municipalities { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<CompanyRegisterType> CompanyRegisterTypes { get; set; }
    public DbSet<CompanyBranch> CompanyBranches { get; set; }
    public DbSet<EmailOption> EmailOptions { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Codebook> Codebooks { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<RequestFile> RequestFiles { get; set; }
    public DbSet<Qualification> Qualifications { get; set; }
    public DbSet<QualificationFile> QualificationFiles { get; set; }
    public DbSet<Employment> EmploymentHistory { get; set; }
    public DbSet<Equipment> Equipments { get; set; }
    public DbSet<EquipmentActivity> EquipmentActivities { get; set; }
    public DbSet<EquipmentFile> EquipmentFiles { get; set; }
    public DbSet<EquipmentActivityFile> EquipmentActivityFiles { get; set; }
    public DbSet<RefrigerantType> RefrigerantTypes { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostAudience> PostAudiences { get; set; }
    public DbSet<Fallback> FailedSynchronizations { get; set; }
    public DbSet<FileSynchronization> FileSynchronizations { get; set; }
    public DbSet<ServiceTechnicianReport> ServiceTechnicianReport { get; set; }
    public DbSet<ServiceTechnicianAnnualReport> ServiceTechnicianAnnualReport { get; set; }
    public DbSet<ImportExportSubstancesReport> ImportExportSubstancesReport { get; set; }
    public DbSet<ImportExportSubstancesAnnualReport> ImportExportSubstancesAnnualReport { get; set; }
    public DbSet<Questionnaire> Questionnaire { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="DbSet{PersistedGrant}"/>.
    /// </summary>
    public DbSet<PersistedGrant> PersistedGrants { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="DbSet{DeviceFlowCodes}"/>.
    /// </summary>
    public DbSet<DeviceFlowCodes> DeviceFlowCodes { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="DbSet{Key}"/>.
    /// </summary>
    public DbSet<Key> Keys { get; set; }
    public DbSet<VehicleFleetRequest> VehicleFleetRequests { get; set; }

    public DbSet<TransportRequest> TransportRequests { get; set; }
    public DbSet<TransportPickup> TransportPickups { get; set; }
    public DbSet<TransportDelivery> TransportDeliverys { get; set; }
    public DbSet<TransportGoods> TransportGoods { get; set; }
    public DbSet<TransportInformation> TransportInformations { get; set; }
    public DbSet<TransportCarrier> TransportCarriers { get; set; }
    public DbSet<Shipment> Shipments { get; set; }
    public DbSet<ShipmentAssignTruck> ShipmentAssignTrucks { get; set; }
    public DbSet<UploadPODFile> UploadPODFiles { get; set; }

    public override DatabaseFacade Database => base.Database;

    Task<int> IPersistedGrantDbContext.SaveChangesAsync() => base.SaveChangesAsync();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        var domainAssembly = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(x => x.FullName != null && x.FullName.Contains("Domain"));
        modelBuilder.ApplyConfigurationsFromAssembly(domainAssembly ?? throw new InvalidOperationException());

        modelBuilder.Entity<StateEntity>()
            .HasMany(e => e.Cantons)
            .WithOne(c => c.StateEntity)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StateEntity>()
            .HasMany(e => e.Municipalities)
            .WithOne(m => m.StateEntity)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<EmailOption>()
            .Property(e => e.Id)
            .IsRequired().ValueGeneratedOnAdd();

        modelBuilder.Entity<Codebook>()
            .Property(e => e.Id)
            .IsRequired().ValueGeneratedOnAdd();


        modelBuilder.Entity<Employment>()
            .Property(e => e.Id)
            .IsRequired().ValueGeneratedOnAdd();

        modelBuilder.Entity<QualificationFile>()
            .Property(e => e.Id)
            .IsRequired().ValueGeneratedOnAdd();

        modelBuilder.Entity<Qualification>()
            .Property(e => e.Id)
            .IsRequired().ValueGeneratedOnAdd();

        modelBuilder.ConfigurePersistedGrantContext(_operationalStoreOptions.Value);
    }


    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<IAuditableEntity> entry in ChangeTracker.Entries<IAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.Now;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.Now;
                    break;
            }
        }

        int result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }

    /// <summary>
    /// Executes a raw SQL query that will return an element of the given generic type.
    /// The type can be any type that has properties that match the names of the columns returned from the query, or can be a simple primitive type.
    /// The type does not have to be an entity type.
    /// The result of this query is never tracked by the context even if the type of object returned is an entity type.
    /// </summary>
    /// <param name="query">The SQL query string.</param>
    public async Task<T> SqlQuerySingleAsync<T>(FormattableString query)
    {
        return await Database.SqlQuery<T>(query).SingleAsync();
    }

    public DbSet<TEntity> SetType<TEntity>() where TEntity : class
    {
        return base.Set<TEntity>();
    }
}
