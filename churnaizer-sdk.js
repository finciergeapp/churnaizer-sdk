// ✅ Churnaizer SDK v1.1 - Secure API Integrated
window.Churnaizer = {
  track: function(userData, apiKey) {
    fetch("https://ai-model-rumc.onrender.com/api/v1/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ Churn Score:", data.churn_score);
      console.log("📌 Reason:", data.churn_reason);
    })
    .catch(error => {
      console.error("❌ Churnaizer SDK tracking failed:", error);
    });
  }
};
