using CitasMedicas.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class MedicoDetailView : Form
    {
        public MedicoDetailView()
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
            Close();
        }

        private void UsuarioDetailView_Load(object sender, EventArgs e)
        {
            btnX.Font = Util.SecondaryFont(16);
            btnX.ForeColor = Util.PrimaryColor;
        }
    }
}
