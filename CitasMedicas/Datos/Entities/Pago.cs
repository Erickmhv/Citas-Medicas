namespace CitasMedicas.Datos.Entities
{
    public class Pago:FechaEstatus
    {
        public int Id { get; set; }
        public Cita Cita { get; set; }
        public Usuario Usuario { get; set; }
        public decimal Monto { get; set; }
      

    }
}
