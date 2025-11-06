using KGH.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KGH.DbMigrator
{
    internal class CurrentUserService : ICurrentUserService
    {
        public string UserId => throw new NotImplementedException();

        public string UserName => throw new NotImplementedException();
    }
}
