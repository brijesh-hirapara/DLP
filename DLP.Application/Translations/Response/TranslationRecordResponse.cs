using DLP.Application.Translations.DTOs;
using System.Collections.Generic;

namespace DLP.Application.Translations.Response
{
    public class TranslationRecordResponse
	{
		public string Key { get; set; }
		public List<TranslationDto> Translations { get; set; }
	}
}