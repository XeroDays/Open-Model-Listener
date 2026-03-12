using Open_Model_Listener.Helpers;

namespace Open_Model_Listener.Forms
{
    public partial class Chat : Form
    {
        public Chat()
        {
            InitializeComponent();
        }

        private async void btnSend_Click(object sender, EventArgs e)
        {
            var message = txtMessage.Text?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(message))
                return;


            DataHelper.ModelName = txtModelName.Text;
            lblMessage.Text = "Sending...";
            btnSend.Enabled = false;

            try
            {
                if (checkboxStream.Checked)
                {
                    lblMessage.Text = string.Empty;
                    var reasoningStarted = false;
                    var contentStarted = false;
                    await ApiHelper.SendMessageStreamAsync(
                        DataHelper.Url,
                        DataHelper.BearerToken,
                        DataHelper.ModelName,
                        message,
                        (chunk, isReasoning) =>
                        {
                            if (lblMessage.IsDisposed) return;
                            lblMessage.Invoke(() =>
                            {
                                if (isReasoning)
                                {
                                    if (!reasoningStarted)
                                    {
                                        lblMessage.AppendText("--- Reasoning ---" + Environment.NewLine);
                                        reasoningStarted = true;
                                    }
                                }
                                else
                                {
                                    if (!contentStarted && reasoningStarted)
                                    {
                                        lblMessage.AppendText(Environment.NewLine + "--- Response ---" + Environment.NewLine);
                                        contentStarted = true;
                                    }
                                    else if (!contentStarted)
                                        contentStarted = true;
                                }
                                lblMessage.AppendText(chunk);
                            });
                        });
                }
                else
                {
                    var response = await ApiHelper.SendMessageAsync(DataHelper.Url, DataHelper.BearerToken, DataHelper.ModelName, message);
                    lblMessage.Text = response;
                }
            }
            catch (Exception ex)
            {
                lblMessage.Text = $"Error: {ex.Message}";
            }
            finally
            {
                btnSend.Enabled = true;
            }
        }

        private void checkboxStream_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void txtMessage_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter && e.Control)
            {
                e.SuppressKeyPress = true;
                btnSend.PerformClick();
            }
        }
    }
}
