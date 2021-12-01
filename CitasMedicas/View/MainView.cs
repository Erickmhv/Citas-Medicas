using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using CitasMedicas.Utils;
using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class MainView : Form
    {
        UsuarioRepositorio usuarioRepositorio = new UsuarioRepositorio();
        CitaRepositorio citaRepositorio = new CitaRepositorio();
        HorarioRepositorio horarioRepositorio = new HorarioRepositorio();
        MedicoRepositorio medicoRepositorio = new MedicoRepositorio();
        PacienteRepositorio pacienteRepositorio = new PacienteRepositorio();
        EspecialidadRepositorio especialidadRepositorio = new EspecialidadRepositorio();
        PagoRepositorio pagoRepositorio = new PagoRepositorio();

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
            pbHospital.Image = Util.CambiarImagenColor("Hospital.png", Util.SecondaryColor);

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

        public void CargarListView<T>(List<T> t, string nombre)
        {
            if (pnlMain.Controls.Count > 0)
                pnlMain.Controls.RemoveAt(0);

            ListView listView = new ListView();


            listView.TopLevel = false;
            listView.Dock = DockStyle.Fill;
            listView.Text = nombre;
            listView.Name = "dgv";
            pnlMain.Controls.Add(listView);
            listView.dgv.DataSource = t;
            
            listView.dgv.Columns["FechaRegistro"].Visible = false;
            listView.dgv.Columns["FechaModificacion"].Visible = false;
            listView.dgv.Columns["Borrado"].Visible = false;
            listView.dgv.Columns["Estatus"].Visible = false;
            listView.dgv.Columns["UsuarioRegistro"].Visible = false;
            listView.dgv.Columns["UsuarioModifico"].Visible = false;  
            listView.dgv.Columns["UsuarioRegistroId"].Visible = false;
            listView.dgv.Columns["UsuarioModificoId"].Visible = false;

            switch (nombre)
            {
                case "Cita":
                    listView.dgv.Columns["Medico"].Visible = false;
                    listView.dgv.Columns["MedicoId"].Visible = false;
                    listView.dgv.Columns["Paciente"].Visible = false;
                    listView.dgv.Columns["PacienteId"].Visible = false;
                    break;

                case "Horario":
                    listView.dgv.Columns["Medico"].Visible = false;
                    listView.dgv.Columns["MedicoId"].Visible = false;
                    listView.dgv.Columns["HoraDesde"].DefaultCellStyle.Format = "hh:mm tt";
                    listView.dgv.Columns["HoraHasta"].DefaultCellStyle.Format = "hh:mm tt";

                    break;

                case "Medico":
                    listView.dgv.Columns["Especialidad"].Visible = false;
                    listView.dgv.Columns["EspecialidadId"].Visible = false;
                    break;

                default:
                    break;
            }

            listView.Show();

        }

        public void CargarDetailView(Form detailView,MainView mainView,string nombre, int id)
        {

            var detailGenericoView = new DetailView(mainView);

            switch (nombre)
            {
                case "Cita":
                    detailGenericoView.CitaActual = citaRepositorio.FindByID(id);
                    break;

                case "Paciente":
                    detailGenericoView.PacienteActual = pacienteRepositorio.FindByID(id);
                    break;

                case "Medico":
                    detailGenericoView.MedicoActual = medicoRepositorio.FindByID(id);
                    break;

                case "Usuario":
                    detailGenericoView.UsuarioActual = usuarioRepositorio.FindByID(id);
                    break;

                case "Especialidad":
                    detailGenericoView.EspecialidadActual = especialidadRepositorio.FindByID(id);
                    break;

                case "Horario":
                    detailGenericoView.HorarioActual = horarioRepositorio.FindByID(id);
                    break;

                default:
                    break;
            }

            detailGenericoView.Text = nombre;
            //detailGenericoView.Size = detailView.Size;

            detailView.TopLevel = false;
            detailView.AutoScroll = true;
            detailView.Dock = DockStyle.Fill;
            detailGenericoView.pnl.Controls.Add(detailView);

            detailView.Visible = true;
            detailGenericoView.Show();

        }

        public void CargarDetailsView(int id)
        {
            if (pnlMain.Controls.Count > 0)
            {
                foreach (ListView p in pnlMain.Controls)
                {
                    switch (p.Text)
                    {
                        case "Cita":
                            CargarDetailView(new CitaDetailView(id), this,p.Text,id);
                            break;

                        //case "Pago":
                        //    CargarDetailView(new PagoDetailView());
                        //    break;

                        case "Paciente":
                            CargarDetailView(new PacienteDetailView(id), this, p.Text, id);
                            break;

                        case "Medico":
                            CargarDetailView(new MedicoDetailView(id), this, p.Text, id);
                            break;

                        case "Usuario":
                            CargarDetailView(new UsuarioDetailView(id), this, p.Text, id);
                            break;

                        case "Especialidad":
                            CargarDetailView(new EspecialidadDetailView(id), this, p.Text, id);
                            break;

                        case "Horario":
                            CargarDetailView(new HorarioDetailView(id), this, p.Text, id);
                            break;

                        default:
                            break;
                    }
                }
            }

        }

        private void btnCita_Click(object sender, EventArgs e)
        {
            List<Cita> list = citaRepositorio.GetAll();
            CargarListView(list, "Cita");
        }

        private void btnPago_Click(object sender, EventArgs e)
        {
            List<Pago> list = pagoRepositorio.GetAll();
            CargarListView(list, "Pago");
        }

        private void btnPaciente_Click(object sender, EventArgs e)
        {
            List<Paciente> list = pacienteRepositorio.GetAll();
            CargarListView(list, "Paciente");
        }

        private void btnMedico_Click(object sender, EventArgs e)
        {
            List<Medico> list = medicoRepositorio.GetAll();
            CargarListView(list, "Medico");
        }

        private void btnUsuario_Click(object sender, EventArgs e)
        {
            List<Usuario> list = usuarioRepositorio.GetAll();
            CargarListView(list, "Usuario");
        }

        private void btnEspecialidad_Click(object sender, EventArgs e)
        {
            List<Especialidad> list = especialidadRepositorio.GetAll();
            CargarListView(list, "Especialidad");
        }

        private void btnHorario_Click(object sender, EventArgs e)
        {
            List<Horario> list = horarioRepositorio.GetAll();
            CargarListView(list, "Horario");
        }

        private void btnNuevo_Click(object sender, EventArgs e)
        {
            CargarDetailsView(0);
        }

        private void btnEditar_Click(object sender, EventArgs e)
        {
            foreach (ListView p in pnlMain.Controls)
            {
                if (p.Name == "dgv")
                {
                    foreach (DataGridViewRow row in p.dgv.Rows)
                    {
                        if (row.Selected)
                        {
                            CargarDetailsView((int)row.Cells["Id"].Value);
                        }
                    }
                }
            }
        }

        private void btnEliminar_Click(object sender, EventArgs e)
        {
            foreach (ListView p in pnlMain.Controls)
            {
                if (p.Name == "dgv")
                {
                    foreach (DataGridViewRow row in p.dgv.Rows)
                    {
                        if (row.Selected)
                        {
                            Borrar((int)row.Cells["Id"].Value, p.Text);
                        }
                    }
                }
            }
        }

        private void Borrar(int id, string nombre)
        {
            switch (nombre)
            {
                case "Cita":
                    citaRepositorio.Delete(citaRepositorio.FindByID(id));
                    CargarListView(citaRepositorio.GetAll(), "Cita");
                    break;   
                
                case "Especialidad":
                    especialidadRepositorio.Delete(especialidadRepositorio.FindByID(id));
                    CargarListView(especialidadRepositorio.GetAll(), "Especialidad");
                    break;
                     
                case "Horario":
                    horarioRepositorio.Delete(horarioRepositorio.FindByID(id));
                    CargarListView(horarioRepositorio.GetAll(), "Horario");
                    break;

                case "Paciente":
                    pacienteRepositorio.Delete(pacienteRepositorio.FindByID(id));
                    CargarListView(pacienteRepositorio.GetAll(), "Paciente");
                    break;

                case "Medico":
                    medicoRepositorio.Delete(medicoRepositorio.FindByID(id));
                    CargarListView(medicoRepositorio.GetAll(), "Medico");
                    break;

                case "Usuario":
                    usuarioRepositorio.Delete(usuarioRepositorio.FindByID(id));
                    CargarListView(usuarioRepositorio.GetAll(), "Usuario");
                    break;
                   
                default:
                    break;
            }
        }
    }
}
