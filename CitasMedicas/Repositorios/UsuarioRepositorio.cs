using CitasMedicas.Datos.Entities;
using System.Linq;

namespace CitasMedicas.Repositorios
{
    public class UsuarioRepositorio : RepositorioGenerico<Usuario>
    {
        public Usuario FindByLogin(string usuario, string clave)
        {
            return _set.FirstOrDefault(x => x.Borrado == 0 & x.Estatus == "A" & x.NombreUsuario == usuario & x.Clave == clave);
        }

    }
}
