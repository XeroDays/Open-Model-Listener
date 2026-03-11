using System.Text;
using System.Text.Json;

namespace Open_Model_Listener.Helpers
{
    internal static class ApiHelper
    {

        private static readonly HttpClient HttpClient = new();

        public static async Task<string> SendMessageAsync(string url, string apiKey, string modelName, string message)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            var trimmedKey = (apiKey ?? string.Empty).Trim();
            request.Headers.Add("Authorization", $"Bearer {trimmedKey}");
            request.Headers.Add("X-Title", "Open Model Listener");

            var body = new
            {
                model = modelName,
                messages = new[]
                {
                    new { role = "user", content = message }
                }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await HttpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                return $"Error: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}";
            }

            var json = await response.Content.ReadAsStringAsync();

            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (root.TryGetProperty("choices", out var choices) &&
                    choices.GetArrayLength() > 0)
                {
                    var firstChoice = choices[0];
                    if (firstChoice.TryGetProperty("message", out var msg) &&
                        msg.TryGetProperty("content", out var content))
                    {
                        return content.GetString() ?? json;
                    }
                }
            }
            catch
            {
                // Fallback to raw response if parsing fails
            }

            return json;
        }
    }
}
