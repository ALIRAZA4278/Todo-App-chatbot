"use client";

/**
 * Chat panel header with title and close button.
 */

interface ChatHeaderProps {
  onClose: () => void;
  onReset?: () => void;
}

export function ChatHeader({ onClose, onReset }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl">
      {/* Bot avatar and title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-sm">TodoBot</h2>
          <p className="text-xs text-blue-100">Your AI task assistant</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Reset conversation button */}
        {onReset && (
          <button
            onClick={onReset}
            aria-label="Start new conversation"
            title="Start new conversation"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
