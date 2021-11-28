using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Interfaces
{
    interface IGenericoRepositorio <T>
    {
        T Create(T entity);
        List<T> GetAll();
        T FindById(int Id);
        //OperationResult Update(T entity);
        //OperationResult Delete(T entity);

    }
}
