'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InputSection from '@/components/InputSection';
import ResultsGrid from '@/components/ResultsGrid';
import CandidateDrawer from '@/components/CandidateDrawer';
import AnalyticsSection from '@/components/AnalyticsSection';
import { Toaster } from 'sonner';
import type { Candidate } from '@/types';

export default function Home() {
  const [results, setResults] = useState<Candidate[]>([]);
  const [currentJD, setCurrentJD] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [weights, setWeights] = useState({ semantic: 85, skills: 15, experience: 0 });
  const [shortlist, setShortlist] = useState<string[]>([]);

  const resetAnalysis = () => {
    setResults([]);
    setSelectedCandidate(null);
    setIsDrawerOpen(false);
    // optional soft reset
    // setCurrentJD('');
    // setShortlist([]);
    // setWeights({ semantic: 85, skills: 15, experience: 0 });
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleAnalysis = (data: { candidates: Candidate[]; jobDescription: string }) => {
    setResults(data.candidates);
    setCurrentJD(data.jobDescription || '');
  };

  const openCandidateDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const closeCandidateDetails = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedCandidate(null), 300);
  };

  const toggleShortlist = (id: string) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const adjusted = results.map(c => {
    const total = Math.max(1, weights.semantic + weights.skills + weights.experience);
    const s = (weights.semantic / total) * c.semanticScore;
    const k = (weights.skills / total) * c.skillMatchRatio;
    const e = (weights.experience / total) * c.experienceSignal;
    const combined = s + k + e;
    return { ...c, matchPercentage: Math.min(100, Math.max(0, Math.round(combined * 100))) };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <main className="min-h-screen bg-background">
      <Header onBrandClick={resetAnalysis} />
      <Toaster />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {results.length === 0 ? (
          <InputSection
            onAnalysis={handleAnalysis}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Analysis Results
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {adjusted.length} candidates ranked by relevance
                </p>
              </div>
              <button
                onClick={resetAnalysis}
                className="rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary/80 hover:shadow-md"
              >
                New Analysis
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight: Semantic</p>
                <input type="range" min={0} max={100} value={weights.semantic} onChange={(e) => setWeights(w => ({ ...w, semantic: Number(e.target.value) }))} className="w-full" />
                <p className="text-sm mt-1">{weights.semantic}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight: Skills</p>
                <input type="range" min={0} max={100} value={weights.skills} onChange={(e) => setWeights(w => ({ ...w, skills: Number(e.target.value) }))} className="w-full" />
                <p className="text-sm mt-1">{weights.skills}%</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight: Experience</p>
                <input type="range" min={0} max={100} value={weights.experience} onChange={(e) => setWeights(w => ({ ...w, experience: Number(e.target.value) }))} className="w-full" />
                <p className="text-sm mt-1">{weights.experience}%</p>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <AnalyticsSection candidates={adjusted} jobDescription={currentJD} />

            {/* Candidate Results */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Top Candidates</h3>
                <p className="mt-1 text-sm text-muted-foreground">Click on a candidate to view detailed information</p>
              </div>
              <ResultsGrid
                candidates={adjusted}
                onSelectCandidate={openCandidateDetails}
              />
            </div>

            {shortlist.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Shortlist</h3>
                <div className="flex flex-wrap gap-2">
                  {shortlist.map(id => {
                    const c = adjusted.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1 text-sm">
                        <span>{c.filename}</span>
                        <button onClick={() => toggleShortlist(id)} className="text-muted-foreground hover:text-foreground">×</button>
                      </div>
                    );
                  })}
                </div>
                {shortlist.length === 2 && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {shortlist.map(id => {
                      const c = adjusted.find(x => x.id === id)!;
                      return (
                        <div key={id} className="rounded-xl border border-border p-4">
                          <p className="font-semibold">{c.filename}</p>
                          <p className="text-sm text-muted-foreground mt-1">Match: {c.matchPercentage}%</p>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Strengths</p>
                            <ul className="list-disc list-inside text-sm">
                              {c.extractedSkills.slice(0,4).map((s,i)=><li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Gaps</p>
                            <ul className="list-disc list-inside text-sm">
                              {c.missingSkills.slice(0,4).map((s,i)=><li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <CandidateDrawer
        candidate={selectedCandidate}
        isOpen={isDrawerOpen}
        onClose={closeCandidateDetails}
        onToggleShortlist={toggleShortlist}
        isShortlisted={selectedCandidate ? shortlist.includes(selectedCandidate.id) : false}
      />
    </main>
  );
}
