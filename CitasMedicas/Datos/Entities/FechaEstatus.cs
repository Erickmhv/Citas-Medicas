using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
    public abstract class FechaEstatus
    {   
        public int Id { get; set; }
        public int UsuarioRegistroId { get; set; }
        public Usuario UsuarioRegistro { get; set; }
        public int UsuarioModificoId { get; set; }
        public Usuario UsuarioModifico { get; set; }
        public DateTime? FechaRegistro { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public string Estatus { get; set; }
        public int? Borrado { get; set; }

    }
}
