using System;

namespace CitasMedicas.Datos.Entities
{
    public class Medico:FechaEstatus
    {
        public int Id { get; set; }
        public string Cedula { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public char Genero { get; set; }
        public string Direccion { get; set; }
        public Cita MedicoId { get; set; }
        public Especialidad EspecialidadId { get; set; }
        

    }
}
