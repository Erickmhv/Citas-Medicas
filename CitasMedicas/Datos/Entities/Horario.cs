using System;

namespace CitasMedicas.Datos.Entities
{
    public class Horario
    {
        public int Id { get; set; }
        public DateTime HoraDesde { get; set; }
        public DateTime HoraHasta { get; set; }
        public Medico Medico { get; set; }
        public FechaEstatus FechaEstatus { get; set; }

    }
}
