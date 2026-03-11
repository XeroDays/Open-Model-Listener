namespace Open_Model_Listener.Forms
{
    partial class Chat
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
            txtMessage = new TextBox();
            label3 = new Label();
            btnSend = new Button();
            lblChatMessage = new Label();
            SuspendLayout();
            // 
            // txtMessage
            // 
            txtMessage.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtMessage.BorderStyle = BorderStyle.FixedSingle;
            txtMessage.Location = new Point(116, 24);
            txtMessage.Multiline = true;
            txtMessage.Name = "txtMessage";
            txtMessage.Size = new Size(645, 95);
            txtMessage.TabIndex = 6;
            txtMessage.Text = "Type Message Here";
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Font = new Font("Segoe UI", 9F, FontStyle.Bold, GraphicsUnit.Point, 0);
            label3.Location = new Point(7, 26);
            label3.Name = "label3";
            label3.Size = new Size(106, 20);
            label3.TabIndex = 5;
            label3.Text = "User Message";
            // 
            // btnSend
            // 
            btnSend.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            btnSend.Location = new Point(767, 26);
            btnSend.Name = "btnSend";
            btnSend.Size = new Size(104, 93);
            btnSend.TabIndex = 1;
            btnSend.Text = "Send";
            btnSend.UseVisualStyleBackColor = true;
            btnSend.Click += btnSend_Click;
            // 
            // lblChatMessage
            // 
            lblChatMessage.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            lblChatMessage.Location = new Point(12, 146);
            lblChatMessage.Name = "lblChatMessage";
            lblChatMessage.Size = new Size(859, 415);
            lblChatMessage.TabIndex = 7;
            lblChatMessage.Text = "Mesage : this is the message of the chat gpt here ";
            // 
            // Chat
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(883, 570);
            Controls.Add(lblChatMessage);
            Controls.Add(btnSend);
            Controls.Add(txtMessage);
            Controls.Add(label3);
            Name = "Chat";
            Text = "Chat";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox txtMessage;
        private Label label3;
        private Button btnSend;
        public Label lblChatMessage;
    }
}