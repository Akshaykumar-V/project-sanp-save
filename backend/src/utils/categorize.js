// ─── Transaction category keywords ───────────────────────────────
const CATEGORY_MAP = {
  food: [
    'swiggy',
    'zomato',
    'chai',
    'restaurant',
    'food',
    'cafe',
    'dhaba',
    'biryani',
    'pizza',
    'burger',
    'dominos',
    'mcdonalds',
    'kfc',
    'subway',
    'starbucks',
    'blinkit',
    'zepto',
    'instamart',
    'hotel',
    'bakery',
    'juice',
    'tea',
  ],

  transport: [
    'ola',
    'uber',
    'rapido',
    'bus',
    'metro',
    'train',
    'irctc',
    'petrol',
    'fuel',
    'parking',
    'toll',
    'auto',
    'cab',
    'taxi',
    'railway',
  ],

  shopping: [
    'amazon',
    'flipkart',
    'myntra',
    'ajio',
    'nykaa',
    'meesho',
    'snapdeal',
    'big bazaar',
    'dmart',
    'reliance',
    'shoppers stop',
    'lifestyle',
    'westside',
    'store',
    'mall',
    'retail',
    'wine shop',
  ],

  entertainment: [
    'netflix',
    'amazon prime',
    'hotstar',
    'disney',
    'spotify',
    'youtube',
    'gaana',
    'jio cinema',
    'bookmyshow',
    'pvr',
    'inox',
    'cinema',
    'movie',
    'gaming',
  ],

  health: [
    'gym',
    'fitness',
    'cult.fit',
    'hospital',
    'clinic',
    'pharmacy',
    'medical',
    'doctor',
    'medicine',
    'apollo',
    'practo',
    'medplus',
    'diagnostic',
    'lab',
  ],

  recharge: [
    'electricity',
    'water',
    'gas',
    'broadband',
    'internet',
    'mobile recharge',
    'dth',
    'airtel',
    'jio',
    'vi',
    'bsnl',
    'tata sky',
    'dish tv',
    'recharge',
    'bill',
  ],

  transfers: [
    'transfer',
    'salary',
    'freelance',
    'payment',
    'sent to',
    'received from',
    'upi',
    'neft',
    'imps',
  ],
};

// ─── Categorize transaction by merchant name ─────────────────────
function categorize(merchantName) {
  const lower = (merchantName || '').toLowerCase().trim();

  if (!lower) {
    return 'other';
  }

  let bestMatch = null;

  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        if (!bestMatch || keyword.length > bestMatch.keyword.length) {
          bestMatch = {
            category,
            keyword,
          };
        }
      }
    }
  }

  return bestMatch ? bestMatch.category : 'other';
}

module.exports = {
  categorize,
};