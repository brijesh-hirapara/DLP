using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Exceptions;
public class InvalidSortingQueryStringException : Exception
{
    private const string ErrorMessage = "Invalid sorting string for a specified endpoint.";
    public InvalidSortingQueryStringException(string message) : base(message)
    {
    }

    public InvalidSortingQueryStringException(string message, Exception innerException) : base(message, innerException)
    {
    }

    public InvalidSortingQueryStringException() : base(ErrorMessage)
    {
    }

    public InvalidSortingQueryStringException(IEnumerable<string> supportedKeys)
        : base($"{ErrorMessage} Supported keys: {string.Join(", ", supportedKeys)}.") { }
}
