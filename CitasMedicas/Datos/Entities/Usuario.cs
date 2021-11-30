using System.Collections.Generic;

namespace CitasMedicas.Datos.Entities
{
    public class Usuario: FechaEstatus
    {
        
        public string Clave { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Telefono { get; set; }
        public string Cedula { get; set; }
        public string FechaNacimiento { get; set; }
        public List<Cita> Cita { get; set; }

    }
}
