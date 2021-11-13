using System.Drawing;

namespace CitasMedicas.Utils
{
    public class Util
    {
        #region Color
        private Color primaryColor = Color.FromArgb(41, 128, 185);
        public Color PrimaryColor
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

        private Color secondaryColor = Color.FromArgb(255, 255, 255);
        public Color SecondaryColor
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
        
        private Color thirdColor = SystemColors.Control;
        public Color ThirdColor
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

        public static FontFamily PrimaryFont = new FontFamily("CENTURY GOTHIC");
        public static FontFamily SecondaryFont = new FontFamily("VERDANA");

        private Font primaryFont16 = new Font(
           PrimaryFont,
           16,
           FontStyle.Regular,
           GraphicsUnit.Pixel);

        public Font PrimaryFont16
        {
            get
            {
                return primaryFont16;
            }
            set
            {
                primaryFont16 = value;
            }
        }        
        
        private Font primaryFont12 = new Font(
           PrimaryFont,
           12,
           FontStyle.Regular,
           GraphicsUnit.Pixel);

        public Font PrimaryFont12
        {
            get
            {
                return primaryFont12;
            }
            set
            {
                primaryFont12 = value;
            }
        }

        private Font primaryFont10 = new Font(
           PrimaryFont,
           10,
           FontStyle.Regular,
           GraphicsUnit.Pixel);
        public Font PrimaryFont10
        {
            get
            {
                return primaryFont10;
            }
            set
            {
                primaryFont10 = value;
            }
        }

        private Font secondaryFont16 = new Font(
      SecondaryFont,
      16,
      FontStyle.Bold,
      GraphicsUnit.Pixel);
        public Font SecondaryFont16
        {
            get
            {
                return secondaryFont16;
            }
            set
            {
                secondaryFont16 = value;
            }
        }
        #endregion
    }
}
