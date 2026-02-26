'use client';

import { ChevronRight, Award, Briefcase, BookOpen } from 'lucide-react';
import type { Candidate } from '@/types';

interface ResultsGridProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export default function ResultsGrid({
  candidates,
  onSelectCandidate,
}: ResultsGridProps) {
  return (
    <div className="space-y-4">
      {candidates.map((candidate, index) => (
        <button
          key={candidate.id}
          onClick={() => onSelectCandidate(candidate)}
          className="group w-full rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header with rank and score */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-muted-foreground/50 tracking-wide">
                  #{index + 1}
                </span>
                <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {candidate.name || candidate.filename}
                </h3>
              </div>
              {candidate.filename && (
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  {candidate.filename}
                </div>
              )}

              {/* Score bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Match Score
                  </span>
                  <span className="text-base font-bold text-primary">
                    {candidate.matchPercentage}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                    style={{ width: `${candidate.matchPercentage}%` }}
                  />
                </div>
              </div>

              {/* Summary */}
              <p className="mt-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                {candidate.summary}
              </p>

              {/* Tags - Skills, Experience, Education */}
              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.extractedSkills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={`skill-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-300 border border-blue-500/20"
                  >
                    <Briefcase className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
                {candidate.extractedExperience.slice(0, 2).map((exp, idx) => (
                  <span
                    key={`exp-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-300 border border-purple-500/20"
                  >
                    <Award className="h-3 w-3" />
                    {exp}
                  </span>
                ))}
                {candidate.extractedEducation.slice(0, 1).map((edu, idx) => (
                  <span
                    key={`edu-${idx}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-300 border border-green-500/20"
                  >
                    <BookOpen className="h-3 w-3" />
                    {edu}
                  </span>
                ))}
                {candidate.extractedSkills.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    +{candidate.extractedSkills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
