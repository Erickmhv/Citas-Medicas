using CitasMedicas.Utils;
using CitasMedicas.View;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CitasMedicas
{
    public partial class LoginView : Form
    {
        public Util u = new Util();
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
            txtUser.BackColor = u.SecondaryColor; 
            pnlUser.BackColor = u.SecondaryColor;
            txtPassword.BackColor = u.ThirdColor; 
            pnlPassword.BackColor = u.ThirdColor;
        }   
        
        private void FocusPassword() 
        {
            ActiveControl = txtPassword;
            txtUser.BackColor = u.ThirdColor;
            pnlUser.BackColor = u.ThirdColor;
            txtPassword.BackColor = u.SecondaryColor;
            pnlPassword.BackColor = u.SecondaryColor;
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
            pnlBienvenido.BackColor = u.PrimaryColor;

            lblBienvenido.Font = u.PrimaryFont16;
            lblBienvenido.ForeColor = u.SecondaryColor;

            lblCita.Font = u.PrimaryFont16;
            lblCita.ForeColor = u.SecondaryColor;

            lblDesarrollado.Font = u.PrimaryFont16;
            lblDesarrollado.ForeColor = u.SecondaryColor;

            lblErick.Font = u.PrimaryFont10;
            lblErick.ForeColor = u.SecondaryColor;

            lblDilenny.Font = u.PrimaryFont10;
            lblDilenny.ForeColor = u.SecondaryColor;

            btnX.Font = u.SecondaryFont16;
            btnX.ForeColor = u.PrimaryColor;

            lblLogin.ForeColor = u.PrimaryColor;
            lblLogin.Font = u.PrimaryFont16;

            pnlUser.BackColor = u.ThirdColor;

            pnlPassword.BackColor = u.ThirdColor;

            txtUser.Font = u.PrimaryFont10;
            txtUser.ForeColor = u.PrimaryColor;
            txtUser.BackColor = u.ThirdColor;

            txtPassword.Font = u.PrimaryFont10;
            txtPassword.ForeColor = u.PrimaryColor;
            txtPassword.BackColor = u.ThirdColor;

            btnLogin.BackColor = u.PrimaryColor;
            btnLogin.ForeColor = u.SecondaryColor;
            btnLogin.Font = u.PrimaryFont12;
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
            Hide();
            new MainView().Show();

        }
    }
}
