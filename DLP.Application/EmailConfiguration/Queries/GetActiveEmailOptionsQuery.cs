using DLP.Application.ActivityLogs.Dto;
using DLP.Application.Common.Interfaces;
using DLP.Application.EmailConfiguration.DTOs;
using DLP.Domain.Enums;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.EmailConfiguration.Queries
{
    public class GetActiveEmailOptionsQuery : IRequest<EmailOptionsDto>
    {
    }
    public class GetActiveEmailOptionsQueryHandler : IRequestHandler<GetActiveEmailOptionsQuery, EmailOptionsDto>
    {
        private readonly IAppDbContext _context;

        public GetActiveEmailOptionsQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<EmailOptionsDto> Handle(GetActiveEmailOptionsQuery request, CancellationToken cancellationToken)
        {
             var options = await _context.EmailOptions
                    .SingleOrDefaultAsync(x => x.IsActive, cancellationToken);

                var emailOptionsDto = options.Adapt<EmailOptionsDto>();

                return emailOptionsDto;
         
        }
    }


}
