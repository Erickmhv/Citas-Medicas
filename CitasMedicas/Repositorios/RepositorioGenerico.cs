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

        public T create(T entity)
        {
            _set.Add(entity);
            _context.SaveChanges();


            return entity;

        }
        public OperationResult Delete(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            entity.Borrado = true;
            entity.FechaModificacion = DateTime.Today;

            _context.SaveChanges();
            return new OperationResult() { Success = true };

        }



        public  T  FindById (int Id)
        {
            return _set.FirstOrDefault(x => x.Id == Id);
        }
        


        //public List(T) GetAll()
        //{
        //    return _set.Where(x => x.Borrado == false).ToList();
        //}
        public OperationResult Update (T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();

            return new OperationResult() { Success = true };
        }
    }


}
