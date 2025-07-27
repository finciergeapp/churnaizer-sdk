window.Churnaizer = {
   version: "1.0.0",
   debug: true, // Set false in production
  
   track: async function (userData, apiKey, callback) {
     if (this.debug) console.log("[Churnaizer SDK] Starting track for user:", userData);
  
     // ✅ Validate required fields
     if (!userData || typeof userData !== "object" || !userData.user_id || !userData.email) {
       const error = new Error("Missing required user_id or email");
       console.error("❌ Churnaizer SDK:", error);
       if (callback) callback(null, error);
       return;
     }
  
     try {
       const DEFAULT_ENDPOINT = 'https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/track';
  
       // 🔁 Send to prediction API
       const predictRes = await fetch(DEFAULT_ENDPOINT, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "X-API-Key": apiKey,

         },
         body: JSON.stringify(userData)
       });
  
       const text = await predictRes.text();
       if (text.startsWith("<!DOCTYPE") || text.includes("<html")) {
         throw new Error("Invalid HTML response. API might be unreachable or URL incorrect.");
       }
  
       const prediction = JSON.parse(text);

       // Validate required fields from API response
       const requiredFields = [
         'churn_probability',
         'reason',
         'message',
         'understanding_score',
         'risk_level',
         'shouldTriggerEmail',
         'recommended_tone'
       ];

       const missingFields = requiredFields.filter(field => prediction[field] === undefined);
       if (missingFields.length > 0) {
         throw new Error(`API response missing required fields: ${missingFields.join(', ')}`);
       }

       const {
         churn_probability,
         reason,
         message,
         understanding_score,
         risk_level,
         shouldTriggerEmail,
         recommended_tone
       } = prediction;

       const result = {
         churn_score: churn_probability,
         churn_reason: reason,
         insight: message,
         understanding: understanding_score,
         risk_level,
         shouldTriggerEmail,
         recommended_tone
       };
  
       // 🔁 Sync to dashboard
       await fetch("https://churnaizer.com/api/sync", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...userData, ...result })
       });
  
       if (this.debug) console.log("✅ Churnaizer prediction result:", result);
  
       // 🔁 Optional: Send retention email trigger via backend
       if (result.shouldTriggerEmail) {
         await fetch("https://churnaizer.com/api/email/send", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             to: userData.email,
             user_id: userData.user_id,
             churn_score: result.churn_score,
             reason: result.churn_reason,
             insight: result.insight
           })
         });
       }
  
       if (callback) callback(result, null);
       return result;
  
     } catch (error) {
       console.error("❌ Churnaizer SDK Error:", error);
       if (callback) callback(null, error);
     }
   }
 };
