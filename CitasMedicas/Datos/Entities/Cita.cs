using System;

namespace CitasMedicas.Datos.Entities
{
    public class Cita : FechaEstatus
    {
        public string Detalle { get; set; }
        public string Notas { get; set; }
        public decimal Precio { get; set; }
        public decimal Pagado { get; set; }
        public DateTime Fecha { get; set; }
        public int PacienteId { get; set; }
        public Paciente Paciente { get; set; }
        public int MedicoId { get; set; }
        public Medico Medico { get; set; }
        public string EstatusCita { get; set; }
    }
}
