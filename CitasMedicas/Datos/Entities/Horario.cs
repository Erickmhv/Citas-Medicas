using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
   public  class Horario
    {
        public int Id  { get; set; }
       
        public DateTime HoraDesde { get; set; }
        public DateTime HoraHasta  { get; set; }

        public bool Borrado { get; set; }
        public Medico MedicoId { get; set; }
}
}
