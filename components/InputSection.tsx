'use client';

import { useState, useRef } from 'react';
import { Upload, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Candidate } from '@/types';

interface InputSectionProps {
  onAnalysis: (data: { candidates: Candidate[]; jobDescription: string }) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export default function InputSection({
  onAnalysis,
  setIsLoading,
  isLoading,
}: InputSectionProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [semanticQuery, setSemanticQuery] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current -= 1;
    if (dragCountRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current = 0;
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type === 'application/pdf'
    );

    if (droppedFiles.length === 0) {
      toast.error('Please drop PDF files only');
      return;
    }

    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const useSemantic = semanticQuery.trim().length > 0;
    if (!useSemantic) {
      if (!jobDescription.trim()) {
        toast.error('Please enter a job description');
        return;
      }
    }

    if (files.length === 0) {
      toast.error('Please upload at least one resume');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      if (useSemantic) {
        formData.append('query', semanticQuery.trim());
      } else {
        formData.append('job_description', jobDescription);
      }
      files.forEach((file) => {
        formData.append('resumes', file);
      });

      const endpoint = useSemantic ? '/api/semantic-search' : '/api/sort-resumes';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let detail = '';
        try {
          const err = await response.json();
          detail = err?.detail || '';
        } catch {}
        throw new Error(detail || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      onAnalysis({ candidates: data.candidates || [], jobDescription: data.jobDescription || jobDescription });
      toast.success(`Analyzed ${files.length} resumes successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-bold text-balance text-foreground tracking-tight">
          Resume Screening & Ranking
        </h2>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
          Upload resumes and a job description to get AI-powered candidate rankings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two Column Layout */}
        <div className="grid gap-7 md:grid-cols-2">
          {/* Job Description */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <label
              htmlFor="jobDescription"
              className="block text-sm font-semibold text-foreground tracking-wide"
            >
              Job Description
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Paste the job description you're trying to fill. Exact keyword matches aren’t required — the analyzer understands context and synonyms.
            </p>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Senior Software Engineer - 5+ years experience with React, Node.js, TypeScript..."
              className="mt-4 flex-1 w-full rounded-xl border border-border bg-background px-5 py-4 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm leading-relaxed"
              disabled={isLoading}
            />
            <div className="mt-4">
              <label className="block text-sm font-semibold text-foreground tracking-wide">
                Semantic Search (optional)
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Type a natural query like “Find AWS + Python at a startup”. If provided, this overrides the job description for ranking.
              </p>
              <input
                type="text"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                placeholder="Find someone with AWS + Python and startup experience"
                className="mt-2 w-full rounded-xl border border-border bg-background px-5 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-semibold text-foreground tracking-wide">
              Resumes (PDF)
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Drag and drop PDF resumes or click to select
            </p>

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`mt-4 flex-1 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition-all duration-200 ${
                isDragActive
                  ? 'border-primary bg-primary/15'
                  : 'border-border hover:border-primary/60 hover:bg-card/50'
              }`}
            >
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className={`h-6 w-6 ${isDragActive ? 'text-primary' : 'text-primary/60'}`} />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Drop files here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported format: PDF
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                    >
                      <span className="truncate font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground transition-colors font-semibold"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !jobDescription.trim() || files.length === 0}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-8 py-5 font-semibold text-primary-foreground transition-all hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none text-base tracking-wide"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              <span>Analyzing Resumes...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Start Analysis</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
