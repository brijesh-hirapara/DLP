using DLP.Application.OtherContexts;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.Common.Interfaces;

public interface IDatabaseHealthCheckService
{
    Task<bool> IsDatabaseAvailable<TContext>() where TContext : DbContext;
    Task<bool> IsDatabaseAvailable<TContext>(TContext dbContextBase) where TContext : DbContextBase;
}