const axios = require('axios');

exports.generateIdeas = async (req, res) => {
  try {
    const { topic = 'project' } = req.body || {};

    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        message: 'Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your .env file.' 
      });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY.trim();
    if (!apiKey.startsWith('pplx-')) {
      return res.status(500).json({ 
        message: 'Invalid Perplexity API key format. It should start with "pplx-".' 
      });
    }

    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a creative idea generator. Generate exactly 5 innovative, practical, and actionable project ideas based on the given topic. Format as a numbered list with detailed descriptions.'
            },
            {
              role: 'user',
              content: `Generate 5 project ideas for: ${topic}. Each idea should be specific, practical, and include implementation details.`
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
      if (!text.trim()) throw new Error('Empty response from Perplexity API');

      let ideas = text
        .split(/\n+/)
        .map(line => line.replace(/^\s*[\d]+[\.\)]\s*/, '').replace(/^\s*[-•*]\s*/, '').trim())
        .filter(line => line.length > 15)
        .slice(0, 5);

      if (ideas.length < 3) {
        ideas = text
          .split(/(?:\d+\.|\n-|\n•)/)
          .map(s => s.trim())
          .filter(s => s.length > 20)
          .slice(0, 5);
      }

      if (ideas.length < 1) ideas = [text.trim()];

      return res.json({ 
        source: 'perplexity', 
        ideas,
        topic,
        count: ideas.length,
        success: true,
        model_used: 'sonar-pro'
      });

    } catch (apiError) {
      if (apiError.response?.status === 401) {
        return res.status(401).json({ message: 'Invalid Perplexity API key.', error: 'Authentication failed' });
      } else if (apiError.response?.status === 400) {
        return res.status(400).json({ message: 'Bad request to Perplexity API.', error: apiError.response?.data?.error?.message });
      } else if (apiError.response?.status === 429) {
        return res.status(429).json({ message: 'Perplexity API rate limit exceeded.', error: 'Rate limit exceeded' });
      } else {
        return res.status(500).json({ message: 'Failed to generate ideas.', error: apiError.message });
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error while generating ideas.', error: err.message, success: false });
  }
};
