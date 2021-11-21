using CitasMedicas.Utils;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class CitaDetailView : Form
    {
        public bool Cerrar { get; set; }
        public CitaDetailView()
        {
            InitializeComponent();

            btnSalvar.Font = Util.SecondaryFont(12);
            btnSalvar.ForeColor = Util.PrimaryColor;
            btnSalvar.BackColor = Util.SecondaryColor;
        }

        private void btnSalvar_Click(object sender, EventArgs e)
        {

        }

        private void btnX_Click(object sender, EventArgs e)
        {
            Cerrar = true;
            timer1.Start();
            //Close();
        }

        private void CitaDetailView_Load(object sender, EventArgs e)
        {
            Cerrar = false;
            Opacity = 0;
            timer1.Start();
            btnX.Font = Util.SecondaryFont(16);
            btnX.ForeColor = Util.PrimaryColor;
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            if (Cerrar)
            {
                if (Opacity > 0.0)
                {
                    Opacity -= 0.075;
                }
                else
                {
                    timer1.Stop();
                    Close();
                }
            }
            else 
            {
                if (Opacity < 1.0)
                {
                    Opacity += 0.075;
                }
                else
                {
                    timer1.Stop();
                }
            }
        }
    }
}
