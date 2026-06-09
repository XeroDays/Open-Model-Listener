document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  try {
    const msg = await window.electronAPI?.ping?.();
    statusEl.textContent = msg ?? "IPC unavailable";
  } catch (err) {
    statusEl.textContent = "IPC error";
    console.error("[app] ping failed:", err);
  }
});
