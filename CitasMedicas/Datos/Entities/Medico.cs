using System;
using System.Collections.Generic;

namespace CitasMedicas.Datos.Entities
{
    public class Medico : FechaEstatus
    {
        public string NombreCompleto => $"{Nombre} {Apellido}";
        public string Cedula { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Direccion { get; set; }

        public int EspecialidadId { get; set; }
        public Especialidad Especialidad { get; set; }

        //public ICollection<Especialidad> Especialidades { get; set; }


    }
}
