using CitasMedicas.Datos.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Context

{
    public class AppDbContext : DbContext
    {
        public AppDbContext()
            : base("name=SQLconnection")
        {

        }

        public DbSet<Cita> Citas { get; set; }
        public DbSet<Especialidad> Especialidads { get; set; }
        public DbSet<FechaEstatus> FechaEstatus { get; set; }
        public DbSet<Horario> Horarios { get; set; }
        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Paciente> Paciente { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            var usuario = modelBuilder.Entity<Usuario>();
            usuario.ToTable("Usuario");
            usuario.HasKey(e => e.Id);
            usuario.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            usuario.Property(e => e.Nombre).HasColumnName("Nombre").HasColumnType("varchar").HasMaxLength(50).IsRequired();
            usuario.Property(e => e.Apellido).HasColumnName("Apellido").HasColumnType("varchar").HasMaxLength(50).IsRequired();
            //usuario.HasRequired(e => e.Cita);

            var cita = modelBuilder.Entity<Cita>();
            cita.ToTable("Cita");
            cita.HasKey(e => e.Id);
            cita.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            cita.Property(e => e.Detalle).HasColumnName("Detalle").HasColumnType("varchar").HasMaxLength(50).IsRequired();
            //cita.HasRequired(e => e.Paciente).WithMany(e => e.Cita).HasForeignKey(e => e.PacienteId);
            cita.HasRequired(e => e.Paciente);
            cita.HasRequired(e => e.Medico);

            

            var Especialidad = modelBuilder.Entity<Especialidad>();
            Especialidad.ToTable("Especialidad");
            Especialidad.HasKey(e => e.Id);
            Especialidad.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            Especialidad.Property(e => e.Nombre).HasColumnName("Nombre").HasColumnType("varchar").HasMaxLength(50).IsRequired();           

           
           
            var FechaEstatus = modelBuilder.Entity<FechaEstatus>();
            FechaEstatus.ToTable("FechaEstatus");
            FechaEstatus.HasKey(e => e.Id);
            FechaEstatus.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            FechaEstatus.Property(e => e.Estatus).HasColumnName("Estatus").HasColumnType("varchar").HasMaxLength(50).IsRequired();



            var Horario = modelBuilder.Entity<Horario>();
            Horario.ToTable("FechaEstatus");
            Horario.HasKey(e => e.Id);
            Horario.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            Horario.Property(e => e.HoraDesde).HasColumnName("HoraDesde").HasColumnType("DateTime").IsRequired();
            Horario.Property(e => e.HoraDesde).HasColumnName("HoraHasta").HasColumnType("DateTime").IsRequired();
            Horario.HasRequired(e => e.Medico);


            var Medico = modelBuilder.Entity<Medico>();
            Medico.ToTable("Medico");
            Medico.HasKey(e => e.Id);
            Medico.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            Medico.Property(e => e.Nombre).HasColumnName("Nombre").HasColumnType("varchar").HasMaxLength(50).IsRequired();
            Medico.HasRequired(e => e.EspecialidadId);


            var Paciente = modelBuilder.Entity<Paciente>();
            Paciente.ToTable("Paciente");
            Paciente.HasKey(e => e.Id);
            Paciente.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            Paciente.Property(e => e.Nombre).HasColumnName("Nombre").HasColumnType("varchar").HasMaxLength(50).IsRequired();
           



            var Pago = modelBuilder.Entity<Pago>();
            Pago.ToTable("Pago");
            Pago.HasKey(e => e.Id);
            Pago.Property(e => e.Id).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity).IsRequired();
            Pago.Property(e => e.Monto).HasColumnName("Monto").HasColumnType("Decimal").IsRequired();
            Pago.HasRequired(e => e.Cita);



            base.OnModelCreating(modelBuilder);
            

        }










    }

   
}
