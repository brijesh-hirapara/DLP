using System;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.OtherContexts
{
    public class DeltaDbContext : DbContextBase
    {
        public DeltaDbContext(DbContextOptions<DeltaDbContext> options) : base(options)
        {
        }
    }
}

