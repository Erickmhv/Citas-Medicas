using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class HorarioDetailView : Form
    {
        MedicoRepositorio medicoRepositorio = new MedicoRepositorio();
        HorarioRepositorio horarioRepositorio = new HorarioRepositorio();
        public Horario horario = new Horario();
        public HorarioDetailView(int id)
        {
            InitializeComponent();
            horario = horarioRepositorio.FindByID(id);
        }

        private void HorarioDetailView_Load(object sender, EventArgs e)
        {
            Cargar();
        }

        public void Cargar()
        {
            cbMedico.DataSource = medicoRepositorio.GetAll();
            cbMedico.DisplayMember = "NombreCompleto";
            cbMedico.ValueMember = "Id";

            if (horario == null)
            {
                cbMedico.SelectedItem = null;
                dtDesde.Value = DateTime.Now;
                dtHasta.Value = DateTime.Now;
            }
            else 
            {
                cbMedico.SelectedItem = horario.MedicoId;
                dtDesde.Value = horario.HoraDesde;
                dtHasta.Value = horario.HoraHasta;
            }
        }
    }
}
