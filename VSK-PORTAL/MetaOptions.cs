using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WEB
{
    public class MetaOptions
    {
        public string Title { get; set; }
        public Author Author { get; set; }
    }
    public class Author
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
