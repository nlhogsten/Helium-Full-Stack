'use client';

import { useEffect, useState } from 'react';
import { useTranslationCompletion } from '@/lib/react-query/analyticsHooks';
import { ProgressBar } from './ProgressBar';

export function TranslationProgress() {
  const { data: completionData } = useTranslationCompletion();
  const [overallCompletion, setOverallCompletion] = useState(0);

  // Calculate overall completion percentage
  useEffect(() => {
    if (!completionData) return;
    
    const languages = Object.keys(completionData);
    if (languages.length === 0) {
      setOverallCompletion(0);
      return;
    }
    
    const total = languages.reduce((sum, lang) => sum + (completionData[lang] || 0), 0);
    const average = total / languages.length;
    setOverallCompletion(average);
  }, [completionData]);

  if (!completionData) return null;

  return (
    <div className="w-48">
      <ProgressBar 
        completion={overallCompletion} 
        label="Overall Progress"
        className="text-xs"
      />
    </div>
  );
}
