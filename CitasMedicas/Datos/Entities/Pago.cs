namespace CitasMedicas.Datos.Entities
{
    public class Pago
    {
        public int Id { get; set; }
        public Cita Cita { get; set; }
        public Usuario Usuario { get; set; }
        public decimal Monto { get; set; }
        public FechaEstatus FechaEstatus { get; set; }

    }
}
