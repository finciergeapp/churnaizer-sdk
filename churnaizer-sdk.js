// Churnaizer Tracking SDK v1.0
(function () {
  const CHURNAIZER_API = "https://churnaizer.com/api/track"; // Change this if needed

  window.Churnaizer = {
    track: function (userInfo, apiKey) {
      if (!userInfo || !apiKey) {
        console.error("Churnaizer: Missing userInfo or API Key.");
        return;
      }

      fetch(CHURNAIZER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(userInfo),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("🔁 Churnaizer - Churn Score:", data.churn_score);
          if (data.churn_reason) {
            console.log("🔍 Reason:", data.churn_reason);
          }
        })
        .catch((err) =>
          console.error("Churnaizer SDK tracking failed:", err)
        );
    },
  };
})();
