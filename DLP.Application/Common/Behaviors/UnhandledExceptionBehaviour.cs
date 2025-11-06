using DLP.Application.Common.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Behaviors
{
    public class UnhandledExceptionBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    {
        private readonly IActivityLogger _logger;

        public UnhandledExceptionBehaviour(IActivityLogger logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            try
            {
                return await next();
            }
            catch (Exception ex)
            {
                var requestName = typeof(TRequest).Name;
                string section(string title, string content) => $"<span><strong>{title}: </strong> <i>{content}</i></span><br><br>";
                string encodeString(string content) => content.Replace("<", "[").Replace(">", "]");

                string exceptionDetsils = section("Message", ex.Message) + section("StackTrace", encodeString(ex.StackTrace));
                await _logger.Exception(requestName, exceptionDetsils);

                throw;
            }
        }
    }
}
