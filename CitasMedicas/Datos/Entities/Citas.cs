using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
    public class Citas
    {
     public int Id{get; set;}
     public string Detalle { get; set; }
     public string Notas { get; set; }
     public decimal Precio { get; set; }
     public int PacienteId { get; set; }
     public  int UsuarioId { get; set; }
     public int MedicoId { get; set; }
     public string EstatusCita { get; set; }
     public bool Borrado { get; set;  }
     public Usuario IdUsuario { get; set; }

     public FechaEstatus FechaRegistro { get; set; }
     public FechaEstatus FechaModificacion { get; set; }
     public FechaEstatus Estatus { get; set; }
     public FechaEstatus Borrado { get; set; }



    }
}
