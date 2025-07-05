import { useEffect, useState } from 'react';

type ProgressBarProps = {
  completion: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ completion, label, className = '' }: ProgressBarProps) {
  const [displayedCompletion, setDisplayedCompletion] = useState(0);

  useEffect(() => {
    // Smooth animation for the progress bar
    const timer = setTimeout(() => {
      setDisplayedCompletion(completion);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [completion]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-stone-700 dark:text-stone-300">
          {label || 'Translation Progress'}
        </span>
        <span className="font-semibold text-stone-700 dark:text-stone-200">
          {Math.round(displayedCompletion)}%
        </span>
      </div>
      <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5">
        <div
          className="bg-blue-300 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayedCompletion}%` }}
        />
      </div>
    </div>
  );
}
