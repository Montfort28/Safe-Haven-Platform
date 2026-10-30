'use client';

import { useState } from 'react';
import { FaCircleExclamation as AlertCircle, FaPhone as Phone, FaXmark as X } from 'react-icons/fa6';
import {
  INTERNATIONAL_HELPLINE_DIRECTORY,
  RWANDA_HELPLINES,
} from '@/components/emergencyHelplines';

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
              <p className="text-lg font-semibold text-gray-700 mb-4">Rwanda Emergency & Mental Health Support</p>
              <div className="space-y-3">
                {RWANDA_HELPLINES.map((line) => (
                  <div key={line.number} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">{line.name}</div>
                      <a 
                        href={`tel:${line.number.replace(/[^\d+]/g, '')}`}
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

            <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4">
              <h3 className="font-semibold text-gray-800">Outside Rwanda?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Find a verified crisis helpline in your country. If you or someone else is in
                immediate danger, contact your local emergency services.
              </p>
              <a
                className="mt-3 inline-flex font-semibold text-blue-700 underline hover:text-blue-800"
                href={INTERNATIONAL_HELPLINE_DIRECTORY}
                target="_blank"
                rel="noreferrer"
              >
                Find support by country
              </a>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
              <p className="italic text-purple-700 font-semibold text-center leading-relaxed">
                "{quote}"
              </p>
            </div>

            <div className="text-center">
              <p className="text-base text-gray-700 font-medium mb-2">
                You don't have to face this alone. Reach out to someone who can help.
              </p>
              <p className="text-sm text-gray-600">
                Helpline availability and services vary by location.
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