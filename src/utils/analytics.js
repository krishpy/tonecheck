const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function trackEvent(event) {
  try {
    await fetch(`${API_BASE}/admin/analytics/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.warn("analytics failed", e);
  }
}