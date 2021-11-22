﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Entities
{
    public class Medico
    {
        public int Id  { get; set; }
        public string Cedula { get; set; }
        public string Nombre  { get; set; }
        public string Apellido { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public char Genero  { get; set; }
        public string Direccion { get; set; }
        
        public bool Borrado  { get; set; }
        public Citas MedicoId { get; set; }
        public Especialidad EspecialidadId { get; set; }

}
}