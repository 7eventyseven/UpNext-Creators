"use client";

interface AnimatedHeadlineProps {
  words: { text: string; highlight?: boolean }[];
  className?: string;
}

export function AnimatedHeadline({ words, className = "" }: AnimatedHeadlineProps) {
  return (
    <h1
      className={`relative text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight flex flex-wrap justify-center gap-x-2.5 gap-y-1 ${className}`}
    >
      {words.map((word, i) => (
        <span
          key={`${word.text}-${i}`}
          className="relative inline-block opacity-0 animate-hero-word overflow-hidden"
          style={{ animationDelay: `${200 + i * 160}ms` }}
        >
          <span className="hero-shiny-text">{word.text}</span>
          <span
            aria-hidden
            className="hero-shine-sweep"
            style={{ animationDelay: `${700 + i * 160}ms` }}
          />
        </span>
      ))}
    </h1>
  );
}
