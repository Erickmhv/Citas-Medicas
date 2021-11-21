using CitasMedicas.Utils;
using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class MainView : Form
    {
        public class Prueba
        {
            public string Nombre { get; set; }
        }
        public MainView()
        {
            InitializeComponent();
        }

        private void MainView_Load(object sender, EventArgs e)
        {
            CargarDiseno();
        }

        private void CargarDiseno()
        {

            btnNuevo.Font = Util.SecondaryFont(12);
            btnNuevo.ForeColor = Util.PrimaryColor;
            btnNuevo.BackColor = Util.SecondaryColor;      
            
            btnEditar.Font = Util.SecondaryFont(12);
            btnEditar.ForeColor = Util.PrimaryColor;
            btnEditar.BackColor = Util.SecondaryColor;      
            
            btnEliminar.Font = Util.SecondaryFont(12);
            btnEliminar.ForeColor = Util.PrimaryColor;
            btnEliminar.BackColor = Util.SecondaryColor;

            BackColor = Util.SecondaryColor;

            pnlMenu.BackColor = Util.PrimaryColor;
            pnlTop.BackColor = Util.ThirdColor;

            btnX.Font = Util.SecondaryFont(16);
            btnX.ForeColor = Util.PrimaryColor;

            btnCita.Font = Util.PrimaryFont(10);
            btnCita.ForeColor = Util.PrimaryColor;
            btnCita.BackColor = Util.SecondaryColor;

            btnPago.Font = Util.PrimaryFont(10);
            btnPago.ForeColor = Util.PrimaryColor;
            btnPago.BackColor = Util.SecondaryColor;

            btnPaciente.Font = Util.PrimaryFont(10);
            btnPaciente.ForeColor = Util.PrimaryColor;
            btnPaciente.BackColor = Util.SecondaryColor;

            btnMedico.Font = Util.PrimaryFont(10);
            btnMedico.ForeColor = Util.PrimaryColor;
            btnMedico.BackColor = Util.SecondaryColor;

            btnUsuario.Font = Util.PrimaryFont(10);
            btnUsuario.ForeColor = Util.PrimaryColor;
            btnUsuario.BackColor = Util.SecondaryColor;

            btnEspecialidad.Font = Util.PrimaryFont(10);
            btnEspecialidad.ForeColor = Util.PrimaryColor;
            btnEspecialidad.BackColor = Util.SecondaryColor;

            btnHorario.Font = Util.PrimaryFont(10);
            btnHorario.ForeColor = Util.PrimaryColor;
            btnHorario.BackColor = Util.SecondaryColor;

            btnLogout.Font = Util.PrimaryFont(10);
            btnLogout.ForeColor = Util.PrimaryColor;
            btnLogout.BackColor = Util.SecondaryColor;

            btnSalir.Font = Util.PrimaryFont(10);
            btnSalir.ForeColor = Util.PrimaryColor;
            btnSalir.BackColor = Util.SecondaryColor;
        }

        private void btnX_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void btnSalir_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void btnLogout_Click(object sender, EventArgs e)
        {
            Close();
            new LoginView().Show();
        }

        public void Cargar(List<object> t, string nombre)
        {
            if (pnlMain.Controls.Count > 0)
                pnlMain.Controls.RemoveAt(0);

            ListView listView = new ListView();
            listView.TopLevel = false;
            listView.Dock = DockStyle.Fill;
            listView.Name = nombre;
            pnlMain.Controls.Add(listView);
            listView.dgv.DataSource = t;
            listView.Show();

        }

        private void btnCita_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Cita" } };
            Cargar(list, "Cita");
        }

        private void btnPago_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Pago" } };
            Cargar(list, "Pago");
        }

        private void btnPaciente_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Paciente" } };
            Cargar(list, "Paciente");
        }

        private void btnMedico_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Medico" } };
            Cargar(list, "Medico");
        }

        private void btnUsuario_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Usuario" } };
            Cargar(list, "Usuario");
        }

        private void btnEspecialidad_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Especialidad" } };
            Cargar(list, "Especialidad");
        }

        private void btnHorario_Click(object sender, EventArgs e)
        {
            List<object> list = new List<object>() { new Prueba { Nombre = "Horario" } };
            Cargar(list, "Horario");
        }

        private void btnNuevo_Click(object sender, EventArgs e)
        {
            if (pnlMain.Controls.Count > 0)
            {
                foreach (ListView p in pnlMain.Controls)
                {
                    switch (p.Name)
                    {
                        case "Cita":
                            new CitaDetailView().Show();
                            break;

                        case "Pago":
                            new PagoDetailView().Show();
                            break;

                        case "Paciente":
                            new PacienteDetailView().Show();
                            break; 
                        
                        case "Medico":
                            new MedicoDetailView().Show();
                            break;

                        case "Usuario":
                            new UsuarioDetailView().Show();
                            break;

                        case "Especialidad":
                            new EspecialidadDetailView().Show();
                            break;
                       
                        case "Horario":
                            new HorarioDetailView().Show();
                            break;

                        default:
                            break;
                    }
                }
            }
        }

        private void btnEditar_Click(object sender, EventArgs e)
        {

        }

        private void btnEliminar_Click(object sender, EventArgs e)
        {

        }
    }
}
