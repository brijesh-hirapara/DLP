using Hangfire.Dashboard;

namespace DLP.Filters;

public class HangfireDashboardNoAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext dashboardContext)
    {
        return true;
    }
}