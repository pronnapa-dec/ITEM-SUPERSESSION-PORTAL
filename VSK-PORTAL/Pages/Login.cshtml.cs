using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WEB.Pages
{
    public class LoginModel : PageModel
    {
        public string application_id { get; set; }
        public string site_logo { get; set; }
        public string site_title { get; set; }

        public void OnGet()
        {

            application_id = "6bfcf818-7d22-4f6f-816b-1166a95b7ec3";
            site_title = "Web Engine | VSK Autoparts Co.,LTD";
            site_logo = "../assets/img/logo2.jpg";
  
        }
    }
}