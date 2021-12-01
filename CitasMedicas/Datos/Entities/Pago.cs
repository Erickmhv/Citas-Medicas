namespace CitasMedicas.Datos.Entities
{
    public class Pago : FechaEstatus
    {
        public Cita Cita { get; set; }
        public decimal Monto { get; set; }
      
    }
}
