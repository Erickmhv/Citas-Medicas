
namespace CitasMedicas.View
{
    partial class DetailView
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.pnl = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.btnSalvarCerrar = new System.Windows.Forms.Button();
            this.btnSalvarNuevo = new System.Windows.Forms.Button();
            this.btnX = new System.Windows.Forms.Button();
            this.btnSalvar = new System.Windows.Forms.Button();
            this.timer1 = new System.Windows.Forms.Timer(this.components);
            this.pnl.SuspendLayout();
            this.panel2.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnl
            // 
            this.pnl.Controls.Add(this.panel2);
            this.pnl.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnl.Location = new System.Drawing.Point(0, 0);
            this.pnl.Name = "pnl";
            this.pnl.Size = new System.Drawing.Size(800, 450);
            this.pnl.TabIndex = 0;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.btnSalvarCerrar);
            this.panel2.Controls.Add(this.btnSalvarNuevo);
            this.panel2.Controls.Add(this.btnX);
            this.panel2.Controls.Add(this.btnSalvar);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel2.Location = new System.Drawing.Point(0, 0);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(800, 30);
            this.panel2.TabIndex = 1;
            // 
            // btnSalvarCerrar
            // 
            this.btnSalvarCerrar.FlatAppearance.BorderSize = 0;
            this.btnSalvarCerrar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSalvarCerrar.Location = new System.Drawing.Point(295, 0);
            this.btnSalvarCerrar.Name = "btnSalvarCerrar";
            this.btnSalvarCerrar.Size = new System.Drawing.Size(186, 30);
            this.btnSalvarCerrar.TabIndex = 7;
            this.btnSalvarCerrar.Text = "Salvar y Cerrar";
            this.btnSalvarCerrar.UseVisualStyleBackColor = true;
            this.btnSalvarCerrar.Visible = false;
            this.btnSalvarCerrar.Click += new System.EventHandler(this.btnSalvarCerrar_Click);
            // 
            // btnSalvarNuevo
            // 
            this.btnSalvarNuevo.FlatAppearance.BorderSize = 0;
            this.btnSalvarNuevo.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSalvarNuevo.Location = new System.Drawing.Point(81, 0);
            this.btnSalvarNuevo.Name = "btnSalvarNuevo";
            this.btnSalvarNuevo.Size = new System.Drawing.Size(208, 30);
            this.btnSalvarNuevo.TabIndex = 6;
            this.btnSalvarNuevo.Text = "Salvar y Nuevo";
            this.btnSalvarNuevo.UseVisualStyleBackColor = true;
            this.btnSalvarNuevo.Visible = false;
            this.btnSalvarNuevo.Click += new System.EventHandler(this.btnSalvarNuevo_Click);
            // 
            // btnX
            // 
            this.btnX.Cursor = System.Windows.Forms.Cursors.Hand;
            this.btnX.FlatAppearance.BorderSize = 0;
            this.btnX.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnX.Location = new System.Drawing.Point(770, 0);
            this.btnX.Name = "btnX";
            this.btnX.Size = new System.Drawing.Size(30, 30);
            this.btnX.TabIndex = 5;
            this.btnX.Text = "X";
            this.btnX.UseVisualStyleBackColor = true;
            this.btnX.Click += new System.EventHandler(this.btnX_Click);
            // 
            // btnSalvar
            // 
            this.btnSalvar.FlatAppearance.BorderSize = 0;
            this.btnSalvar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSalvar.Location = new System.Drawing.Point(0, 0);
            this.btnSalvar.Name = "btnSalvar";
            this.btnSalvar.Size = new System.Drawing.Size(75, 30);
            this.btnSalvar.TabIndex = 0;
            this.btnSalvar.Text = "Salvar";
            this.btnSalvar.UseVisualStyleBackColor = true;
            this.btnSalvar.Click += new System.EventHandler(this.btnSalvar_Click);
            // 
            // DetailView
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.pnl);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Name = "DetailView";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "ListView";
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.DetailView_FormClosed);
            this.Load += new System.EventHandler(this.CitaDetailView_Load);
            this.pnl.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.Button btnSalvar;
        private System.Windows.Forms.Timer timer1;
        public System.Windows.Forms.Panel pnl;
        private System.Windows.Forms.Button btnSalvarNuevo;
        public System.Windows.Forms.Button btnX;
        private System.Windows.Forms.Button btnSalvarCerrar;
    }
}