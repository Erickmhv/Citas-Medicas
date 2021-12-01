using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using System;
using System.Windows.Forms;

namespace CitasMedicas.View
{
    public partial class UsuarioDetailView : Form
    {
        public UsuarioRepositorio usuarioRepositorio = new UsuarioRepositorio();
        public Usuario usuario = new Usuario();
        public UsuarioDetailView(int id)
        {
            InitializeComponent();

            usuario = usuarioRepositorio.FindByID(id);
        }

        internal void Cargar()
        {
            if (usuario != null)
            {
                txtApellido.Text = usuario.Apellido;
                txtClave.Text = usuario.Clave;
                txtNombre.Text = usuario.Nombre;
                txtNombreUsuario.Text = usuario.NombreUsuario;
            }
            else
            {
                txtApellido.Text = "";
                txtClave.Text = "";
                txtNombre.Text = "";
                txtNombreUsuario.Text = "";
            }
        }
    }
}
