window.Churnaizer = {
  track: async function(userData, apiKey, callback) {

    async function retryFetch(url, options, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error("HTTP " + response.status);
          return await response.json();
        } catch (e) {
          if (i === retries) throw e;
        }
      }
    }
    if (!userData || typeof userData !== "object" || !userData.user_id) {
      console.error("❌ Churnaizer SDK: userData must include a valid user_id.");
      if (callback) callback(null, new Error("userData must include a valid user_id."));
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds

    try {
      const data = await retryFetch("https://ai-model-rumc.onrender.com/api/v1/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "X-SDK-Version": "1.0.0"
        },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const churn_score = data.churn_probability;
      const churn_reason = data.reason;
      const insight = data.message;
      const understanding = data.understanding_score;

      // ✅ Sync to Churnaizer backend to show in dashboard
      fetch("https://churnaizer.com/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...userData,
          churn_score,
          churn_reason,
          insight,
          understanding
        })
      });

      // ✅ Callback for SDK integration
      if (callback) {
        callback({ churn_score, churn_reason, insight, understanding });
      }
    } catch (error) {
      clearTimeout(timeout);
      if (callback) callback(null, error);
      console.error("❌ Churnaizer SDK tracking failed:", error);
    };
  }
};
