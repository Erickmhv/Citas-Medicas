using CitasMedicas.Datos.Entities;
using CitasMedicas.Repositorios;
using System;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Windows.Forms;

namespace CitasMedicas.Utils
{
    public class Util
    {
        public static Usuario UsuarioActual;

        #region Metodos
        public static Image CambiarImagenColor(string imagen, Color c)
        {
            Bitmap bmp = null;

            var assembly = Assembly.GetExecutingAssembly();

            var resourceName = assembly.GetManifestResourceNames().FirstOrDefault(x => x.Contains(imagen));
            using (var stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream != null) bmp = (Bitmap)Image.FromStream(stream);
            }
            
            if (bmp == null)
                return null;

            int width = bmp.Width;
            int height = bmp.Height;

            Bitmap image = new Bitmap(bmp);

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    Color p = bmp.GetPixel(x, y);

                    int a = p.A;
                    int r = p.R;
                    int g = p.G;
                    int b = p.B;

                    image.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));

                }
            }

            return image;

        }
        public static void CreateTimer(bool cerrado, Form form, Timer timer1)
        {
            timer1.Tick += (sender, e) => timer1_CreateTick(new TimerEventArgs(cerrado, form, timer1));

            if (!cerrado)
                form.Opacity = 0.0;

            timer1.Start();
        }
        public class TimerEventArgs : EventArgs
        {
            public TimerEventArgs(bool cerrar, Form form, Timer timer1)
            {
                this.Cerrar = cerrar;
                this.Form1 = form;
                this.Timer1 = timer1;
            }

            public bool Cerrar { get; private set; }
            public Form Form1 { get; private set; }
            public Timer Timer1 { get; private set; }
        }
        private static void timer1_CreateTick(TimerEventArgs e)
        {
            e.Form1.Opacity = Math.Round(e.Form1.Opacity, 2);

            if (e.Cerrar)
            {
                if (e.Form1.Opacity > 0.0)
                {
                    e.Form1.Opacity -= 0.1;
                }
                else
                {
                    e.Timer1.Stop();
                    e.Form1.Close();
                }
            }
            else
            {
                if (e.Form1.Opacity < 1.0)
                {
                    e.Form1.Opacity += 0.1;
                }
                else
                {
                    e.Timer1.Stop();
                }
            }
        }
        #endregion

        #region Color
        private static Color primaryColor = Color.FromArgb(41, 128, 185);
        public static Color PrimaryColor
        {
            get
            {
                return primaryColor;
            }
            set
            {
                primaryColor = value;
            }
        }

        private static Color secondaryColor = Color.FromArgb(255, 255, 255);
        public static Color SecondaryColor
        {
            get
            {
                return secondaryColor;
            }
            set
            {
                secondaryColor = value;
            }
        }

        private static Color thirdColor = SystemColors.Control;
        public static Color ThirdColor
        {
            get
            {
                return thirdColor;
            }
            set
            {
                thirdColor = value;
            }
        }

        #endregion

        #region Font

        public static Font PrimaryFont(int size) => new Font(new FontFamily("CENTURY GOTHIC"), size, FontStyle.Regular, GraphicsUnit.Pixel);

        public static Font SecondaryFont(int size) => new Font(new FontFamily("VERDANA"), size, FontStyle.Bold, GraphicsUnit.Pixel);

        #endregion

    }

}
