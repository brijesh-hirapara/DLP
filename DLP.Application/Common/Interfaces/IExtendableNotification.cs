using MediatR;

namespace DLP.Application.Common.Interfaces;

//this was created to handle failed sync scenarios
public interface IExtendableNotification : INotification
{
    //this is specifically used to determine if a re-published notification should be executed/proceed
    //only on a specific dbcontext not on all
    public string? SpecificHandlerOnly { get; set; }
    //signature to avoid adding same failed notification twice
    public string Signature { get; }
}
