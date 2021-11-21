using CitasMedicas.Utils;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class DetailView : Form
    {
        public bool Cerrar { get; set; }
        public DetailView()
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

    }
}
