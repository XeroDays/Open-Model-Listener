using Open_Model_Listener.Forms;
using Open_Model_Listener.Helpers;

namespace Open_Model_Listener
{
    public partial class MainMenu : Form
    {
        public MainMenu()
        {
            InitializeComponent();
        }

        private void btnStart_Click(object sender, EventArgs e)
        {
            DataHelper.Url = txtUrl.Text?.Trim() ?? string.Empty;
            DataHelper.BearerToken = txtAuthenticationToken.Text?.Trim() ?? string.Empty;
              
            Hide();
            var chatForm = new Chat();
            chatForm.FormClosed += (s, args) => Close();
            chatForm.Show();
        }

        private void label2_Click(object sender, EventArgs e)
        {
            
        }
    }
}
