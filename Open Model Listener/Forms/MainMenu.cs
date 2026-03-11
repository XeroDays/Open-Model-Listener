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
            DataHelper.Url = txtUrl.Text;
            DataHelper.BearerToken = txtAuthenticationToken.Text;

            Hide();
            var chatForm = new Chat();
            chatForm.FormClosed += (s, args) => Close();
            chatForm.Show();
        }
    }
}
