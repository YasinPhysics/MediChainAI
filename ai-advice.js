// ai-advice.js
// This file contains the complete logic for fetching AI advice

/**
 * Fetch AI advice after viewing records or adding a new record
 * @param {Array} records - Array of records from the smart contract
 * @param {string} [currentReading] - Optional: Reading value of the newly added record
 * @param {string} [currentDisease] - Optional: Name of the newly added disease
 */
async function fetchAIAdvice(records = [], currentReading = "", currentDisease = "") {
  
  // If no records and no current reading, show message
  if (records.length === 0 && !currentReading) {
    addMessage("No records found yet. I can't give advice without any health data.");
    return;
  }

  try {
    // Prepare payload for the AI API
    const payload = {
      records: records.map(r => ({
        encryptedData: r.encryptedData,
        timestamp: r.timestamp.toString()
      })),
      currentReading: currentReading,
      currentDisease: currentDisease,
      userMessage: "Analyze these health records and give me simple, general, and helpful advice. " +
                   "If you don't know my age, gender, or other details, give general tips only. " +
                   "Do NOT suggest any medicine or specific medical treatment."
    };

    // Show loading message
    addMessage("I'm showing your records to the AI Doctor... Please wait a moment.");

    const response = await fetch('https://ai-doctor-blockchain.vercel.app/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.advice && data.advice.trim()) {
      addMessage("🤖 AI Doctor's Advice:\n\n" + data.advice);
    } else {
      addMessage("Sorry, the AI could not generate any advice at this moment.");
    }

  } catch (err) {
    console.error("AI fetch error:", err);
    addMessage("Unable to connect to AI. Please try again later. (" + (err.message || "Unknown error") + ")");
  }
}

// Make the function globally available so it can be called from the main HTML file
window.fetchAIAdvice = fetchAIAdvice;
