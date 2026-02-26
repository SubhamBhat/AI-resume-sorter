'use client';

import { Brain } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onBrandClick?: () => void;
}

export default function Header({ onBrandClick }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4"
            onClick={(e) => {
              if (onBrandClick) {
                e.preventDefault();
                onBrandClick();
              }
            }}
          >
            <div className="rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 p-2.5 shadow-lg shadow-primary/20">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">TalentAI</h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                INTELLIGENT RESUME SCREENING
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
