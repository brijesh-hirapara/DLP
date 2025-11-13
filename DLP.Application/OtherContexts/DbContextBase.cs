using System;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace DLP.Application.OtherContexts
{
    public abstract class DbContextBase : DbContext
    {
        public DbContextBase(DbContextOptions options) : base(options)
        {
        }

       
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

        }


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
        public DbSet<Codebook> Codebooks { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<RequestFile> RequestFiles { get; set; }
        public DbSet<Qualification> Qualifications { get; set; }
        public DbSet<QualificationFile> QualificationFiles { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<EquipmentFile> EquipmentFiles { get; set; }
        public DbSet<EquipmentActivity> EquipmentActivities { get; set; }
        public DbSet<EquipmentActivityFile> EquipmentActivityFiles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Employment> EmploymentHistory { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<RefrigerantType> RefrigerantTypes { get; set; }
        public DbSet<FileSynchronization> FileSynchronizations { get; set; }
        public DbSet<ServiceTechnicianReport> ServiceTechnicianReport { get; set; }
        public DbSet<ServiceTechnicianAnnualReport> ServiceTechnicianAnnualReport { get; set; }
        public DbSet<ImportExportSubstancesReport> ImportExportSubstancesReport { get; set; }
        public DbSet<ImportExportSubstancesAnnualReport> ImportExportSubstancesAnnualReport { get; set; }
        public DbSet<UploadPODFile> UploadPODFiles { get; set; }

    }
}

