using CitasMedicas.Datos.Entities;
using CitasMedicas.Interfaces;
using CitasMedicas.Repositorios;
using CitasMedicas.Utils;
using CitasMedicas.View;
using System;
using System.Linq;
using System.Windows.Forms;

namespace CitasMedicas
{
    public partial class LoginView : Form
    {
        UsuarioRepositorio usuarioRepositorio = new UsuarioRepositorio();

        public LoginView()
        {
            InitializeComponent();
        }

        private void btnX_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void txtUser_Click(object sender, EventArgs e)
        {
            FocusUser();
        }

        private void FocusUser()
        {
            ActiveControl = txtUser;
            txtUser.BackColor = Util.SecondaryColor;
            pnlUser.BackColor = Util.SecondaryColor;
            txtPassword.BackColor = Util.ThirdColor;
            pnlPassword.BackColor = Util.ThirdColor;
        }

        private void FocusPassword()
        {
            ActiveControl = txtPassword;
            txtUser.BackColor = Util.ThirdColor;
            pnlUser.BackColor = Util.ThirdColor;
            txtPassword.BackColor = Util.SecondaryColor;
            pnlPassword.BackColor = Util.SecondaryColor;
        }

        private void txtPassword_Click(object sender, EventArgs e)
        {
            FocusPassword();
        }

        private void LoginView_Load(object sender, EventArgs e)
        {
            CargarDiseno();
            FocusUser();
        }

        private void CargarDiseno()
        {
            pbLogin.Image = Util.CambiarImagenColor("Login.png", Util.SecondaryColor);
            pbUser.Image = Util.CambiarImagenColor("User.png", Util.PrimaryColor);
            pbPassword.Image = Util.CambiarImagenColor("Password.png", Util.PrimaryColor);

            pnlBienvenido.BackColor = Util.PrimaryColor;

            lblBienvenido.Font = Util.PrimaryFont(16);
            lblBienvenido.ForeColor = Util.SecondaryColor;

            lblCita.Font = Util.PrimaryFont(16);
            lblCita.ForeColor = Util.SecondaryColor;

            lblDesarrollado.Font = Util.PrimaryFont(16);
            lblDesarrollado.ForeColor = Util.SecondaryColor;

            lblErick.Font = Util.PrimaryFont(10);
            lblErick.ForeColor = Util.SecondaryColor;

            lblDilenny.Font = Util.PrimaryFont(10);
            lblDilenny.ForeColor = Util.SecondaryColor;

            btnX.Font = Util.SecondaryFont(16);
            btnX.ForeColor = Util.PrimaryColor;

            lblLogin.ForeColor = Util.PrimaryColor;
            lblLogin.Font = Util.PrimaryFont(16);

            pnlUser.BackColor = Util.ThirdColor;

            pnlPassword.BackColor = Util.ThirdColor;

            txtUser.Font = Util.PrimaryFont(10);
            txtUser.ForeColor = Util.PrimaryColor;
            txtUser.BackColor = Util.ThirdColor;

            txtPassword.Font = Util.PrimaryFont(10);
            txtPassword.ForeColor = Util.PrimaryColor;
            txtPassword.BackColor = Util.ThirdColor;

            btnLogin.BackColor = Util.PrimaryColor;
            btnLogin.ForeColor = Util.SecondaryColor;
            btnLogin.Font = Util.PrimaryFont(12);
        }

        private void pnlUser_Click(object sender, EventArgs e)
        {
            FocusUser();
        }

        private void pnlPassword_Click(object sender, EventArgs e)
        {
            FocusPassword();
        }

        private void btnLogin_Click(object sender, EventArgs e)
        {
            btnLogin.Enabled = false;
            if (usuarioRepositorio.GetAll().Count == 0)
            {
                Usuario usuario = new Usuario();

                usuario.Nombre = "Admin";
                usuario.Apellido = "Admin";
                usuario.NombreUsuario = "";
                usuario.Clave = "";
                usuario.Estatus = "A";
                usuario.FechaRegistro = DateTime.Now;
                usuario.Borrado = 0;

                try
                {
                    usuarioRepositorio.Create(usuario);
                }
                catch (Exception)
                {
                    MessageBox.Show($"No se pudo crear el usuario {usuario.Nombre}");
                    btnLogin.Enabled = true;
                }
            }

            var a = usuarioRepositorio.GetAll().FirstOrDefault();

            var u = usuarioRepositorio.FindByLogin(txtUser.Text, txtPassword.Text);

            if (u != null)
            {
                Utils.Util.UsuarioActual = u;
                Hide();
                var mainView = new MainView();
                Util.CreateTimer(false, mainView, new Timer());
                mainView.Show();
            }
            else
            {
                MessageBox.Show("Usuario o contraseña incorrecta");
            }
            btnLogin.Enabled = true;
        }
    }
}