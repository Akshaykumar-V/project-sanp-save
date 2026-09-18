const Groq = require('groq-sdk');
const Transaction = require('../models/Transaction');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate personalized financial tips using Groq AI
 * POST /api/ai/tips
 */
const generateFinancialTips = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all user transactions
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    // 2. If no transactions, return generic tips
    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        tips: [
          {
            title: "Start Tracking Your Expenses",
            description: "Upload your first PhonePe statement to get personalized insights about your spending habits.",
            potentialSavings: "₹0"
          },
          {
            title: "Set a Monthly Budget",
            description: "Once you have data, create category-wise budgets to control spending in areas that matter most.",
            potentialSavings: "₹0"
          },
          {
            title: "Track Repeated Small Expenses",
            description: "Small daily expenses like tea, snacks, or auto rides can add up quickly. We'll help you identify these patterns.",
            potentialSavings: "₹0"
          }
        ],
        generatedAt: new Date().toISOString(),
        source: 'default',
        message: 'Upload transactions to get AI-powered personalized tips'
      });
    }

    // 3. Build spending summary (privacy-safe - no raw transactions)
    let totalSpent = 0;
    let totalReceived = 0;
    const categoryTotals = {};
    const merchantTotals = {};

    for (const txn of transactions) {
      if (txn.type === 'DEBIT') {
        totalSpent += txn.amount;
        categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
        merchantTotals[txn.merchant] = (merchantTotals[txn.merchant] || 0) + txn.amount;
      } else if (txn.type === 'CREDIT') {
        totalReceived += txn.amount;
      }
    }

    // Top 5 merchants
    const topMerchants = Object.entries(merchantTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Date range
    const oldestDate = transactions[transactions.length - 1]?.date;
    const newestDate = transactions[0]?.date;

    const summary = {
      totalSpent: Math.round(totalSpent),
      totalReceived: Math.round(totalReceived),
      netBalance: Math.round(totalReceived - totalSpent),
      savingsRate: totalReceived > 0 ? Math.round((totalReceived - totalSpent) / totalReceived * 100) : 0,
      transactionCount: transactions.length,
      avgTransaction: Math.round(totalSpent / transactions.filter(t => t.type === 'DEBIT').length),
      categories: categoryTotals,
      topMerchants: topMerchants,
      dateRange: {
        from: oldestDate?.toISOString().split('T')[0],
        to: newestDate?.toISOString().split('T')[0]
      }
    };

    // 4. Create prompt for Groq
    const systemPrompt = `You are a friendly and helpful financial advisor for Indian millennials and Gen-Z. 
Analyze spending data and provide 3-5 specific, actionable money-saving tips. 
Be conversational, use Indian context (₹ symbol, mention Indian services like Swiggy/Zomato if relevant).
Focus on realistic, practical advice that the user can implement immediately.`;

    const userPrompt = `Here's a user's spending summary:
- Total Spent: ₹${summary.totalSpent}
- Total Received: ₹${summary.totalReceived}
- Net Balance: ₹${summary.netBalance}
- Savings Rate: ${summary.savingsRate}%
- Number of Transactions: ${summary.transactionCount}
- Average Transaction: ₹${summary.avgTransaction}

Category Breakdown:
${Object.entries(summary.categories)
  .map(([cat, amt]) => `- ${cat}: ₹${Math.round(amt)} (${Math.round(amt / summary.totalSpent * 100)}%)`)
  .join('\n')}

Top 5 Merchants:
${summary.topMerchants.map(m => `- ${m.name}: ₹${Math.round(m.amount)}`).join('\n')}

Generate 3-5 personalized money-saving tips. Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "tips": [
    {
      "title": "Short actionable title",
      "description": "Specific advice based on the data above",
      "potentialSavings": "₹X per month"
    }
  ]
}`;

    // 5. Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" } // Force JSON response
    });

    // 6. Parse response
    const responseText = completion.choices[0].message.content;
    let tips;

    try {
      const parsed = JSON.parse(responseText);
      tips = parsed.tips || [];
    } catch (parseError) {
      // Fallback: try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        tips = parsed.tips || [];
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // 7. Return tips
    res.status(200).json({
      success: true,
      tips: tips,
      generatedAt: new Date().toISOString(),
      source: 'groq',
      summary: summary
    });

  } catch (error) {
    console.error('AI Tips Generation Error:', error);

    // Handle specific errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Groq API key. Please check your environment variables.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again in a minute.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate tips. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateFinancialTips
};
