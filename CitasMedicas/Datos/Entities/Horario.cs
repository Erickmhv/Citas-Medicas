using System;

namespace CitasMedicas.Datos.Entities
{
    public class Horario: FechaEstatus
    {
        public DateTime HoraDesde { get; set; }
        public DateTime HoraHasta { get; set; }
        public int MedicoId { get; set; }
        public Medico Medico { get; set; }

    }
}
