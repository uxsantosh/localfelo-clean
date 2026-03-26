interface FloatingAvailabilityPillProps {
  onClick: () => void;
}

export function FloatingAvailabilityPill({ onClick }: FloatingAvailabilityPillProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 bg-black text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
      style={{ boxShadow: '0 4px 12px rgba(205, 255, 0, 0.3)' }}
    >
      <span className="w-2 h-2 bg-[#CDFF00] rounded-full animate-pulse" />
      <span className="text-sm font-semibold">Available for tasks</span>
    </button>
  );
}
