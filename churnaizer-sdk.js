window.Churnaizer = {
  version: "1.0.0",
  debug: true, // Turn off in production

  track: async function (userData, apiKey, callback) {
    if (this.debug) console.log("[Churnaizer] Tracking user:", userData);

    if (!userData || typeof userData !== "object" || !userData.user_id) {
      console.error("\u274c Churnaizer SDK: userData must include a valid user_id.");
      if (callback) callback(null, new Error("userData must include a valid user_id."));
      return;
    }

    try {
      const DEFAULT_ENDPOINT = 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/track';
      const predictRes = await fetch(DEFAULT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "X-SDK-Version": this.version
        },
        body: JSON.stringify(userData)
      });

      const text = await predictRes.text();
      if (text.startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Server returned HTML. API may be down or URL is incorrect.");
      }

      const prediction = JSON.parse(text);
      const {
        churn_probability,
        reason,
        message,
        understanding_score
      } = prediction;

      const result = {
        churn_score: churn_probability,
        churn_reason: reason,
        insight: message,
        understanding: understanding_score
      };

      // Sync to your app for dashboard display
      await fetch("https://churnaizer.com/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, ...result })
      });

      if (callback) callback(result, null);
      return result;
    } catch (error) {
      console.error("\u274c Churnaizer SDK Error:", error);
      if (callback) callback(null, error);
    }
  }
}
