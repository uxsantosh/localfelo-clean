import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypingAnimation({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  className = '',
}: TypingAnimationProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const fullText = texts[currentTextIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && currentText === fullText) {
      // Finished typing, pause before deleting
      setIsPaused(true);
      return;
    }

    if (isDeleting && currentText === '') {
      // Finished deleting, move to next text
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          // Delete one character
          setCurrentText(fullText.substring(0, currentText.length - 1));
        } else {
          // Type one character
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  );
}
