using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Domain.Enums
{
    public enum DateSelectionOption
    {
        [Description("No Granted Dates")]
        NoGrantedDates = 1,
        [Description("Select Dates ")]
        SelectDates = 2,
    }
}
