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
            webViewResponse = new Microsoft.Web.WebView2.WinForms.WebView2();
            checkboxStream = new CheckBox();
            txtModelName = new TextBox();
            label4 = new Label();
            SuspendLayout();
            // 
            // txtMessage
            // 
            txtMessage.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtMessage.BorderStyle = BorderStyle.FixedSingle;
            txtMessage.Location = new Point(116, 24);
            txtMessage.Multiline = true;
            txtMessage.Name = "txtMessage";
            txtMessage.Size = new Size(721, 95);
            txtMessage.TabIndex = 6;
            txtMessage.Text = "Type Message Here";
            txtMessage.KeyDown += txtMessage_KeyDown;
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
            btnSend.Location = new Point(843, 26);
            btnSend.Name = "btnSend";
            btnSend.Size = new Size(104, 126);
            btnSend.TabIndex = 1;
            btnSend.Text = "Send";
            btnSend.UseVisualStyleBackColor = true;
            btnSend.Click += btnSend_Click;
            // 
            // webViewResponse
            // 
            webViewResponse.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            webViewResponse.CreationProperties = null;
            webViewResponse.DefaultBackgroundColor = Color.White;
            webViewResponse.Location = new Point(12, 161);
            webViewResponse.Name = "webViewResponse";
            webViewResponse.Size = new Size(935, 424);
            webViewResponse.TabIndex = 7;
            webViewResponse.ZoomFactor = 1D;
            // 
            // checkboxStream
            // 
            checkboxStream.AutoSize = true;
            checkboxStream.Checked = true;
            checkboxStream.CheckState = CheckState.Checked;
            checkboxStream.Location = new Point(12, 49);
            checkboxStream.Name = "checkboxStream";
            checkboxStream.Size = new Size(78, 24);
            checkboxStream.TabIndex = 8;
            checkboxStream.Text = "Stream";
            checkboxStream.UseVisualStyleBackColor = true;
            checkboxStream.CheckedChanged += checkboxStream_CheckedChanged;
            // 
            // txtModelName
            // 
            txtModelName.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
            txtModelName.BorderStyle = BorderStyle.FixedSingle;
            txtModelName.Location = new Point(116, 125);
            txtModelName.Name = "txtModelName";
            txtModelName.Size = new Size(721, 27);
            txtModelName.TabIndex = 10;
            txtModelName.Text = "stepfun/step-3.5-flash:free";
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(7, 128);
            label4.Name = "label4";
            label4.Size = new Size(96, 20);
            label4.TabIndex = 9;
            label4.Text = "Model Name";
            // 
            // Chat
            // 
            AutoScaleDimensions = new SizeF(8F, 20F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(959, 597);
            Controls.Add(txtModelName);
            Controls.Add(label4);
            Controls.Add(checkboxStream);
            Controls.Add(webViewResponse);
            Controls.Add(btnSend);
            Controls.Add(txtMessage);
            Controls.Add(label3);
            Name = "Chat";
            Text = "Chat";
            Load += Chat_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private TextBox txtMessage;
        private Label label3;
        private Button btnSend;
        private Microsoft.Web.WebView2.WinForms.WebView2 webViewResponse;
        private CheckBox checkboxStream;
        private TextBox txtModelName;
        private Label label4;
    }
}