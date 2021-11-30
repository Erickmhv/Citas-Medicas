using CitasMedicas.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using CitasMedicas.Datos.Entities;
using CitasMedicas.Datos.Context;

namespace CitasMedicas.Repositorios
{
    public class RepositorioGenerico<T> : IGenericoRepositorio<T> where T : FechaEstatus
    {
        private AppDbContext _context;
        private DbSet<T> _set;

        public RepositorioGenerico()
        {
            _context = new AppDbContext();
            _set = _context.Set<T>();
        }
        //para crear
        public T Create(T entity)
        {
            _set.Add(entity);
            _context.SaveChanges();

            return entity;
        }
        //Eliminar 
        public bool Delete(T entity)
        {

            _context.Entry(entity).State = EntityState.Modified;
            entity.Borrado = 1;
            entity.Estatus = "I";
            entity.FechaModificacion = DateTime.Now;
            _context.SaveChanges();
            return true;
        }

        public T FindByID(int id)
        {
            return _set.FirstOrDefault(x => x.Id == id & x.Estatus == "A" & x.Borrado == 0);
        }

        //Get all 
        public List<T> GetAll()
        {
            return _set.Where(x => x.Borrado == 0 & x.Estatus == "A").ToList();
        }

        //Actualizar 
        public bool Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            entity.FechaModificacion = DateTime.Now;
            _context.SaveChanges();
            return true;
        }








    }

}