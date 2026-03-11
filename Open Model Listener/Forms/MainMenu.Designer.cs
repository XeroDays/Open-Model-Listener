namespace Open_Model_Listener
{
    partial class MainMenu
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
            label1 = new Label();
            txtUrl = new TextBox();
            label2 = new Label();
            txtAuthenticationToken = new TextBox();
            label3 = new Label();
            btnStart = new Button();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(23, 80);
            label1.Name = "label1";
            label1.Size = new Size(35, 20);
            label1.TabIndex = 0;
            label1.Text = "URL";
            // 
            // txtUrl
            // 
            txtUrl.BorderStyle = BorderStyle.FixedSingle;
            txtUrl.Location = new Point(151, 75);
            txtUrl.Name = "txtUrl";
            txtUrl.Size = new Size(581, 27);
            txtUrl.TabIndex = 1;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Font = new Font("Segoe UI", 18F, FontStyle.Bold, GraphicsUnit.Point, 0);
            label2.Location = new Point(12, 20);
            label2.Name = "label2";
            label2.Size = new Size(312, 41);
            label2.TabIndex = 2;
            label2.Text = "Open Model Listener";
            // 
            // txtAuthenticationToken
            // 
            txtAuthenticationToken.BorderStyle = BorderStyle.FixedSingle;
            txtAuthenticationToken.Location = new Point(151, 108);
            txtAuthenticationToken.Multiline = true;
            txtAuthenticationToken.Name = "txtAuthenticationToken";
            txtAuthenticationToken.Size = new Size(581, 153);
            txtAuthenticationToken.TabIndex = 4;
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(23, 113);
            label3.Name = "label3";
            label3.Size = new Size(106, 20);
            label3.TabIndex = 3;
            label3.Text = "Authentication";
            // 
            // btnStart
            // 
            btnStart.Location = new Point(472, 267);
            btnStart.Name = "btnStart";
            btnStart.Size = new Size(260, 61);
            btnStart.TabIndex = 5;
            btnStart.Text = "Initialize Model";
            btnStart.UseVisualStyleBackColor = true;
            btnStart.Click += btnStart_Click;
            // 
            // MainMenu
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(761, 362);
            Controls.Add(btnStart);
            Controls.Add(txtAuthenticationToken);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(txtUrl);
            Controls.Add(label1);
            MaximizeBox = false;
            MinimizeBox = false;
            Name = "MainMenu";
            Text = "MainMenu";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private TextBox txtUrl;
        private Label label2;
        private TextBox txtAuthenticationToken;
        private Label label3;
        private Button btnStart;
    }
}