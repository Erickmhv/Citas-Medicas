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
    public partial class MedicoDetailView : Form
    {
        public MedicoRepositorio medicoRepositorio = new MedicoRepositorio();
        public EspecialidadRepositorio especialidadRepositorio = new EspecialidadRepositorio();
        public Medico medico = new Medico();
        public MedicoDetailView(int id)
        {
            InitializeComponent();
            medico = medicoRepositorio.FindByID(id);

            Cargar();
        }

        internal void Cargar()
        {

            cbEspecialidades.DataSource = especialidadRepositorio.GetAll();
            cbEspecialidades.DisplayMember = "NombreCompleto";
            cbEspecialidades.ValueMember = "Id";

            if (medico != null)
            {
                txtCedula.Text = medico.Cedula;
                txtNombre.Text = medico.Nombre;
                txtApellido.Text = medico.Apellido;
                txtCorreo.Text = medico.Correo;
                txtTelefono.Text = medico.Telefono;
                dtNacimiento.Value = medico.FechaNacimiento;
                cbEspecialidades.SelectedValue = medico.EspecialidadId;

            }
            else 
            {
                cbEspecialidades.SelectedItem = null;
                txtCedula.Text = "";
                txtNombre.Text = "";
                txtApellido.Text = "";
                txtCorreo.Text = "";
                txtTelefono.Text = "";
                dtNacimiento.Value = DateTime.Now;
            }
        }
    }
}
