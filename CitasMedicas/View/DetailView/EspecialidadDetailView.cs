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
    public partial class EspecialidadDetailView : Form
    {
        EspecialidadRepositorio especialidadRepositorio = new EspecialidadRepositorio();
        MedicoRepositorio medicoRepositorio = new MedicoRepositorio();

        public Especialidad especialidad;

        public EspecialidadDetailView(int id)
        {
            InitializeComponent();

            if (id != 0)
            {
                especialidad = new Especialidad();
                especialidad = especialidadRepositorio.FindByID(id);
            }
            Cargar();
        }

        public void Cargar() 
        {
            cbMedico.DataSource = medicoRepositorio.GetAll();
            cbMedico.DisplayMember = "NombreCompleto";
            cbMedico.ValueMember = "Id";

            if (especialidad == null) { 
                txtNombre.Text = "";
                //cbMedico.SelectedItem = null;
            }
            else
            {
                txtNombre.Text = especialidad.Nombre;
                //cbMedico.SelectedValue = especialidad.MedicoId;
            }
        }
    }
}
