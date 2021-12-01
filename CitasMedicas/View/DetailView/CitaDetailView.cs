using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class CitaDetailView : Form
    {
        CitaRepositorio citaRepositorio = new CitaRepositorio();
        MedicoRepositorio medicoRepositorio = new MedicoRepositorio();
        PacienteRepositorio pacienteRepositorio = new PacienteRepositorio();

        public Cita cita;
        public CitaDetailView(int id)
        {
            InitializeComponent();

            if (id != 0)
            {
                cita = new Cita();
                cita = citaRepositorio.FindByID(id);
            }
        }

        private void CitaDetailView_Load(object sender, EventArgs e)
        {
            cbMedico.DataSource = medicoRepositorio.GetAll();
            cbMedico.DisplayMember = "NombreCompleto";
            cbMedico.ValueMember = "Id";
            cbPaciente.DataSource = pacienteRepositorio.GetAll();
            cbPaciente.DisplayMember = "Nombre";
            cbPaciente.ValueMember = "Id";
            if (cita == null)
            {
                cbMedico.SelectedItem = null;
                cbPaciente.SelectedItem = null;
            }
            else
            {
                txtDetalle.Text = cita.Detalle;
                txtNotas.Text = cita.Notas;
                dtFecha.Value = cita.Fecha;
                cbPaciente.SelectedValue = cita.PacienteId;
                cbMedico.SelectedValue = cita.MedicoId;
                txtPrecio.Text = cita.Precio.ToString();
                txtPagado.Text = cita.Pagado.ToString();
                Calcular();

            }

        }

        private void txtPrecio_TextChanged(object sender, EventArgs e)
        {
            Calcular();
        }

        public void Calcular()
        {
            double.TryParse(txtPrecio.Text, out double precio);
            double.TryParse(txtPagado.Text, out double pagado);

            string devuelta = Convert.ToString(precio - pagado);
            txtDevuelta.Text = devuelta;
        }

        private void txtPagado_TextChanged(object sender, EventArgs e)
        {
            Calcular();
        }
    }
}
