using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
  public class Pago
    {
        public int Id  { get; set; }
        public int CitaID  { get; set; }
        public int UsuarioId { get; set; }
        public decimal Monto { get; set; }
        public bool Borrado { get; set; }
}
}
