using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DLP.Domain.Entities;
public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
    public string UserName { get; set; }
    public string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
}
