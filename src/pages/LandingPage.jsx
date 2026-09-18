import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const features = [
    { emoji: '📊', title: 'Smart Analytics', desc: 'Beautiful pie charts, bar graphs, and spending breakdowns — instantly generated from your PhonePe PDF.' },
    { emoji: '🤖', title: 'AI Financial Advisor', desc: 'Groq AI (Llama 3.3 70B) analyzes your spending and gives personalized tips in Indian context with ₹ amounts.' },
    { emoji: '🎯', title: 'Budget Goals', desc: 'Set monthly savings targets and per-category budgets. Track progress with visual bars and auto-achievements.' },
    { emoji: '🔒', title: '100% Private', desc: 'Only aggregated summaries go to AI — never raw transactions. Your data stays in your encrypted account.' },
    { emoji: '⚡', title: 'Instant Parsing', desc: 'Drop your PhonePe PDF and see 200+ transactions categorized in under 10 seconds. Zero manual entry.' },
    { emoji: '🔍', title: 'Waste Detection', desc: 'Automatically detects repeated small expenses (chai, snacks, subscriptions) that silently drain your wallet.' },
  ]

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up in 10 seconds with just your email. No phone number or KYC needed.', icon: '👤' },
    { num: '02', title: 'Upload PDF', desc: 'Download your PhonePe statement and drag-drop it. We parse every transaction automatically.', icon: '📄' },
    { num: '03', title: 'Get Insights', desc: 'See your dashboard with charts, scores, waste alerts, and AI-powered saving tips instantly.', icon: '💡' },
  ]

  const stats = [
    { value: '228+', label: 'Transactions Parsed', sub: 'per statement' },
    { value: '8', label: 'Smart Categories', sub: 'auto-classified' },
    { value: '9', label: 'Analytics Functions', sub: 'deep insights' },
    { value: '<10s', label: 'Processing Time', sub: 'PDF to dashboard' },
  ]

  const faqs = [
    { q: 'Which bank statements are supported?', a: 'Currently we support PhonePe UPI transaction history PDFs. Support for GPay, Paytm, and bank statements (HDFC, SBI, ICICI) is coming in v1.1.' },
    { q: 'Is my financial data safe?', a: 'Yes. Your PDF is parsed on our secure server and stored in your encrypted MongoDB account. Only aggregated summaries (not raw transactions) are sent to the AI for tips. We never share or sell your data.' },
    { q: 'How does the AI advisor work?', a: 'We use Groq\'s Llama 3.3 70B model. It receives a privacy-safe summary of your spending (totals, categories, top merchants) and returns 3-5 personalized money-saving tips tailored for Indian users.' },
    { q: 'Is it really free?', a: 'Yes, SnapSave is completely free. No premium tier, no hidden charges, no ads. We built this as a passion project for the Indian Gen-Z community.' },
    { q: 'Can I delete my data?', a: 'Absolutely. There\'s a "Clear Data" button on the dashboard that permanently deletes all your transactions from both the server and your browser in one click.' },
    { q: 'How do I download my PhonePe statement?', a: 'Open PhonePe → Profile icon → Transaction History → Select date range → Download Statement → Choose PDF. Then upload that PDF to SnapSave.' },
  ]
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col relative overflow-hidden ai-gradient-bg">
        {/* Animated AI orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl ai-orb" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl ai-orb" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl ai-orb" style={{ animationDelay: '4s' }} />
          {/* Grid overlay for AI feel */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-white text-xl font-bold">SnapSave</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-white/60 text-sm hidden md:inline">👋 {user?.name}</span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-white text-sm font-medium glass-dark px-5 py-2.5 rounded-full hover:bg-white/20 transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-white/50 text-sm hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-white/80 text-sm font-medium hover:text-white transition-colors hidden md:block"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold bg-white text-gray-900 px-6 py-2.5 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 text-center py-16 md:py-24 relative z-10">
          <div className="page-enter max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-sm font-medium">🇮🇳 Built for Indian PhonePe UPI Users</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-shadow">
              Know Where Your Money
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actually Goes
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload your PhonePe statement and get instant AI-powered insights, smart categorization, waste detection, and custom saving tips in under 10 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate(isAuthenticated ? '/upload' : '/auth')}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold text-base md:text-lg px-8 py-3.5 rounded-full shadow-lg shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 min-w-[200px]"
              >
                {isAuthenticated ? '📁 Upload PDF' : '🚀 Get Started Free'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white font-medium border border-white/30 px-6 py-3.5 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                View Live Demo →
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { icon: '🔒', text: '100% Private & Encrypted' },
                { icon: '🧠', text: 'Llama 3.3 70B AI' },
                { icon: '⚡', text: 'Sub-10s Processing' },
                { icon: '✨', text: 'Free Forever' },
              ].map((badge) => (
                <div key={badge.text} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 text-center">
                  <span className="mr-1.5 text-base">{badge.icon}</span>
                  <span className="text-white/90 text-xs font-semibold">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 border-y border-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">{s.value}</div>
              <div className="text-white font-medium text-xs md:text-sm">{s.label}</div>
              <div className="text-gray-500 text-[11px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="bg-gray-950 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              From PDF to insights in <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">3 steps</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base">No complex setup. No bank credentials needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/40 transition-all duration-300">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-1">Step {step.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Everything you need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">spend smarter</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">Intelligent tools designed specifically for tracking daily UPI payments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Advisor Preview Card */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-950 to-gray-950 py-16 px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/10 text-purple-300 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">AI Powered</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Smart Savings Tips via Groq Llama 3.3 AI
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto mb-8">
            Get personalized money-saving advice targeted to your actual spending habits.
          </p>

          <div className="bg-gray-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🤖</span>
              <span className="text-purple-400 font-semibold text-xs md:text-sm">Sample AI Insights:</span>
            </div>
            <div className="space-y-2.5">
              {[
                '💡 "You spent ₹2,340 on food delivery this month. Cooking 3 meals/week at home could save ₹1,400."',
                '☕ "Your daily ₹30 chai habit = ₹900/month. A ₹500 thermos saves ₹400/month."',
                '🚗 "Transport cost peaked on weekends. A monthly metro pass saves ~₹800 vs daily tickets."',
              ].map((tip, i) => (
                <div key={i} className="bg-white/5 rounded-xl px-3.5 py-2.5 text-white/80 text-xs md:text-sm leading-relaxed border border-white/5">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Privacy & Security</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your financial data stays private
            </h2>
            <p className="text-gray-500 text-sm md:text-base">We prioritize security and privacy above everything else.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🔐', title: 'Encrypted Storage', desc: 'All records encrypted with AES-256 in MongoDB Atlas with secure JWT tokens.' },
              { icon: '🛡️', title: 'Privacy-Safe AI', desc: 'Only aggregated category totals are shared with AI — never raw account details.' },
              { icon: '🗑️', title: 'One-Click Delete', desc: 'Wipe all your transactions permanently from both server and browser anytime.' },
            ].map((item, i) => (
              <div key={i} className="bg-green-50/60 border border-green-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">{item.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  <span className={`text-gray-400 text-lg flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-gray-500 text-xs md:text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative overflow-hidden">
        <div className="ai-gradient-bg py-16 px-4">
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Ready to take control of your money?</h2>
            <p className="text-white/70 mb-6 text-base">Understand where your UPI spending goes in less than a minute.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(isAuthenticated ? '/upload' : '/auth')}
                className="bg-white text-gray-900 font-semibold text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                {isAuthenticated ? 'Go to Dashboard →' : 'Start for Free →'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white font-medium border border-white/30 px-6 py-3.5 rounded-full hover:bg-white/10 transition-all text-sm"
              >
                Try Demo First →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-8 px-4 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="font-bold text-white text-sm">SnapSave</span>
            <span className="text-gray-600 ml-2">© 2026 SnapSave. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Demo</button>
            <button onClick={() => navigate('/auth')} className="hover:text-white transition-colors">Login</button>
            <button onClick={() => navigate(isAuthenticated ? '/upload' : '/auth')} className="hover:text-white transition-colors">Upload</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
