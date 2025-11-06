using DLP.Application.Common.Interfaces;
using DLP.Application.ImportExportSubstances.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.ImportExportSubstances.Queries
{
    public class GetImportExportSubstancesReportDetailQuery : IRequest<ImportExportSubstancesReportDetailDto>
    {
        public Guid Id { get; set; }
    }

    public class GetImportExportSubstancesReportDetailQueryHandler : IRequestHandler<GetImportExportSubstancesReportDetailQuery, ImportExportSubstancesReportDetailDto>
    {
        private readonly IAppDbContext _dbContext;

        public GetImportExportSubstancesReportDetailQueryHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ImportExportSubstancesReportDetailDto> Handle(GetImportExportSubstancesReportDetailQuery request, CancellationToken cancellationToken)
        {
            var municipality = await _dbContext.ImportExportSubstancesReport
                .Include(m => m.ImportExportSubstancesAnnualReport.Where(a => !a.IsDeleted))
                    .ThenInclude(m => m.RefrigerantType)
                .FirstOrDefaultAsync(m => m.Id == request.Id && !m.IsDeleted, cancellationToken)
                ?? throw new Exception("Invalid Municipality");

            return municipality.Adapt<ImportExportSubstancesReportDetailDto>();
        }
    }
}