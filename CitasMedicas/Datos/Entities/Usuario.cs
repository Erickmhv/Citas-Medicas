using System.Collections.Generic;

namespace CitasMedicas.Datos.Entities
{
    public class Usuario : FechaEstatus
    {
        public string NombreUsuario { get; set; }
        public string Clave { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }

    }
}
