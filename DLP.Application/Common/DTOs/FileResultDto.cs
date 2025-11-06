using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.DTOs;
public class FileResultDto
{
    public Guid Id { get; set; }
    public string ContentType { get; set; }
    public byte[] FileContents { get; set; }
    public string FileName { get; set; }
}
