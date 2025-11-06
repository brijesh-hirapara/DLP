using FluentValidation;

namespace DLP.Application.Requests.Commands;

public class RejectRequestCommandValidator : AbstractValidator<RejectRequestCommand>
{
    public RejectRequestCommandValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().NotNull().WithMessage("RequestId Id is required");
    }
}