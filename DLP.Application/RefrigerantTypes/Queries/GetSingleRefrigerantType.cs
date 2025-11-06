using System;
using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Exceptions;
using DLP.Application.Common.Interfaces;
using DLP.Application.RefrigerantTypes.DTO;
using DLP.Domain.Enums;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DLP.Application.RefrigerantTypes.Queries
{
    public class GetSingleRefrigerantTypeQuery : IRequest<RefrigerantTypeDto>
    {
        public Guid Id { get; set; }
    }

    public class GetSingleRefrigerantTypeQueryHandler : IRequestHandler<GetSingleRefrigerantTypeQuery, RefrigerantTypeDto>
    {
        private readonly IAppDbContext _context;
        private readonly IActivityLogger _logger; // Inject the IActivityLogger
        private readonly ICurrentUserService _currentUser; // Inject the ICurrentUserService

        public GetSingleRefrigerantTypeQueryHandler(IAppDbContext context, IActivityLogger logger, ICurrentUserService currentUser)
        {
            _context = context;
            _logger = logger; // Assign the injected logger
            _currentUser = currentUser; // Assign the injected current user service
        }

        public async Task<RefrigerantTypeDto> Handle(GetSingleRefrigerantTypeQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var refrigerant = await _context.RefrigerantTypes
                    .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

                if (refrigerant == null)
                    return null;

                await _logger.Add(new ActivityLogDto
                {
                    UserId = _currentUser.UserId,
                    LogTypeId = (int)LogTypeEnum.INFO,
                    Activity = "Successfully retrieved Refrigerant Type"
                });

                return refrigerant.Adapt<RefrigerantTypeDto>();
            }
            catch (Exception ex)
            {
                await _logger.Exception(ex.Message, "Failed to retrieve Refrigerant Type", _currentUser.UserId);
                throw;
            }
        }
    }


}

