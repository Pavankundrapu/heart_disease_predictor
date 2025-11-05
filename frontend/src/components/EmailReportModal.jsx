import React, { useState, useEffect, useRef } from 'react';

function EmailReportModal({ open, onClose, onSend, loading, error }) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  const emailValid = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email.trim());

  useEffect(() => {
    if (open) {
      setEmail('');
      setTouched(false);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 180);
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg animate-fadeIn relative">
        <button
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600 font-bold"
          onClick={onClose}
          aria-label="Close email modal"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-5">Send Report by Email</h3>
        <label htmlFor="email-send" className="font-medium mb-2 block">Recipient Email:</label>
        <input
          id="email-send"
          ref={inputRef}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          className={`w-full p-3 border rounded-md ${touched&&!emailValid?'border-red-400':'border-gray-300'} focus:ring-2 focus:ring-blue-500 mb-2`}
          placeholder="example@email.com"
          aria-invalid={touched&&!emailValid}
          aria-describedby="email-desc"
        />
        <div id="email-desc" className="text-xs text-gray-500 mb-3">We will never share your email. You'll receive a PDF report.</div>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="flex gap-3 justify-end mt-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={onClose}
            disabled={loading}
          >Cancel</button>
          <button
            className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium focus:ring-2 focus:ring-blue-300 ${loading?'opacity-60':''}`}
            onClick={() => emailValid && onSend(email.trim())}
            disabled={!emailValid||loading}
          >{loading ? 'Sending…':'Send Now'}</button>
        </div>
      </div>
    </div>
  );
}

export default EmailReportModal;


