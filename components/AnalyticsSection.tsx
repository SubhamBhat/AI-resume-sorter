'use client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Candidate } from '@/types';

interface AnalyticsSectionProps {
  candidates: Candidate[];
  jobDescription?: string;
}

export default function AnalyticsSection({ candidates, jobDescription }: AnalyticsSectionProps) {
  const safeLen = Math.max(1, candidates.length);
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.matchPercentage, 0) / safeLen);

  // Build real data from candidates
  const scoreBuckets = [
    { range: '90-100%', count: 0, percentage: 0 },
    { range: '80-90%', count: 0, percentage: 0 },
    { range: '70-80%', count: 0, percentage: 0 },
    { range: '60-70%', count: 0, percentage: 0 },
    { range: 'Below 60%', count: 0, percentage: 0 },
  ];
  candidates.forEach(c => {
    const m = c.matchPercentage;
    if (m >= 90) scoreBuckets[0].count++;
    else if (m >= 80) scoreBuckets[1].count++;
    else if (m >= 70) scoreBuckets[2].count++;
    else if (m >= 60) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });
  scoreBuckets.forEach(b => b.percentage = Math.round((b.count / safeLen) * 100));

  // Experience distribution via heuristic: search for "X years" in raw text
  const expBuckets = [
    { name: '0-2 years', count: 0, percentage: 0 },
    { name: '2-4 years', count: 0, percentage: 0 },
    { name: '4-6 years', count: 0, percentage: 0 },
    { name: '6-8 years', count: 0, percentage: 0 },
    { name: '8+ years', count: 0, percentage: 0 },
  ];
  const yearRegex = /(\d{1,2})\s*\+?\s*years?/gi;
  candidates.forEach(c => {
    let years = 0;
    const m = c.rawText.match(yearRegex);
    if (m) {
      const nums = m
        .map(s => parseInt((s.match(/\d{1,2}/) || ['0'])[0], 10))
        .filter(n => !isNaN(n));
      years = nums.length ? Math.max(...nums) : 0;
    }
    if (years < 2) expBuckets[0].count++;
    else if (years < 4) expBuckets[1].count++;
    else if (years < 6) expBuckets[2].count++;
    else if (years < 8) expBuckets[3].count++;
    else expBuckets[4].count++;
  });
  expBuckets.forEach(b => b.percentage = Math.round((b.count / safeLen) * 100));

  // Skills frequency from extractedSkills
  const skillMap = new Map<string, number>();
  candidates.forEach(c => {
    c.extractedSkills.forEach(s => {
      const key = s.trim();
      if (!key) return;
      skillMap.set(key, (skillMap.get(key) || 0) + 1);
    });
  });
  const skillsFrequency = Array.from(skillMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Required vs Found skills (from JD)
  const baseSkills = [
    "python","javascript","java","react","node","sql","cloud","api","database",
    "frontend","backend","fullstack","mobile","devops","agile","testing","performance","security","scalability"
  ];
  const alias: Record<string, string[]> = {
    node: ["node.js","nodejs","express"],
    react: ["react.js","reactjs","nextjs","next.js"],
    sql: ["postgresql","mysql","psql","mssql","sqlite"],
    cloud: ["aws","amazon web services","gcp","google cloud","azure"],
    devops: ["ci/cd","cicd","pipeline","docker","kubernetes"],
    testing: ["jest","pytest","unit testing","e2e","cypress"],
    api: ["rest","graphql","restful"],
  };
  const jdRequired: string[] = [];
  if (jobDescription && jobDescription.trim()) {
    const jdLower = jobDescription.toLowerCase();
    baseSkills.forEach(k => {
      if (jdLower.includes(k) || (alias[k]?.some(a => jdLower.includes(a)) ?? false)) {
        jdRequired.push(k);
      }
    });
  }
  const overlapData = jdRequired.map(skill => {
    const present = candidates.filter(c => c.extractedSkills.map(s => s.toLowerCase()).includes(skill)).length;
    const pct = Math.round((present / safeLen) * 100);
    return { skill, overlap: pct };
  });
  
  const colors = {
    primary: 'oklch(0.63 0.24 268)',
    secondary: 'oklch(0.71 0.22 280)',
    accent: 'oklch(0.67 0.2 290)',
    success: 'oklch(0.61 0.26 250)',
    warning: 'oklch(0.73 0.24 260)',
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Resumes</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{candidates.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Analyzed and ranked</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Average Score</p>
          <p className="mt-2 text-3xl font-bold text-primary">{avgScore}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Overall match percentage</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Match</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{Math.max(...candidates.map(c => c.matchPercentage))}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Highest match found</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Match Score Distribution */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Match Score Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={scoreBuckets}
                nameKey="range"
                cx="50%"
                cy="50%"
                minAngle={8}
                labelLine
                outerRadius={100}
                isAnimationActive={false}
                fill={colors.primary}
                dataKey="count"
                label={(props: any) => {
                  const { name, percent, x, y } = props;
                  if (!percent || percent * 100 < 5) return null;
                  const pct = Math.round(percent * 100);
                  return (
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="oklch(0.85 0.02 260)" fontSize="12">
                      {name} • {pct}%
                    </text>
                  );
                }}
              >
                {scoreBuckets.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={[colors.primary, colors.secondary, colors.accent, colors.success, colors.warning][index % 5]}
                  />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" align="center" height={36} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Experience Distribution */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Experience Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
              <XAxis dataKey="name" stroke="oklch(0.72 0.05 260)" fontSize={12} />
              <YAxis stroke="oklch(0.72 0.05 260)" fontSize={12} />
              <Tooltip contentStyle={{backgroundColor: 'oklch(0.14 0.008 260)', border: '1px solid oklch(0.2 0.01 260)'}} />
              <Bar dataKey="count" fill={colors.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Skills Found */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Skills Found in Candidates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={skillsFrequency}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
              <XAxis type="number" stroke="oklch(0.72 0.05 260)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="oklch(0.72 0.05 260)" fontSize={12} />
              <Tooltip contentStyle={{backgroundColor: 'oklch(0.14 0.008 260)', border: '1px solid oklch(0.2 0.01 260)'}} />
              <Bar dataKey="count" fill={colors.secondary} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* JD Skill Overlap */}
        {overlapData.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">JD Skill Overlap</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={overlapData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.01 260)" />
                <XAxis dataKey="skill" stroke="oklch(0.72 0.05 260)" fontSize={12} />
                <YAxis stroke="oklch(0.72 0.05 260)" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{backgroundColor: 'oklch(0.14 0.008 260)', border: '1px solid oklch(0.2 0.01 260)'}} formatter={(v) => `${v}%`} />
                <Bar dataKey="overlap" fill={colors.accent} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
