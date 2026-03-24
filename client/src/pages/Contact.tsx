import { useState } from 'react';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';

const faqs = [
  { q: 'How do I register as a farmer?', a: 'Click "Get Started" on the homepage, select the "Farmer" role, fill in your details including farm name and location, and submit. You can start listing crops immediately.' },
  { q: 'How are payments processed?', a: 'All payments are processed securely through Razorpay. Buyers pay online, and farmers receive their earnings directly to their linked bank account after order completion.' },
  { q: 'What is the commission/fee structure?', a: 'Smart Farmer charges a flat 2% platform fee on each transaction. There are no hidden charges, listing fees, or subscription costs.' },
  { q: 'How does the AI price prediction work?', a: 'Our AI model analyzes 30 days of historical mandi prices from Agmarknet data to predict price trends for the upcoming 7 days. This helps farmers decide the best time to sell.' },
  { q: 'Can I track my order after purchase?', a: 'Yes! Go to Dashboard → Orders and click on any order to see real-time tracking with status updates from the farmer.' },
  { q: 'How do I report a problem with an order?', a: 'Use the contact form below or email us at support@smartfarmer.in with your order ID. We respond within 24 hours.' },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to /api/support
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Contact & Support</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Have questions or need help? We're here for you. Reach out through any channel below.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Email Us</h3>
          <p className="text-sm text-gray-500 mt-1">support@smartfarmer.in</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Call Us</h3>
          <p className="text-sm text-gray-500 mt-1">+91 80-1234-5678</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Visit Us</h3>
          <p className="text-sm text-gray-500 mt-1">Koramangala, Bangalore 560034</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FAQ Accordion */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800">Message Sent!</h3>
              <p className="text-sm text-green-700 mt-2">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    required
                    type="text"
                    className="input-field w-full border py-2"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    className="input-field w-full border py-2"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  className="input-field w-full border py-2"
                  placeholder="e.g., Order Issue, Account Help"
                  value={form.subject}
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  className="input-field w-full border py-2 resize-none"
                  placeholder="Describe your issue or question..."
                  value={form.message}
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2 py-3">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
