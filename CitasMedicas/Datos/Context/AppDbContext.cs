﻿using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CitasMedicas.Datos.Context
{
  public  class AppDbContext:DbContext
    {
        public AppDbContext()
            :base ("name=CitasMedicas")
        {

        }
    }
}
