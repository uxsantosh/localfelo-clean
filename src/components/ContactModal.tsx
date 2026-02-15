import React from 'react';
import { X, Mail, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  const email = 'contact@localfelo.com';
  const whatsapp = '+91-9063205739';
  const whatsappLink = 'https://wa.me/919063205739';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Contact Us</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-heading" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-body text-sm">
            We'd love to hear from you! Whether you're an investor, partner, or have general inquiries, reach out to us:
          </p>

          {/* Email */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-muted uppercase">Email</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <a
                href={`mailto:${email}`}
                className="text-black hover:text-primary transition-colors break-all"
              >
                {email}
              </a>
              <button
                onClick={() => copyToClipboard(email, 'Email')}
                className="p-2 hover:bg-white rounded-lg transition-colors shrink-0"
                title="Copy email"
              >
                <Copy className="w-4 h-4 text-body" />
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs font-semibold text-muted uppercase">WhatsApp</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-green-600 transition-colors"
              >
                {whatsapp}
              </a>
              <button
                onClick={() => copyToClipboard(whatsapp, 'WhatsApp number')}
                className="p-2 hover:bg-white rounded-lg transition-colors shrink-0"
                title="Copy number"
              >
                <Copy className="w-4 h-4 text-body" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2 pt-2">
            <a
              href={`mailto:${email}`}
              className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
