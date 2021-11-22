namespace CitasMedicas.Datos.Entities
{
    public class Cita
    {
        public int Id { get; set; }
        public string Detalle { get; set; }
        public string Notas { get; set; }
        public decimal Precio { get; set; }
        public Paciente Paciente { get; set; }
        public Usuario Usuario { get; set; }
        public Medico Medico { get; set; }
        public string EstatusCita { get; set; }
        public FechaEstatus FechaEstatus { get; set; }

    }
}
