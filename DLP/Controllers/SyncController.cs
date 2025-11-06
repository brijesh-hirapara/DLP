using Hangfire;
using DLP.Application.Common.Jobs;
using DLP.Controllers.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DLP.Controllers;

public class SyncController : ApiControllerBase
{
    private readonly IFailedSyncJob _failedSyncJob;

    public SyncController(IFailedSyncJob failedSyncJob)
    {
        _failedSyncJob = failedSyncJob;
    }

    [HttpGet]
    public async Task<ActionResult<int>> RemainingRecordsToSync()
    {
        return Ok(await _failedSyncJob.RemainingRecordsToSync());
    }

    [HttpPost("trigger-failed-sync")]
    public async Task<IActionResult> TriggerFailedSync()
    {
        await _failedSyncJob.Run();
        return Ok("Failed sync job triggered successfully.");
    }

    [HttpPost("trigger-failed-sync-hangfire")]
    public IActionResult TriggerFailedSyncHangfire()
    {
        BackgroundJob.Enqueue(() => _failedSyncJob.Run());
        return Ok("Failed sync job triggered successfully through Hangfire.");
    }
}