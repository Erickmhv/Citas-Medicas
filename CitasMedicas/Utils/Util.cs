using System;
using System.Drawing;
using System.Windows.Forms;

namespace CitasMedicas.Utils
{
    public class Util
    {
        public Timer timer1;

        public void CreateTimer(bool cerrado, Form form)
        {
            timer1 = null;

            if (timer1 == null)
                timer1 = new Timer();

            timer1.Tick += (sender, e) => timer1_CreateTick(new TimerEventArgs(cerrado, form));

            if (!cerrado)
                form.Opacity = 0;

            timer1.Start();
        }

        public class TimerEventArgs : EventArgs
        {
            public TimerEventArgs(bool cerrar, Form form)
            {
                this.Cerrar = cerrar;
                this.Form1 = form;
            }

            public bool Cerrar { get; private set; }
            public Form Form1 { get; private set; }
        }

        //public event EventHandler<TimerEventArgs> ClosingTimer;

        private void timer1_CreateTick(TimerEventArgs e)
        {
            if (e.Cerrar)
            {
                if (e.Form1.Opacity > 0.0)
                {
                    e.Form1.Opacity -= 0.075;
                }
                else
                {
                    timer1.Stop();
                    e.Form1.Close();
                }
            }
            else
            {
                if (e.Form1.Opacity < 1.0)
                {
                    e.Form1.Opacity += 0.075;
                }
                else
                {
                    timer1.Stop();
                }
            }
        }


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
