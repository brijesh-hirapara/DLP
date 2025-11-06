using System;
using DLP.Application.Common.Constants;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace DLP.Application.OtherContexts
{
    public class BetaDbContext : DbContextBase
    {
        public BetaDbContext(DbContextOptions<BetaDbContext> options) : base(options)
        {
        }

       
    }
}

