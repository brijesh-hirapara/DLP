namespace DLP.Application.Common.Exceptions;

public class DuplicateSortingException : Exception
{
    public DuplicateSortingException()
    {
    }

    public DuplicateSortingException(string key) : base($"Duplicate sorting key in the specified query: {key}")
    {
    }

    public DuplicateSortingException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
