"use client";

/**
 * Floating chat icon button.
 * Fixed position in bottom-right corner.
 */

interface ChatIconProps {
  onClick: () => void;
  isOpen: boolean;
}

export function ChatIcon({ onClick, isOpen }: ChatIconProps) {
  // Hide icon when panel is open on mobile (panel takes full focus)
  // Show on desktop for visual consistency
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Open chat with TodoBot"
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 z-40 flex items-center justify-center group"
    >
      {/* Chat bubble icon */}
      <svg
        className="w-6 h-6 transition-transform group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with TodoBot
      </span>
    </button>
  );
}
