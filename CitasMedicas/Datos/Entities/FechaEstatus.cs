using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
    public class FechaEstatus
    {
        
        public Citas Id { get; set; }
        public DateTimeOffset FechaRegistro { get; set; }
        public DateTimeOffset FechaModificacion { get; set; }
        public string Estatus { get; set; }
        public bool Borrado { get; set;  }



    }
}
