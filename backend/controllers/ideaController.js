// backend/controllers/ideaController.js
const axios = require('axios');

exports.generateIdeas = async (req, res) => {
  try {
    const { topic = 'project' } = req.body || {};

    // Check if Perplexity API key exists
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        message: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your .env file.' 
      });
    }

    // Validate API key format
    const apiKey = process.env.PERPLEXITY_API_KEY.trim();
    if (!apiKey.startsWith('pplx-')) {
      return res.status(500).json({ 
        message: 'Invalid Perplexity API key format. API key should start with "pplx-"' 
      });
    }

    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro', // ✅ Valid model name
          messages: [
            {
              role: 'system',
              content: 'You are a creative idea generator. Generate exactly 5 innovative, practical, and actionable project ideas based on the given topic. Format each idea as a numbered list (1., 2., 3., etc.) with detailed descriptions.'
            },
            {
              role: 'user',
              content: `Generate 5 creative, detailed, and practical project ideas for: ${topic}. Make each idea specific and actionable with implementation details.`
            }
          ],
          max_tokens: 400,
          temperature: 0.8,
          top_p: 0.9,
          return_citations: true,
          search_recency_filter: 'month'
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const text = response.data.choices?.[0]?.message?.content || '';
      
      if (!text.trim()) {
        throw new Error('Empty response from Perplexity API');
      }

      console.log('✅ Perplexity Response:', text);

      // Parse the response to extract ideas
      let ideas = text
        .split(/\n+/)
        .map((line) => {
          return line.replace(/^\s*[\d]+[\.\)]\s*/, '') // Remove "1. " or "1) "
                    .replace(/^\s*[-•*]\s*/, '')        // Remove "- " or "• " or "* "
                    .trim();
        })
        .filter(line => line.length > 15) // Filter out short lines
        .slice(0, 5);

      // Alternative parsing if first method doesn't work
      if (ideas.length < 3) {
        ideas = text
          .split(/(?:\d+\.|\n-|\n•)/) // Split on numbered lists or bullet points
          .map(s => s.trim())
          .filter(s => s.length > 20)
          .slice(0, 5);
      }

      // Final fallback
      if (ideas.length < 1) {
        ideas = [text.trim()];
      }

      return res.json({ 
        source: 'perplexity', 
        ideas: ideas,
        topic: topic,
        count: ideas.length,
        success: true,
        model_used: 'sonar-pro'
      });

    } catch (apiError) {
      console.error('🔴 Perplexity API Error:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      if (apiError.response?.status === 401) {
        return res.status(401).json({ 
          message: 'Invalid Perplexity API key. Please check your PERPLEXITY_API_KEY.',
          error: 'Authentication failed'
        });
      } else if (apiError.response?.status === 400) {
        return res.status(400).json({ 
          message: 'Bad request to Perplexity API. Check model name and parameters.',
          error: apiError.response?.data?.error?.message || 'Invalid request parameters',
          details: apiError.response?.data
        });
      } else if (apiError.response?.status === 429) {
        return res.status(429).json({ 
          message: 'Perplexity API rate limit exceeded.',
          error: 'Rate limit exceeded'
        });
      } else {
        return res.status(500).json({ 
          message: 'Failed to generate ideas from Perplexity API.',
          error: apiError.response?.data?.message || apiError.message
        });
      }
    }

  } catch (err) {
    console.error('🔴 General Error:', err);
    res.status(500).json({ 
      message: 'Server error occurred while generating ideas.',
      error: err.message,
      success: false
    });
  }
};
