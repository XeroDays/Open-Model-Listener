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
            txtModelName = new TextBox();
            label4 = new Label();
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
            txtUrl.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtUrl.BorderStyle = BorderStyle.FixedSingle;
            txtUrl.Location = new Point(151, 75);
            txtUrl.Name = "txtUrl";
            txtUrl.Size = new Size(607, 27);
            txtUrl.TabIndex = 1;
            txtUrl.Text = "https://openrouter.ai/api/v1/chat/completions";
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
            txtAuthenticationToken.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtAuthenticationToken.BorderStyle = BorderStyle.FixedSingle;
            txtAuthenticationToken.Location = new Point(151, 108);
            txtAuthenticationToken.Multiline = true;
            txtAuthenticationToken.Name = "txtAuthenticationToken";
            txtAuthenticationToken.Size = new Size(607, 153);
            txtAuthenticationToken.TabIndex = 4;
            txtAuthenticationToken.Text = "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";
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
            btnStart.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            btnStart.Location = new Point(498, 311);
            btnStart.Name = "btnStart";
            btnStart.Size = new Size(260, 61);
            btnStart.TabIndex = 5;
            btnStart.Text = "Initialize Model";
            btnStart.UseVisualStyleBackColor = true;
            btnStart.Click += btnStart_Click;
            // 
            // txtModelName
            // 
            txtModelName.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtModelName.BorderStyle = BorderStyle.FixedSingle;
            txtModelName.Location = new Point(151, 267);
            txtModelName.Name = "txtModelName";
            txtModelName.Size = new Size(607, 27);
            txtModelName.TabIndex = 7;
            txtModelName.Text = "stepfun/step-3.5-flash:free";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(23, 272);
            label4.Name = "label4";
            label4.Size = new Size(96, 20);
            label4.TabIndex = 6;
            label4.Text = "Model Name";
            // 
            // MainMenu
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(787, 412);
            Controls.Add(txtModelName);
            Controls.Add(label4);
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
        private TextBox txtModelName;
        private Label label4;
    }
}