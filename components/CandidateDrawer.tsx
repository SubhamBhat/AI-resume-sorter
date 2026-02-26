'use client';

import { X, Download, ExternalLink, Briefcase, Award, BookOpen, Star, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Candidate } from '@/types';

interface CandidateDrawerProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleShortlist?: (id: string) => void;
  isShortlisted?: boolean;
}

export default function CandidateDrawer({
  candidate,
  isOpen,
  onClose,
  onToggleShortlist,
  isShortlisted,
}: CandidateDrawerProps) {
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  useEffect(() => {
    // Load chat history per candidate from localStorage
    if (!candidate?.id) return;
    try {
      const raw = localStorage.getItem(`chat_${candidate.id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ role: 'user' | 'assistant'; text: string }>;
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
    setQuestion('');
    setAsking(false);
  }, [candidate?.id]);
  useEffect(() => {
    if (!candidate?.id) return;
    try {
      localStorage.setItem(`chat_${candidate.id}`, JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages, candidate?.id]);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!candidate) return null;

  const ask = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setMessages((prev) => [...prev, { role: 'user', text: question.trim() }]);
    try {
      const form = new FormData();
      form.append('question', question.trim());
      form.append('resume_text', candidate.rawText);
      form.append('candidate_id', candidate.id);
      try {
        const recent = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
        form.append('history', JSON.stringify(recent));
      } catch {}
      const resp = await fetch('/api/candidate-ask', { method: 'POST', body: form });
      if (!resp.ok) {
        const err = await resp.json().catch(() => null) as any;
        const detail = (err && (err.detail || err.message)) ? String(err.detail || err.message) : `Error ${resp.status}`;
        throw new Error(detail);
      }
      const data = await resp.json();
      const answer: string = data.answer || (data.snippets?.[0] ?? 'No direct evidence found.');
      // Format with snippets as bullet points for interactivity
      const bullets = Array.isArray(data.snippets) && data.snippets.length
        ? '\n• ' + data.snippets.slice(0, 3).join('\n• ')
        : '';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer + bullets }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setMessages((prev) => [...prev, { role: 'assistant', text: `Unable to answer right now: ${msg}` }]);
    } finally {
      setAsking(false);
      setQuestion('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl transform overflow-hidden bg-card shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-7 py-5 flex items-center justify-between sticky top-0">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Candidate Details</h2>
            <div className="flex items-center gap-2">
              {onToggleShortlist && (
                <button
                  onClick={() => onToggleShortlist(candidate.id)}
                  className={`rounded-lg p-2 transition-all ${isShortlisted ? 'text-yellow-400' : 'text-muted-foreground hover:text-foreground'}`}
                  title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                >
                  <Star className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-7 px-7 py-7">
            {/* Score Section */}
            <div className="space-y-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground tracking-wide">
                  MATCH SCORE
                </h3>
                <span className="text-4xl font-bold text-primary">
                  {candidate.matchPercentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary/60">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 rounded-full"
                  style={{ width: `${candidate.matchPercentage}%` }}
                />
              </div>
            </div>

            {/* Candidate Identity */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Candidate
              </h3>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {candidate.name || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                File: {candidate.filename}
              </p>
            </div>

            {/* Summary */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {candidate.summary}
              </p>
            </div>

            {/* Skills */}
            {candidate.extractedSkills.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  <h3 className="font-semibold text-foreground">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.extractedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {candidate.extractedExperience.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-400" />
                  <h3 className="font-semibold text-foreground">Experience</h3>
                </div>
                <div className="space-y-2">
                  {candidate.extractedExperience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-200"
                    >
                      {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.extractedEducation.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-400" />
                  <h3 className="font-semibold text-foreground">Education</h3>
                </div>
                <div className="space-y-2">
                  {candidate.extractedEducation.map((edu, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-green-500/20 px-3 py-2 text-sm text-green-200"
                    >
                      {edu}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                AI Evaluation
              </h3>
              <div className="mt-2 rounded-lg border border-border bg-secondary p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {candidate.feedback}
                </p>
              </div>
            </div>

            {/* Improvement Scope */}
            {candidate.improvements && candidate.improvements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Improvement Scope
                </h3>
                <div className="mt-2 space-y-2">
                  {candidate.improvements.map((imp, idx) => (
                    <div key={idx} className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-200 border border-amber-500/20">
                      • {imp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning / Evidence */}
            {candidate.evidence && candidate.evidence.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Reasoning
                </h3>
                <div className="mt-2 space-y-2">
                  {candidate.evidence.map((ev, idx) => (
                    <div key={idx} className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-foreground border border-primary/20">
                      {ev}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap Checklist */}
            {(candidate.jdSkills && candidate.jdSkills.length > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Skill Gap</h3>
                <div className="mt-2 space-y-2">
                  {candidate.jdSkills.map((skill, idx) => {
                    const found = !candidate.missingSkills?.includes(skill);
                    const evidence = candidate.skillEvidence?.[skill];
                    return (
                      <div key={idx} className={`flex items-start justify-between rounded-lg px-3 py-2 text-sm border ${found ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-red-500/10 border-red-500/20 text-red-200'}`}>
                        <div className="flex-1">
                          <span className="font-semibold">{found ? '✓' : '✗'} {skill}</span>
                          {found && evidence && (
                            <div className="mt-1 text-xs text-muted-foreground">{evidence}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat with Resume */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Chat with Resume</h3>
              <div className="mt-2 max-h-56 overflow-y-auto space-y-2 pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'mr-auto bg-secondary text-foreground'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    Ask specific questions like “Did they lead a team?”, “Years of experience?”, or “Any AWS projects?”
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Did this person ever lead a team?"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        ask();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={ask}
                  disabled={asking || !question.trim()}
                  className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:bg-muted"
                  title="Ask"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setMessages([]); setQuestion(''); }}
                  disabled={asking}
                  className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  title="Clear chat"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Full Resume Preview */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Full Resume Text
              </h3>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-secondary p-4">
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                  {candidate.rawText.substring(0, 2000)}
                  {candidate.rawText.length > 2000 && '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm px-7 py-5">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 text-base tracking-wide">
              <Download className="h-5 w-5" />
              Download Resume
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
