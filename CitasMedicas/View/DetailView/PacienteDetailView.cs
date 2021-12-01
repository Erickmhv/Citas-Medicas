using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using CitasMedicas.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class PacienteDetailView : Form
    {
        public PacienteRepositorio pacienteRepositorio = new PacienteRepositorio();
        public Paciente paciente = new Paciente();
        public PacienteDetailView(int id)
        {
            InitializeComponent();

            paciente = pacienteRepositorio.FindByID(id);

            if (paciente != null) 
            {
                txtNombre.Text = paciente.Nombre;
                txtApellido.Text = paciente.Apellido;
                txtCorreo.Text = paciente.Correo;
                txtTelefono.Text = paciente.Telefono;
                dtNacimiento.Value = paciente.FechaNacimiento;
                txtDireccion.Text = paciente.Direccion;
                txtEnfermedad.Text = paciente.Enfermedad;
                txtSintomas.Text = paciente.Sintomas;
                txtMedicamentos.Text = paciente.Medicamentos;
                txtAlergias.Text = paciente.Alergias;

            }
        }

    }
}
