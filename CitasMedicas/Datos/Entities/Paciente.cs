using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace CitasMedicas.Datos.Entities
{
    public class Paciente : FechaEstatus
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Direccion { get; set; }
        public string Enfermedad { get; set; }
        public string Sintomas { get; set; }
        public string Medicamentos { get; set; }
        public string Alergias { get; set; }
    }
}
