import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, CheckCircle } from 'lucide-react';

interface TaskCreatedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChat: () => void;
}

export function TaskCreatedSuccessModal({
  isOpen,
  onClose,
  onViewChat,
}: TaskCreatedSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Animated Emoji */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    times: [0, 0.6, 1],
                    delay: 0.2
                  }}
                  className="text-7xl relative"
                >
                  😊
                  {/* Sparkle effects around emoji */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.6,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute -top-2 -right-2 text-2xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 1.2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute -bottom-2 -left-2 text-2xl"
                  >
                    ✨
                  </motion.div>
                </motion.div>
              </div>

              {/* Success message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Task Created!
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We're notifying active helpers nearby. They'll reach out soon through chat. 
                  <br />
                  <span className="font-semibold text-gray-700">Check your messages!</span>
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                {/* View Chat button */}
                <button
                  onClick={() => {
                    onViewChat();
                    onClose();
                  }}
                  className="w-full bg-[#CDFF00] text-black py-3 rounded-lg font-bold hover:bg-[#CDFF00]/90 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Go to Chat
                </button>

                {/* Got it button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Got it, thanks!
                </button>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute -top-2 -left-2 w-8 h-8 bg-[#CDFF00] rounded-full opacity-20"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#CDFF00] rounded-full opacity-20"
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}