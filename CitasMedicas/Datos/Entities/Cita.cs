using System.Collections.Generic;

namespace CitasMedicas.Datos.Entities
{
    public class Cita: FechaEstatus
    {
        public int Id { get; set;  }
        public string Detalle { get; set; }
        public string Notas { get; set; }
        public decimal Precio { get; set; }
        public int PacienteId { get; set; }
        public Paciente Paciente { get; set; }
        public Medico Medico { get; set; }
        public string EstatusCita { get; set; }

        

    

        
       
    }
}
