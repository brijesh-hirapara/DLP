using FluentValidation;

namespace DLP.Application.Requests.Commands;

public class ApproveRequestCommandValidator : AbstractValidator<ApproveRequestCommand>
{
    public ApproveRequestCommandValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().NotNull().WithMessage("RequestId Id is required");
    }
}