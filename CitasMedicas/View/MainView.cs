using CitasMedicas.Utils;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class MainView : Form
    {
        public Util u = new Util();
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
            BackColor = u.SecondaryColor;

            pnlMenu.BackColor = u.PrimaryColor;
            pnlTop.BackColor = u.ThirdColor;

            btnX.Font = u.SecondaryFont16;
            btnX.ForeColor = u.PrimaryColor;

            btnCita.Font = u.PrimaryFont10;
            btnCita.ForeColor = u.PrimaryColor;
            btnCita.BackColor = u.SecondaryColor;

            btnPago.Font = u.PrimaryFont10;
            btnPago.ForeColor = u.PrimaryColor;
            btnPago.BackColor = u.SecondaryColor;

            btnPaciente.Font = u.PrimaryFont10;
            btnPaciente.ForeColor = u.PrimaryColor;
            btnPaciente.BackColor = u.SecondaryColor;

            btnMedico.Font = u.PrimaryFont10;
            btnMedico.ForeColor = u.PrimaryColor;
            btnMedico.BackColor = u.SecondaryColor;

            btnUsuario.Font = u.PrimaryFont10;
            btnUsuario.ForeColor = u.PrimaryColor;
            btnUsuario.BackColor = u.SecondaryColor;

            btnEspecialidad.Font = u.PrimaryFont10;
            btnEspecialidad.ForeColor = u.PrimaryColor;
            btnEspecialidad.BackColor = u.SecondaryColor;

            btnHorario.Font = u.PrimaryFont10;
            btnHorario.ForeColor = u.PrimaryColor;
            btnHorario.BackColor = u.SecondaryColor;

            btnLogout.Font = u.PrimaryFont10;
            btnLogout.ForeColor = u.PrimaryColor;
            btnLogout.BackColor = u.SecondaryColor;

            btnSalir.Font = u.PrimaryFont10;
            btnSalir.ForeColor = u.PrimaryColor;
            btnSalir.BackColor = u.SecondaryColor;
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

        public void Cargar()
        {
            if (pnlMain.Controls.Count > 0)
                pnlMain.Controls.RemoveAt(0);


            ListView listView = new ListView();
            listView.TopLevel = false;
            listView.Dock = DockStyle.Fill;
            pnlMain.Controls.Add(listView);
            listView.Show();

        }

        private void btnCita_Click(object sender, EventArgs e)
        {
            Cargar();
        }
    }
}
