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

            lblMessage.Text = "Sending...";
            btnSend.Enabled = false;

            try
            {
                var response = await ApiHelper.SendMessageAsync(    DataHelper.Url,  DataHelper.BearerToken,    message);
                lblMessage.Text = response;
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
    }
}
