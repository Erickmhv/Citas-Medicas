namespace CitasMedicas.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
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
                        Pagado = c.Decimal(nullable: false, precision: 18, scale: 2),
                        Fecha = c.DateTime(nullable: false),
                        PacienteId = c.Int(nullable: false),
                        MedicoId = c.Int(nullable: false),
                        EstatusCita = c.String(),
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                        UsuarioModifico_Id = c.Int(),
                        UsuarioRegistro_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Medico", t => t.MedicoId, cascadeDelete: true)
                .ForeignKey("dbo.Paciente", t => t.PacienteId, cascadeDelete: true)
                .ForeignKey("dbo.Usuario", t => t.UsuarioModifico_Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioRegistro_Id)
                .Index(t => t.PacienteId)
                .Index(t => t.MedicoId)
                .Index(t => t.UsuarioModifico_Id)
                .Index(t => t.UsuarioRegistro_Id);
            
            CreateTable(
                "dbo.Medico",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Cedula = c.String(),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        Apellido = c.String(),
                        Correo = c.String(),
                        Telefono = c.String(),
                        FechaNacimiento = c.DateTime(nullable: false),
                        Direccion = c.String(),
                        EspecialidadId = c.Int(nullable: false),
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                        UsuarioModifico_Id = c.Int(),
                        UsuarioRegistro_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Especialidad", t => t.EspecialidadId, cascadeDelete: true)
                .ForeignKey("dbo.Usuario", t => t.UsuarioModifico_Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioRegistro_Id)
                .Index(t => t.EspecialidadId)
                .Index(t => t.UsuarioModifico_Id)
                .Index(t => t.UsuarioRegistro_Id);
            
            CreateTable(
                "dbo.Especialidad",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                        UsuarioModifico_Id = c.Int(),
                        UsuarioRegistro_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioModifico_Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioRegistro_Id)
                .Index(t => t.UsuarioModifico_Id)
                .Index(t => t.UsuarioRegistro_Id);
            
            CreateTable(
                "dbo.Usuario",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        NombreUsuario = c.String(),
                        Clave = c.String(),
                        Nombre = c.String(nullable: false, maxLength: 50, unicode: false),
                        Apellido = c.String(nullable: false, maxLength: 50, unicode: false),
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Paciente",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
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
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                        UsuarioModifico_Id = c.Int(),
                        UsuarioRegistro_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioModifico_Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioRegistro_Id)
                .Index(t => t.UsuarioModifico_Id)
                .Index(t => t.UsuarioRegistro_Id);
            
            CreateTable(
                "dbo.Horario",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        HoraDesde = c.DateTime(nullable: false),
                        HoraHasta = c.DateTime(nullable: false),
                        MedicoId = c.Int(nullable: false),
                        FechaRegistro = c.DateTime(),
                        FechaModificacion = c.DateTime(),
                        Estatus = c.String(),
                        Borrado = c.Int(),
                        UsuarioModifico_Id = c.Int(),
                        UsuarioRegistro_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Medico", t => t.MedicoId, cascadeDelete: true)
                .ForeignKey("dbo.Usuario", t => t.UsuarioModifico_Id)
                .ForeignKey("dbo.Usuario", t => t.UsuarioRegistro_Id)
                .Index(t => t.MedicoId)
                .Index(t => t.UsuarioModifico_Id)
                .Index(t => t.UsuarioRegistro_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Horario", "UsuarioRegistro_Id", "dbo.Usuario");
            DropForeignKey("dbo.Horario", "UsuarioModifico_Id", "dbo.Usuario");
            DropForeignKey("dbo.Horario", "MedicoId", "dbo.Medico");
            DropForeignKey("dbo.Cita", "UsuarioRegistro_Id", "dbo.Usuario");
            DropForeignKey("dbo.Cita", "UsuarioModifico_Id", "dbo.Usuario");
            DropForeignKey("dbo.Cita", "PacienteId", "dbo.Paciente");
            DropForeignKey("dbo.Paciente", "UsuarioRegistro_Id", "dbo.Usuario");
            DropForeignKey("dbo.Paciente", "UsuarioModifico_Id", "dbo.Usuario");
            DropForeignKey("dbo.Cita", "MedicoId", "dbo.Medico");
            DropForeignKey("dbo.Medico", "UsuarioRegistro_Id", "dbo.Usuario");
            DropForeignKey("dbo.Medico", "UsuarioModifico_Id", "dbo.Usuario");
            DropForeignKey("dbo.Medico", "EspecialidadId", "dbo.Especialidad");
            DropForeignKey("dbo.Especialidad", "UsuarioRegistro_Id", "dbo.Usuario");
            DropForeignKey("dbo.Especialidad", "UsuarioModifico_Id", "dbo.Usuario");
            DropIndex("dbo.Horario", new[] { "UsuarioRegistro_Id" });
            DropIndex("dbo.Horario", new[] { "UsuarioModifico_Id" });
            DropIndex("dbo.Horario", new[] { "MedicoId" });
            DropIndex("dbo.Paciente", new[] { "UsuarioRegistro_Id" });
            DropIndex("dbo.Paciente", new[] { "UsuarioModifico_Id" });
            DropIndex("dbo.Especialidad", new[] { "UsuarioRegistro_Id" });
            DropIndex("dbo.Especialidad", new[] { "UsuarioModifico_Id" });
            DropIndex("dbo.Medico", new[] { "UsuarioRegistro_Id" });
            DropIndex("dbo.Medico", new[] { "UsuarioModifico_Id" });
            DropIndex("dbo.Medico", new[] { "EspecialidadId" });
            DropIndex("dbo.Cita", new[] { "UsuarioRegistro_Id" });
            DropIndex("dbo.Cita", new[] { "UsuarioModifico_Id" });
            DropIndex("dbo.Cita", new[] { "MedicoId" });
            DropIndex("dbo.Cita", new[] { "PacienteId" });
            DropTable("dbo.Horario");
            DropTable("dbo.Paciente");
            DropTable("dbo.Usuario");
            DropTable("dbo.Especialidad");
            DropTable("dbo.Medico");
            DropTable("dbo.Cita");
        }
    }
}
