using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DLP.Application.Common.Constants
{
    public static class ActivityType
    {
        #region User activity

        public static string USER_CREATED => "User created";
        public static string USER_LOGGED_IN => "User logged in";
        public static string USER_LOGGED_OUT => "User logged out";
        public static string USER_CHANGED_PASSWORD => "User changed password";
        #endregion


        #region Errors 

        public static string ERROR_USER_CREATED => "User could not be created.";

        #endregion
    }
}
