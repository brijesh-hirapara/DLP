using System;

namespace DLP.Application.Common.Models;
public class RefreshTokenResult
{
    public string UserName { get; set; }
    public string TokenString { get; set; }
    public DateTime ExpiresAt { get; set; }
}
