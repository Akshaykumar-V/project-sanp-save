// PDF.js integration for parsing PhonePe statements
export async function parsePDF(file) {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker source (pdfjs-dist v4+ uses .mjs extension)
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }
    
    return parsePhonePeStatement(fullText)
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF. Please ensure it is a valid PhonePe statement.')
  }
}

function parsePhonePeStatement(text) {
  const transactions = []
  
  // Basic pattern matching for PhonePe statements
  // Pattern: date, merchant, amount, type
  const lines = text.split('\n')
  let idCounter = 1
  
  lines.forEach(line => {
    // Try to extract transaction data from common PhonePe PDF formats
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
    const amountPattern = /₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g
    
    const dateMatch = line.match(datePattern)
    const amounts = [...line.matchAll(amountPattern)]
    
    if (dateMatch && amounts.length > 0) {
      const dateStr = dateMatch[1]
      const amount = parseFloat(amounts[0][1].replace(/,/g, ''))
      const isCredit = line.toLowerCase().includes('credit') || line.toLowerCase().includes('received')
      
      // Extract merchant name (simplified)
      const merchant = extractMerchant(line) || 'Unknown Merchant'
      
      if (amount > 0 && amount < 1000000) {
        transactions.push({
          id: idCounter++,
          date: formatDate(dateStr),
          merchant,
          amount,
          type: isCredit ? 'credit' : 'debit',
          category: 'Other',
        })
      }
    }
  })
  
  return transactions.length > 0 ? transactions : null
}

function extractMerchant(line) {
  // Remove common prefixes/suffixes and extract merchant name
  const cleaned = line
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{2})?/g, '')
    .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return cleaned.slice(0, 50) || null
}

function formatDate(dateStr) {
  const parts = dateStr.split(/[\/\-]/)
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2]
    return `${year}-${month}-${day}`
  }
  return new Date().toISOString().split('T')[0]
}
