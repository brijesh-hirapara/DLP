using System;
using DLP.Application.Common.Interfaces;
using DLP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.OtherContexts
{
    public class GammaDbContext : DbContextBase
    {
        public GammaDbContext(DbContextOptions<GammaDbContext> options) : base(options)
        {
        }
    }
}

