import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UploadZone from '../components/UploadZone'
import { useTransactions } from '../hooks/useTransactions'
import { uploadPDF } from '../utils/api'

function UploadPage() {
  const navigate = useNavigate()
  const { refetch } = useTransactions()
  
  const handleUpload = async (file) => {
    const result = await uploadPDF(file)
    if (result.count > 0) await refetch()
    if (!result.success) throw new Error(result.message || 'Upload failed')
    if (result.count > 0) setTimeout(() => navigate('/dashboard'), 1500)
    return result
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
              Your PDF is uploaded and processed on our server. Your transactions are stored in your private account.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default UploadPage
