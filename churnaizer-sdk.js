window.Churnaizer = {
  track: function(userData, apiKey, callback) {
    fetch("https://ai-model-rumc.onrender.com/api/v1/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(data => {
      const churn_score = data.churn_probability;
      const churn_reason = data.reason;
      const insight = data.message;
      const understanding = data.understanding_score;

      if (callback) {
        callback({ churn_score, churn_reason, insight, understanding });
      }
    })
    .catch(error => {
      console.error("❌ Churnaizer SDK tracking failed:", error);
      document.getElementById("result").innerText =
        "❌ Error: " + error.message;
    });
  }
};
