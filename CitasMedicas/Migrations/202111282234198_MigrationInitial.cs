namespace CitasMedicas.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class MigrationInitial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Cita",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Detalle = c.String(nullable: false, maxLength: 50, unicode: false),
                        Notas = c.String(),
                        Precio = c.Decimal(nullable: false, precision: 18, scale: 2),
                        PacienteId = c.Int(nullable: false),
                        EstatusCita = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Medico", t => t.Id)
                .ForeignKey("dbo.Paciente", t => t.PacienteId)
                .Index(t => t.Id)
                .Index(t => t.PacienteId);
            
            CreateTable(
                "dbo.FechaEstatus",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FechaRegistro = c.DateTime(nullable: false),
                        FechaModificacion = c.DateTime(nullable: false),
                        Estatus = c.String(nullable: false, maxLength: 50, unicode: false),
                        Borrado = c.Boolean(nullable: false),
                        HoraHasta = c.DateTime(),
                        HoraHasta1 = c.DateTime(),
                        Discriminator = c.String(maxLength: 128),
                        Medico_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Medico", t => t.Medico_Id)
                .Index(t => t.Medico_Id);
            
            CreateTable(
                "dbo.Especialidad",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        FechaEstatus_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.FechaEstatus", t => t.FechaEstatus_Id)
                .Index(t => t.FechaEstatus_Id);
            
            CreateTable(
                "dbo.Medico",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        EspecialidadId_Id = c.String(nullable: false, maxLength: 128),
                        Cedula = c.String(),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        Apellido = c.String(),
                        Correo = c.String(),
                        Telefono = c.String(),
                        FechaNacimiento = c.DateTime(nullable: false),
                        Direccion = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.FechaEstatus", t => t.Id)
                .ForeignKey("dbo.Especialidad", t => t.EspecialidadId_Id)
                .Index(t => t.Id)
                .Index(t => t.EspecialidadId_Id);
            
            CreateTable(
                "dbo.Paciente",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        Apellido = c.String(),
                        Correo = c.String(),
                        Telefono = c.String(),
                        FechaNacimiento = c.DateTime(nullable: false),
                        Direccion = c.String(),
                        Enfermedad = c.String(),
                        Sintomas = c.String(),
                        Medicamentos = c.String(),
                        Alergias = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.FechaEstatus", t => t.Id)
                .Index(t => t.Id);
            
            CreateTable(
                "dbo.Pago",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        Cita_Id = c.Int(nullable: false),
                        Usuario_Id = c.Int(),
                        Monto = c.Decimal(nullable: false, precision: 18, scale: 2),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.FechaEstatus", t => t.Id)
                .ForeignKey("dbo.Cita", t => t.Cita_Id, cascadeDelete: true)
                .ForeignKey("dbo.Usuario", t => t.Usuario_Id)
                .Index(t => t.Id)
                .Index(t => t.Cita_Id)
                .Index(t => t.Usuario_Id);
            
            CreateTable(
                "dbo.Usuario",
                c => new
                    {
                        Id = c.Int(nullable: false),
                        Clave = c.String(),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        Apellido = c.String(nullable: false, maxLength: 50, unicode: false),
                        Telefono = c.String(),
                        Cedula = c.String(),
                        FechaNacimiento = c.String(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.FechaEstatus", t => t.Id)
                .Index(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Usuario", "Id", "dbo.FechaEstatus");
            DropForeignKey("dbo.Pago", "Usuario_Id", "dbo.Usuario");
            DropForeignKey("dbo.Pago", "Cita_Id", "dbo.Cita");
            DropForeignKey("dbo.Pago", "Id", "dbo.FechaEstatus");
            DropForeignKey("dbo.Paciente", "Id", "dbo.FechaEstatus");
            DropForeignKey("dbo.Medico", "EspecialidadId_Id", "dbo.Especialidad");
            DropForeignKey("dbo.Medico", "Id", "dbo.FechaEstatus");
            DropForeignKey("dbo.Cita", "PacienteId", "dbo.Paciente");
            DropForeignKey("dbo.Cita", "Id", "dbo.Medico");
            DropForeignKey("dbo.Especialidad", "FechaEstatus_Id", "dbo.FechaEstatus");
            DropForeignKey("dbo.FechaEstatus", "Medico_Id", "dbo.Medico");
            DropIndex("dbo.Usuario", new[] { "Id" });
            DropIndex("dbo.Pago", new[] { "Usuario_Id" });
            DropIndex("dbo.Pago", new[] { "Cita_Id" });
            DropIndex("dbo.Pago", new[] { "Id" });
            DropIndex("dbo.Paciente", new[] { "Id" });
            DropIndex("dbo.Medico", new[] { "EspecialidadId_Id" });
            DropIndex("dbo.Medico", new[] { "Id" });
            DropIndex("dbo.Especialidad", new[] { "FechaEstatus_Id" });
            DropIndex("dbo.FechaEstatus", new[] { "Medico_Id" });
            DropIndex("dbo.Cita", new[] { "PacienteId" });
            DropIndex("dbo.Cita", new[] { "Id" });
            DropTable("dbo.Usuario");
            DropTable("dbo.Pago");
            DropTable("dbo.Paciente");
            DropTable("dbo.Medico");
            DropTable("dbo.Especialidad");
            DropTable("dbo.FechaEstatus");
            DropTable("dbo.Cita");
        }
    }
}
