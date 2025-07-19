'use client';

import { useState } from 'react';
import { AlertCircle, Phone, X } from 'lucide-react';

const RWANDA_HELPLINES = [
  { 
    name: 'Mental Health Helpline - RBC', 
    number: '116',
    description: '24/7 free & confidential support for emotional distress'
  },
  { 
    name: 'Caritas Rwanda Crisis Support', 
    number: '3525',
    description: 'Psychological support & crisis intervention (8AM-10PM daily)'
  },
  { 
    name: 'Solid Minds Counseling Clinic', 
    number: '+250 788 503 528',
    description: 'Licensed outpatient therapy for depression, anxiety & trauma'
  },
  { 
    name: 'MindSky Rwanda Youth Helpline', 
    number: '+250 788 304 782',
    description: 'Youth mental health & suicide prevention (9AM-6PM Mon-Sat)'
  },
  { 
    name: 'Emergency Services', 
    number: '112',
    description: 'National emergency line for police, fire & medical services'
  },
];

const ENCOURAGING_QUOTES = [
  'Your mental health matters. Professional help is available.',
  'You are not alone. Crisis support is just a call away.',
  'Taking the first step to seek help shows incredible strength.',
  'Every storm runs out of rain. Reach out for support.',
  'Help is available 24/7. You deserve support and care.',
];

export default function EmergencySupport() {
  const [open, setOpen] = useState(false);
  const quote = ENCOURAGING_QUOTES[Math.floor(Math.random() * ENCOURAGING_QUOTES.length)];

interface Helpline {
    name: string;
    number: string;
    description: string;
}

interface MouseEventWithTarget extends React.MouseEvent<HTMLDivElement> {}

const handleBackdropClick = (e: MouseEventWithTarget) => {
    if (e.target === e.currentTarget) {
        setOpen(false);
    }
};

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-base animate-bounce"
        onClick={() => setOpen(true)}
        aria-label="Need urgent help?"
      >
        <AlertCircle className="w-5 h-5 animate-pulse" />
        Need urgent help?
      </button>

      {/* Modal */}
      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pt-20"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors z-10"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6 flex items-center gap-3 pr-10">
              <AlertCircle className="w-8 h-8 text-red-500 animate-pulse flex-shrink-0" />
              <h2 className="text-2xl font-bold text-red-600">Emergency Support</h2>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-700 mb-4">Rwanda Crisis Hotlines & Mental Health Support:</p>
              <div className="space-y-3">
                {RWANDA_HELPLINES.map((line) => (
                  <div key={line.number} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">{line.name}</div>
                      <a 
                        href={`tel:${line.number}`} 
                        className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1"
                      >
                        {line.number}
                      </a>
                      <div className="text-sm text-gray-600">{line.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
              <p className="italic text-purple-700 font-semibold text-center leading-relaxed">
                "{quote}"
              </p>
            </div>

            <div className="text-center">
              <p className="text-base text-gray-700 font-medium mb-2">
                Crisis support is available 24/7. You don't have to face this alone.
              </p>
              <p className="text-sm text-gray-600">
                Free, confidential help for mental health crises, emotional distress, and suicide prevention.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease;
        }
      `}</style>
    </>
  );
}