using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using CitasMedicas.Utils;
using System;
using System.Linq;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class DetailView : Form
    {
        public Cita CitaActual { get; set; }
        public Paciente PacienteActual { get; set; }
        public Medico MedicoActual { get; set; }
        public Usuario UsuarioActual { get; set; }
        public Horario HorarioActual { get; set; }
        public Pago PagoActual { get; set; }
        public Especialidad EspecialidadActual { get; set; }

        UsuarioRepositorio usuarioRepositorio = new UsuarioRepositorio();
        CitaRepositorio citaRepositorio = new CitaRepositorio();
        HorarioRepositorio horarioRepositorio = new HorarioRepositorio();
        MedicoRepositorio medicoRepositorio = new MedicoRepositorio();
        PacienteRepositorio pacienteRepositorio = new PacienteRepositorio();
        EspecialidadRepositorio especialidadRepositorio = new EspecialidadRepositorio();
        PagoRepositorio pagoRepositorio = new PagoRepositorio();

        public MainView MainView { get; set; }

        public DetailView(MainView mainView)
        {
            InitializeComponent();

            MainView = mainView;

            btnSalvar.Font = Util.SecondaryFont(12);
            btnSalvar.ForeColor = Util.PrimaryColor;
            btnSalvar.BackColor = Util.SecondaryColor;

            btnSalvarCerrar.Font = Util.SecondaryFont(12);
            btnSalvarCerrar.ForeColor = Util.PrimaryColor;
            btnSalvarCerrar.BackColor = Util.SecondaryColor;

            btnSalvarNuevo.Font = Util.SecondaryFont(12);
            btnSalvarNuevo.ForeColor = Util.PrimaryColor;
            btnSalvarNuevo.BackColor = Util.SecondaryColor;
        }

        private void btnSalvar_Click(object sender, EventArgs e)
        {
            Salvar();
        }

        private void btnSalvarNuevo_Click(object sender, EventArgs e)
        {
            //CitaActual = null;
            //PacienteActual = null;
            //MedicoActual = null;
            //UsuarioActual = null;
            //HorarioActual = null;
            //EspecialidadActual = null;

            //Salvar(false);
        }

        private void btnSalvarCerrar_Click(object sender, EventArgs e)
        {
            //Salvar(true);
        }

        private void Salvar()
        {
            string detail = pnl.Controls.OfType<Form>().FirstOrDefault().Name;

            if (!string.IsNullOrEmpty(detail))
            {
                DialogResult dialogResult;
                switch (detail)
                {

                    case "CitaDetailView":

                        citaRepositorio = new CitaRepositorio();

                        CitaDetailView citaDetailView = pnl.Controls.OfType<CitaDetailView>().FirstOrDefault();

                        if (citaDetailView.cbMedico.SelectedItem == null || citaDetailView.cbPaciente.SelectedItem == null)
                        {
                            MessageBox.Show("El usuario o el Medico no pueden estar vacios");
                            break;
                        }

                        if (string.IsNullOrEmpty(citaDetailView.txtDetalle.Text))
                        {
                            MessageBox.Show("El detalle no puede estar vacio");
                            break;
                        }

                        if (string.IsNullOrEmpty(citaDetailView.txtPagado.Text))
                        {
                            MessageBox.Show("El pago no puede estar vacio");
                            break;
                        }

                        Cita cita = null;

                        if (cita == null && CitaActual == null)
                        {
                            cita = new Cita();
                        }
                        else
                        {
                            cita = citaRepositorio.FindByID(CitaActual.Id);
                        }


                        cita.Detalle = citaDetailView.txtDetalle.Text;
                        cita.Notas = citaDetailView.txtNotas.Text;
                        cita.Fecha = citaDetailView.dtFecha.Value;
                        cita.Precio = Convert.ToDecimal(citaDetailView.txtPrecio.Text);
                        cita.Pagado = Convert.ToDecimal(citaDetailView.txtPagado.Text);
                        cita.Paciente = pacienteRepositorio.FindByID(Convert.ToInt32(citaDetailView.cbPaciente.SelectedValue.ToString()));
                        cita.Medico = medicoRepositorio.FindByID(Convert.ToInt32(citaDetailView.cbMedico.SelectedValue.ToString()));
                        //cita.EstatusCita = citaDetailView.EstatusCita;

                        if (CitaActual == null)
                        {
                            try
                            {
                                citaRepositorio.Create(cita);
                            }
                            catch (Exception)
                            {
                                MessageBox.Show("La cita no fue creada.");
                            }
                        }
                        else
                        {
                            try
                            {
                                citaRepositorio.Update(cita);
                                CitaActual = cita;
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La cita no fue modificada.");
                                break;
                            }
                        }

                        MessageBox.Show($"Cita {(CitaActual == null ? "creada" : "modificada")} exitosamente");
                        Close();

                        break;

                    //case "PagoDetailView":
                    //    detail = "";
                    //    break;

                    case "PacienteDetailView":

                        PacienteDetailView pacienteDetailView = pnl.Controls.OfType<PacienteDetailView>().FirstOrDefault();

                        if (string.IsNullOrEmpty(pacienteDetailView.txtNombre.Text))
                        {
                            MessageBox.Show("El nombre no puede estar vacio");
                            break;
                        }

                        pacienteRepositorio = new PacienteRepositorio();

                        Paciente paciente = null;
                        string medicoid = "";

                        if (paciente == null && PacienteActual == null)
                        {
                            paciente = new Paciente();
                        }
                        else
                        {
                            paciente = pacienteRepositorio.FindByID(PacienteActual.Id);
                        }



                        paciente.Nombre = pacienteDetailView.txtNombre.Text;
                        paciente.Apellido = pacienteDetailView.txtApellido.Text;
                        paciente.FechaNacimiento = pacienteDetailView.dtNacimiento.Value;
                        //paciente.Genero = Convert.ToDecimal(pacienteDetailView.txtPrecio.Text);
                        paciente.Direccion = pacienteDetailView.txtDireccion.Text;
                        paciente.Enfermedad = pacienteDetailView.txtEnfermedad.Text;
                        paciente.Sintomas = pacienteDetailView.txtSintomas.Text;
                        paciente.Medicamentos = pacienteDetailView.txtMedicamentos.Text;
                        paciente.Alergias = pacienteDetailView.txtAlergias.Text;

                        if (PacienteActual == null)
                        {
                            try
                            {
                                pacienteRepositorio.Create(paciente);
                                PacienteActual = paciente;
                            }
                            catch (Exception)
                            {
                                MessageBox.Show("La paciente no fue creada.");
                            }
                        }
                        else
                        {
                            try
                            {
                                pacienteRepositorio.Update(paciente);
                                PacienteActual = paciente;
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La paciente no fue modificada.");
                                break;
                            }
                        }

                        MessageBox.Show($"Paciente {(PacienteActual == null ? "creada" : "modificada")}");
                        Close();

                        break;

                    case "MedicoDetailView":

                        MedicoDetailView medicoDetailView = pnl.Controls.OfType<MedicoDetailView>().FirstOrDefault();

                        if (medicoDetailView.cbEspecialidades.SelectedValue == null)
                        {
                            MessageBox.Show("La especialidad no puede estar vacia");
                            break;
                        }

                        if (string.IsNullOrEmpty(medicoDetailView.txtNombre.Text))
                        {
                            MessageBox.Show("El nombre no puede estar vacio");
                            break;
                        }


                        medicoRepositorio = new MedicoRepositorio();

                        Medico medico = null;

                        if (medico == null && MedicoActual == null)
                        {
                            medico = new Medico();
                        }
                        else
                        {
                            medico = medicoRepositorio.FindByID(MedicoActual.Id);
                        }



                        medico.Cedula = medicoDetailView.txtCedula.Text;
                        medico.Nombre = medicoDetailView.txtNombre.Text;
                        medico.Apellido = medicoDetailView.txtApellido.Text;
                        medico.Correo = medicoDetailView.txtCorreo.Text;
                        medico.Telefono = medicoDetailView.txtTelefono.Text;
                        medico.FechaNacimiento = medicoDetailView.dtNacimiento.Value;
                        //medico.Genero = Convert.ToDecimal(medicoDetailView.txtPrecio.Text);
                        medico.Direccion = medicoDetailView.txtDireccion.Text;

                        var especialidadid = medicoDetailView.cbEspecialidades.SelectedValue.ToString();
                        medico.EspecialidadId = especialidadRepositorio.FindByID(Convert.ToInt32(especialidadid)).Id;
                        //medico.Especialidades

                        if (MedicoActual == null)
                        {
                            try
                            {
                                medicoRepositorio.Create(medico);
                                MedicoActual = medico;
                            }
                            catch (Exception ex)
                            {
                                var e = ex.ToString();
                                MessageBox.Show("La medico no fue creada.");
                                break;
                            }
                        }
                        else
                        {
                            try
                            {
                                medicoRepositorio.Update(medico);
                                MedicoActual = medico;
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La medico no fue modificada.");
                                break;
                            }
                        }


                        MessageBox.Show($"Medico {(MedicoActual == null ? "creada" : "modificada")}");

                        Close();

                        break;

                    case "UsuarioDetailView":

                        UsuarioDetailView usuarioDetailView = pnl.Controls.OfType<UsuarioDetailView>().FirstOrDefault();

                        if (string.IsNullOrEmpty(usuarioDetailView.txtNombreUsuario.Text) || string.IsNullOrEmpty(usuarioDetailView.txtClave.Text))
                        {
                            MessageBox.Show("El nombre de Usuario o la clave estan vacios");
                            break;
                        }

                        usuarioRepositorio = new UsuarioRepositorio();

                        Usuario usuario = null;

                        if (usuario == null && UsuarioActual == null)
                        {
                            usuario = new Usuario();
                        }
                        else
                        {
                            usuario = usuarioRepositorio.FindByID(UsuarioActual.Id);
                        }



                        usuario.Nombre = usuarioDetailView.txtNombre.Text;
                        usuario.Apellido = usuarioDetailView.txtApellido.Text;
                        usuario.Clave = usuarioDetailView.txtClave.Text;
                        usuario.NombreUsuario = usuarioDetailView.txtClave.Text;

                        if (UsuarioActual == null)
                        {
                            try
                            {
                                usuarioRepositorio.Create(usuario);
                                UsuarioActual = usuario;
                            }
                            catch (Exception)
                            {
                                MessageBox.Show("La usuario no fue creada.");
                            }
                        }
                        else
                        {
                            try
                            {
                                usuarioRepositorio.Update(usuario);
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La usuario no fue modificada.");
                                break;
                            }
                        }


                        MessageBox.Show($"Usuario {(UsuarioActual == null ? "creada" : "modificada")}");

                        Close();

                        break;

                    case "EspecialidadDetailView":

                        EspecialidadDetailView especialidadDetailView = pnl.Controls.OfType<EspecialidadDetailView>().FirstOrDefault();

                        //if (especialidadDetailView.cbMedico.SelectedValue == null)
                        //{
                        //    MessageBox.Show("Medico no puede estar vacio");
                        //    break;
                        //}

                        if (string.IsNullOrEmpty(especialidadDetailView.txtNombre.Text))
                        {
                            MessageBox.Show("Nombre no puede estar vacio");
                            break;
                        }

                        especialidadRepositorio = new EspecialidadRepositorio();

                        Especialidad especialidad = null;

                        if (especialidad == null && EspecialidadActual == null)
                        {
                            especialidad = new Especialidad();
                        }
                        else
                        {
                            especialidad = especialidadRepositorio.FindByID(EspecialidadActual.Id);
                            EspecialidadActual = especialidad;
                        }



                        especialidad.Nombre = especialidadDetailView.txtNombre.Text;

                        //medicoid = especialidadDetailView.cbMedico.SelectedValue.ToString();
                        //especialidad.MedicoId = medicoRepositorio.FindByID(Convert.ToInt32(medicoid)).Id;

                        if (EspecialidadActual == null)
                        {
                            try
                            {
                                especialidadRepositorio.Create(especialidad);
                                EspecialidadActual = especialidad;
                            }
                            catch (Exception)
                            {
                                MessageBox.Show("La especialidad no fue creada.");
                            }
                        }
                        else
                        {
                            try
                            {
                                especialidadRepositorio.Update(especialidad);
                                EspecialidadActual = especialidad;
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La especialidad no fue modificada.");
                                break;
                            }
                        }


                        MessageBox.Show($"Especialidad {(EspecialidadActual == null ? "creada" : "modificada")}");

                        Close();

                        break;

                    case "HorarioDetailView":
                        HorarioDetailView horarioDetailView = pnl.Controls.OfType<HorarioDetailView>().FirstOrDefault();

                        if (horarioDetailView.cbMedico.SelectedValue == null)
                        {
                            MessageBox.Show("El medico no puede estar vacio");
                            break;
                        }

                        horarioRepositorio = new HorarioRepositorio();

                        Horario horario = null;

                        if (horario == null && HorarioActual == null)
                        {
                            horario = new Horario();
                        }
                        else
                        {
                            horario = horarioRepositorio.FindByID(HorarioActual.Id);
                        }

                        medicoid = horarioDetailView.cbMedico.SelectedValue.ToString();
                        horario.MedicoId = medicoRepositorio.FindByID(Convert.ToInt32(medicoid)).Id;

                        horario.HoraDesde = horarioDetailView.dtDesde.Value;
                        horario.HoraHasta = horarioDetailView.dtHasta.Value;

                        if (HorarioActual == null)
                        {
                            try
                            {
                                horarioRepositorio.Create(horario);
                                HorarioActual = horario;
                            }
                            catch (Exception)
                            {
                                MessageBox.Show("La horario no fue creada.");
                            }
                        }
                        else
                        {
                            try
                            {
                                horarioRepositorio.Update(horario);
                            }
                            catch (Exception ex)
                            {
                                var a = ex;
                                MessageBox.Show("La horario no fue modificada.");
                                break;
                            }
                        }

                        MessageBox.Show($"Horario {(HorarioActual == null ? "creada" : "modificada")} exitosamente");
                        Close();


                        break;

                    default:
                        break;
                }
            }
        }

        private void btnX_Click(object sender, EventArgs e)
        {
            timer1.Dispose();
            timer1 = new Timer();
            Util.CreateTimer(true, this, timer1);
        }

        private void CitaDetailView_Load(object sender, EventArgs e)
        {
            Util.CreateTimer(false, this, timer1);

            btnX.Font = Util.SecondaryFont(16);
            btnX.ForeColor = Util.PrimaryColor;
        }

        private void DetailView_FormClosed(object sender, FormClosedEventArgs e)
        {
            switch (Text)
            {
                case "Especialidad":
                    MainView.CargarListView(especialidadRepositorio.GetAll(), Text);
                    break;

                case "Cita":
                    MainView.CargarListView(citaRepositorio.GetAll(), Text);
                    break;

                case "Horario":
                    MainView.CargarListView(horarioRepositorio.GetAll(), Text);
                    break;

                case "Paciente":
                    MainView.CargarListView(pacienteRepositorio.GetAll(), Text);
                    break;

                case "Medico":
                    MainView.CargarListView(medicoRepositorio.GetAll(), Text);
                    break;

                case "Usuario":
                    MainView.CargarListView(usuarioRepositorio.GetAll(), Text);
                    break;

                default:
                    break;
            }

        }
    }
}
