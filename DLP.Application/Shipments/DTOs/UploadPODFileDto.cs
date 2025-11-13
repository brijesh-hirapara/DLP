namespace DLP.Application.Shipments.DTOs
{
    public class UploadPODFileDto
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public long Size { get; set; } // In bytes.
        public string ContentType { get; set; } // E.g., "image/jpeg", "application/pdf"
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
