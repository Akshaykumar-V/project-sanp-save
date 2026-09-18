import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UploadZone from '../components/UploadZone'
import { useTransactions } from '../hooks/useTransactions'
import { sampleTransactions } from '../data/sampleData'
import { useAuth } from '../context/AuthContext'
import { uploadPDF } from '../utils/api'

function UploadPage() {
  const navigate = useNavigate()
  const { uploadTransactions, refetch } = useTransactions()
  const { isAuthenticated } = useAuth()
  
  const handleUpload = async (transactions, filename, file) => {
    if (isAuthenticated && file) {
      try {
        // Upload PDF to backend
        const result = await uploadPDF(file)
        // Refetch transactions from server so dashboard has fresh data
        await refetch()
        setTimeout(() => navigate('/dashboard'), 1500)
        return
      } catch (err) {
        console.warn('Backend upload failed, using local parse:', err.message)
      }
    }

    // Fallback: use locally parsed data or sample data
    const data = transactions || sampleTransactions
    uploadTransactions(data, filename)
    setTimeout(() => navigate('/dashboard'), 1500)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your PhonePe Statement</h1>
          <p className="text-neutral">Upload your PDF to get instant AI-powered spending insights</p>
        </div>
        
        {/* Upload Zone */}
        <UploadZone onUpload={handleUpload} />
        
        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-h4 font-semibold text-gray-900 mb-5">
            📱 How to download your PhonePe statement:
          </h3>
          <div className="space-y-4">
            {[
              { step: 1, text: 'Open PhonePe app → Tap on your profile icon (top right)' },
              { step: 2, text: 'Go to "Transaction History" → Select date range (up to 6 months)' },
              { step: 3, text: 'Tap "Download Statement" → Choose PDF format → Share/Save to your device' },
            ].map(({ step, text }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                  {step}
                </div>
                <p className="text-gray-700 pt-1 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Privacy Badge */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔒</span>
          </div>
          <div>
            <p className="font-semibold text-green-800">Privacy First</p>
            <p className="text-sm text-green-700 mt-0.5 leading-relaxed">
              {isAuthenticated
                ? 'Your PDF is securely uploaded and processed on our server. Your data is stored in your private account and is never shared.'
                : 'Your PDF is processed entirely in your browser. No data is uploaded to any server. Your financial data stays 100% private.'}
            </p>
          </div>
        </div>
        
        {/* Try with sample data */}
        <div className="mt-8 text-center">
          <button
            onClick={() => handleUpload(null, 'Sample Data')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition-all hover:shadow-sm"
          >
            <span>🧪</span>
            Don&apos;t have a PDF? Try with sample data
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
