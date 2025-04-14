const express = require('express');
const axios = require('axios');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Load API key from an env file
// Static restaurant information (this can be stored in a separate file or DB as needed)
const restaurantInfo = `
Enjoy Your Healthy Delicious Food
We are a team of talented chefs creating memorable dining experiences with the freshest ingredients
Book Now | Delicious Food | About Us | Learn More About Us

About Our Restaurant
Venkatalaxmi Mess is our newest venture, born from the growing demand for smaller meal packages (serving 5 to 10 people). We're here to serve fresh, homely, and hygienic food at affordable prices, perfect for locals, tourists, and working professionals.

Fresh, homely, and hygienic food at affordable prices
Every meal prepared with care, using fresh ingredients and traditional recipes.
...
Address: Hanglur, Kundapura, Udupi - 576217
Call Us: +91 9632169727
Email: contact@venkatalaxmi.com
Opening Hours: Mon-Sat: 9AM - 4PM; Sunday: Closed
`;

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Construct messages with the restaurant info injected
    const promptMessages = [
      { role: 'system', content: `You are a helpful assistant that knows all about Venkatalaxmi Mess. Here is the background information: ${restaurantInfo}` },
      { role: 'user', content: message }
    ];

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: promptMessages
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = groqResponse.data.choices?.[0]?.message?.content || "No reply from model.";
    res.json({ reply });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Groq API' });
  }
});

module.exports = router;
