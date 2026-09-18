// Category keyword mapping (matches frontend categorize.js)
const CATEGORY_MAP = {
  food: [
    'swiggy', 'zomato', 'chai', 'restaurant', 'food', 'cafe', 'dhaba',
    'biryani', 'pizza', 'burger', 'dominos', 'mcdonalds', 'kfc', 'subway',
    'starbucks', 'blinkit', 'zepto', 'instamart',
  ],
  transport: [
    'ola', 'uber', 'rapido', 'bus', 'metro', 'train', 'irctc', 'petrol',
    'fuel', 'parking', 'toll', 'auto', 'cab', 'taxi',
  ],
  shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal',
    'big bazaar', 'dmart', 'reliance', 'shoppers stop', 'lifestyle', 'westside',
  ],
  entertainment: [
    'netflix', 'amazon prime', 'hotstar', 'disney', 'spotify', 'youtube',
    'gaana', 'jio cinema', 'bookmyshow', 'pvr', 'inox', 'cinema', 'movie',
  ],
  health: [
    'gym', 'fitness', 'cult.fit', 'hospital', 'clinic', 'pharmacy', 'medical',
    'doctor', 'medicine', 'apollo', 'practo',
  ],
  recharge: [
    'electricity', 'water', 'gas', 'broadband', 'internet', 'mobile recharge',
    'dth', 'airtel', 'jio', 'vi', 'bsnl', 'tata sky', 'dish tv',
  ],
  transfers: [
    'transfer', 'salary', 'freelance', 'sent to', 'received from',
    'upi', 'neft', 'imps',
  ],
};

function categorize(merchantName) {
  const lower = (merchantName || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'other';
}

module.exports = { categorize };
