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
      console.log("✅ Churn Score:", data.churn_score);
      console.log("📌 Reason:", data.churn_reason);
      if (callback) callback(data);
    })
    .catch(error => {
      console.error("❌ Churnaizer SDK tracking failed:", error);
      document.getElementById("result").innerText =
        "❌ Error: " + error.message;
    });
  }
};
