window.Churnaizer = {
  track: function(userData, apiKey, callback) {
    fetch("https://ai-model-rumc.onrender.com/api/v1/predict", { // Flask API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(userData)
    })
    .then(async response => {
      const text = await response.text();

      // 🔐 If HTML is returned (like a 404), show a clean error
      if (text.startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Server returned HTML instead of JSON (check if API is online)");
      }

      const data = JSON.parse(text);
      const churn_score = data.churn_probability;
      const churn_reason = data.reason;
      const insight = data.message;
      const understanding = data.understanding_score;

      // ✅ Send to Churnaizer backend for dashboard display
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

      // ✅ Callback
      if (callback) {
        callback({ churn_score, churn_reason, insight, understanding });
      }
    })
    .catch(error => {
      console.error("❌ Churnaizer SDK Error:", error);
      if (callback) callback(null, error);
    });
  }
};
