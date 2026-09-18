const CATEGORY_RULES = {
  'Food & Dining': ['swiggy', 'zomato', 'chai', 'restaurant', 'food', 'cafe', 'dhaba', 'biryani', 'pizza', 'burger', 'dominos', 'mcdonalds', 'kfc', 'subway', 'starbucks', 'blinkit', 'zepto', 'instamart'],
  'Transport': ['ola', 'uber', 'rapido', 'bus', 'metro', 'train', 'irctc', 'petrol', 'fuel', 'parking', 'toll', 'auto', 'cab', 'taxi'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal', 'big bazaar', 'dmart', 'reliance', 'shoppers stop', 'lifestyle', 'westside'],
  'Entertainment': ['netflix', 'amazon prime', 'hotstar', 'disney', 'spotify', 'youtube', 'gaana', 'jio cinema', 'bookmyshow', 'pvr', 'inox', 'cinema', 'movie'],
  'Health & Fitness': ['gym', 'fitness', 'cult.fit', 'hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'medicine', 'apollo', 'practo'],
  'Recharge & Bills': ['electricity', 'water', 'gas', 'broadband', 'internet', 'mobile recharge', 'dth', 'airtel', 'jio', 'vi', 'bsnl', 'tata sky', 'dish tv'],
  'Transfers': ['transfer', 'salary', 'freelance', 'payment', 'sent to', 'received from', 'upi', 'neft', 'imps'],
}

export function categorizeTransaction(merchantName) {
  const lower = merchantName.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category
    }
  }
  return 'Other'
}
