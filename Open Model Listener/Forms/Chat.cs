using System.Net;
using Markdig;
using Open_Model_Listener.Helpers;

namespace Open_Model_Listener.Forms
{
    public partial class Chat : Form
    {
        private readonly System.Text.StringBuilder _responseBuffer = new();
        private System.Windows.Forms.Timer? _streamUpdateTimer;
        private bool _webViewInitialized;

        public Chat()
        {
            InitializeComponent();
        }

        private async void Chat_Load(object sender, EventArgs e)
        {
            try
            {
                await webViewResponse.EnsureCoreWebView2Async();
                _webViewInitialized = true;
                SetResponseContent("<!DOCTYPE html><html><head><meta charset='utf-8'></head><body></body></html>");
            }
            catch (Exception ex)
            {
                SetResponseContent($"<p style='color:red'>WebView failed to load: {WebUtility.HtmlEncode(ex.Message)}</p>");
            }
        }

        private const string ReasoningMarker = "--- **Reasoning** ---";
        private const string ResponseMarker = "--- **Response** ---";

        private static string MarkdownToHtml(string markdown)
        {
            if (string.IsNullOrWhiteSpace(markdown)) return "<p></p>";

            var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();
            string bodyHtml;

            if (markdown.Contains(ResponseMarker))
            {
                var parts = markdown.Split(new[] { ResponseMarker }, 2, StringSplitOptions.None);
                var leftPart = parts[0].Trim();
                var responseContent = parts[1].Trim();

                string reasoningContent = "";
                if (leftPart.StartsWith(ReasoningMarker, StringComparison.Ordinal))
                    reasoningContent = leftPart.Substring(ReasoningMarker.Length).Trim();
                else if (leftPart.Length > 0)
                    reasoningContent = leftPart;

                var reasoningHtml = string.IsNullOrWhiteSpace(reasoningContent) ? "" :
                    $"<div class=\"bubble reasoning-bubble\"><span class=\"bubble-tag reasoning-tag\">💭 Reasoning</span><div class=\"bubble-body\">{Markdown.ToHtml(reasoningContent, pipeline)}</div></div>";
                var responseHtml = string.IsNullOrWhiteSpace(responseContent) ? "" :
                    $"<div class=\"bubble response-bubble\"><span class=\"bubble-tag response-tag\">💬 Response</span><div class=\"bubble-body\">{Markdown.ToHtml(responseContent, pipeline)}</div></div>";

                bodyHtml = reasoningHtml + responseHtml;
            }
            else if (markdown.Contains(ReasoningMarker))
            {
                var parts = markdown.Split(new[] { ReasoningMarker }, 2, StringSplitOptions.None);
                var reasoningContent = parts.Length > 1 ? parts[1].Trim() : "";
                bodyHtml = string.IsNullOrWhiteSpace(reasoningContent) ? "" :
                    $"<div class=\"bubble reasoning-bubble\"><span class=\"bubble-tag reasoning-tag\">💭 Reasoning</span><div class=\"bubble-body\">{Markdown.ToHtml(reasoningContent, pipeline)}</div></div>";
            }
            else
            {
                bodyHtml = Markdown.ToHtml(markdown, pipeline);
            }

            return $$"""
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <style>
                body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 10px; line-height: 1.2; color: #24292e; padding: 12px; margin: 0; }
                .bubble { margin: 12px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); border: 1px solid #e8eaed; }
                .bubble-tag { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; padding: 4px 10px; border-radius: 6px; margin: 10px 10px 0; }
                .reasoning-bubble { background: linear-gradient(135deg, #f8f9fc 0%, #f0f2f8 100%); }
                .reasoning-tag { background: #6366f1; color: #fff; }
                .response-bubble { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); }
                .response-tag { background: #059669; color: #fff; }
                .bubble-body { padding: 10px 14px 14px; font-size: 14px; }
                .bubble-body p:first-child { margin-top: 0; }
                .bubble-body p:last-child { margin-bottom: 0; }
                pre { background: #f6f8fa; border-radius: 6px; padding: 12px; overflow-x: auto; border: 1px solid #e1e4e8; }
                code { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
                pre code { background: none; padding: 0; }
                h1,h2,h3,h4 { margin-top: 1em; margin-bottom: 0.5em; }
                blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding-left: 1em; color: #6a737d; }
                ul,ol { margin: 0.5em 0; padding-left: 1.5em; }
                hr { border: none; border-top: 1px solid #e1e4e8; margin: 1em 0; }
                </style>
                </head>
                <body>{{bodyHtml}}</body>
                </html>
                """;
        }

        private void SetResponseContent(string html)
        {
            if (!_webViewInitialized || webViewResponse.IsDisposed) return;
            try
            {
                webViewResponse.NavigateToString(html);
            }
            catch { /* ignore */ }
        }

        private void SetResponseMarkdown(string markdown)
        {
            var html = MarkdownToHtml(markdown);
            if (InvokeRequired)
                BeginInvoke(() => SetResponseContent(html));
            else
                SetResponseContent(html);
        }

        private async void btnSend_Click(object sender, EventArgs e)
        {
            var message = txtMessage.Text?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(message))
                return;

            DataHelper.ModelName = txtModelName.Text;
            SetResponseMarkdown("*Sending...*");
            btnSend.Enabled = false;

            try
            {
                if (checkboxStream.Checked)
                {
                    _responseBuffer.Clear();
                    _streamUpdateTimer?.Stop();
                    var reasoningStarted = false;
                    var contentStarted = false;

                    _streamUpdateTimer = new System.Windows.Forms.Timer { Interval = 80 };
                    _streamUpdateTimer.Tick += (_, _) =>
                    {
                        SetResponseMarkdown(_responseBuffer.ToString());
                    };

                    await ApiHelper.SendMessageStreamAsync(
                        DataHelper.Url,
                        DataHelper.BearerToken,
                        DataHelper.ModelName,
                        message,
                        (chunk, isReasoning) =>
                        {
                            if (webViewResponse.IsDisposed) return;
                            Invoke(() =>
                            {
                                if (isReasoning)
                                {
                                    if (!reasoningStarted)
                                    {
                                        _responseBuffer.AppendLine("--- **Reasoning** ---");
                                        reasoningStarted = true;
                                    }
                                }
                                else
                                {
                                    if (!contentStarted && reasoningStarted)
                                    {
                                        _responseBuffer.AppendLine();
                                        _responseBuffer.AppendLine("--- **Response** ---");
                                        contentStarted = true;
                                    }
                                    else if (!contentStarted)
                                        contentStarted = true;
                                }
                                _responseBuffer.Append(chunk);
                                _streamUpdateTimer?.Stop();
                                _streamUpdateTimer?.Start();
                            });
                        });

                    _streamUpdateTimer?.Stop();
                    SetResponseMarkdown(_responseBuffer.ToString());
                }
                else
                {
                    var response = await ApiHelper.SendMessageAsync(DataHelper.Url, DataHelper.BearerToken, DataHelper.ModelName, message);
                    SetResponseMarkdown(response);
                }
            }
            catch (Exception ex)
            {
                SetResponseMarkdown($"**Error:** {ex.Message}");
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
