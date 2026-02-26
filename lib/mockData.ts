import type { Candidate } from '@/types';

const mockCandidates: Omit<Candidate, 'id'>[] = [
  {
    filename: 'Sarah_Johnson_Resume.pdf',
    matchPercentage: 94,
    summary: 'Senior Software Engineer with 8 years of experience in full-stack development, React, Node.js, and cloud infrastructure.',
    extractedSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL'],
    extractedExperience: ['Lead Engineer at TechCorp', 'Senior Developer at StartupXYZ', 'Full Stack Developer at Acme Inc'],
    extractedEducation: ['BS Computer Science from MIT', 'AWS Solutions Architect Certification'],
    rawText: 'Sarah Johnson\nsenior.software.engineer@email.com\n+1 (555) 123-4567\n\nSECTION: PROFESSIONAL SUMMARY\nExperienced Senior Software Engineer with proven track record of designing and implementing scalable full-stack applications using modern technologies...',
    feedback: 'Excellent match! Sarah demonstrates strong technical expertise in all required areas. Her experience with React, Node.js, and AWS aligns perfectly with your stack. Leadership experience at previous roles shows readiness for senior position.'
  },
  {
    filename: 'Michael_Chen_Resume.pdf',
    matchPercentage: 87,
    summary: 'Full Stack Developer with 6 years of experience in React, Vue.js, and backend development with Python and Node.js.',
    extractedSkills: ['React', 'Vue.js', 'Python', 'Node.js', 'MongoDB', 'SQL', 'REST APIs'],
    extractedExperience: ['Full Stack Developer at DataFlow', 'Developer at CloudServices Inc', 'Junior Developer at WebStudio'],
    extractedEducation: ['BS Information Technology from Stanford', 'Google Cloud Developer Certification'],
    rawText: 'Michael Chen\nmichael.chen.dev@email.com\n+1 (555) 234-5678\n\nEXPERIENCE\nFull Stack Developer at DataFlow (2021-Present)...',
    feedback: 'Strong candidate with solid full-stack capabilities. While experience leans towards Vue.js rather than React, demonstrated ability to quickly learn new frameworks. Python background shows versatility in backend development.'
  },
  {
    filename: 'Emily_Rodriguez_Resume.pdf',
    matchPercentage: 81,
    summary: 'Frontend Specialist with 5 years of React experience and strong UI/UX focus. Expertise in responsive design and performance optimization.',
    extractedSkills: ['React', 'CSS/SASS', 'JavaScript', 'Figma', 'Performance', 'Webpack', 'Jest'],
    extractedExperience: ['Senior Frontend Engineer at DesignHub', 'Frontend Developer at UIFlow', 'Junior Developer at WebAgency'],
    extractedEducation: ['BS Web Design from NYU', 'React Certification from Udemy'],
    rawText: 'Emily Rodriguez\nemily.rodriguez.design@email.com\n+1 (555) 345-6789\n\nPROFESSIONAL PROFILE\nPassionate Frontend Developer specializing in React and modern web design...',
    feedback: 'Great frontend specialist with deep React knowledge and strong UI skills. May need additional backend training for full-stack role, but excellent foundation for frontend-heavy responsibilities.'
  },
  {
    filename: 'David_Kumar_Resume.pdf',
    matchPercentage: 76,
    summary: 'Backend Engineer with 7 years of experience in microservices, APIs, and database optimization. Strong with Java, Python, and Node.js.',
    extractedSkills: ['Java', 'Python', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Microservices'],
    extractedExperience: ['Backend Architect at ServicesMesh', 'Senior Backend Engineer at PaymentCo', 'Backend Developer at FinTech'],
    extractedEducation: ['BS Computer Engineering from UC Berkeley', 'AWS Certified Solutions Architect'],
    rawText: 'David Kumar\ndavid.kumar.backend@email.com\n+1 (555) 456-7890\n\nCARE OBJECTIVE\nExperienced Backend Engineer seeking challenging role in modern tech company...',
    feedback: 'Strong backend specialist with excellent database and architecture knowledge. Would require frontend development upskilling for senior full-stack position, but brings valuable backend expertise.'
  },
  {
    filename: 'Jessica_Martinez_Resume.pdf',
    matchPercentage: 71,
    summary: 'Fullstack Developer with 4 years of experience, primarily with React and Node.js. Growing expertise in DevOps and containerization.',
    extractedSkills: ['React', 'Node.js', 'Docker', 'Kubernetes', 'MongoDB', 'AWS', 'JavaScript'],
    extractedExperience: ['Fullstack Developer at ContainerCorp', 'Developer at CloudNative', 'Junior Developer at StartupHub'],
    extractedEducation: ['BS Software Engineering from University of Washington', 'Docker Certified Associate'],
    rawText: 'Jessica Martinez\njessica.martinez.dev@email.com\n+1 (555) 567-8901\n\nABOUT ME\nResults-driven Fullstack Developer with passion for modern development practices...',
    feedback: 'Competent developer with solid fundamentals. While experience is slightly less than preferred, shows good growth trajectory and emerging expertise in DevOps. Good potential with mentoring.'
  },
  {
    filename: 'James_Wilson_Resume.pdf',
    matchPercentage: 68,
    summary: 'Web Developer with 3 years of experience focused on frontend development. Growing backend skills with Express and basic Node.js projects.',
    extractedSkills: ['JavaScript', 'React', 'CSS', 'Express', 'Node.js', 'HTML5', 'Bootstrap'],
    extractedExperience: ['Frontend Developer at WebDesignStudio', 'Junior Developer at CMS Platform', 'Intern at TechStartup'],
    extractedEducation: ['Bootcamp Certificate from General Assembly', 'Self-taught through online courses'],
    rawText: 'James Wilson\njames.wilson.web@email.com\n+1 (555) 678-9012\n\nPROFILE\nWeb Developer with demonstrated ability to build interactive user interfaces...',
    feedback: 'Junior developer with solid foundation but less experience than ideal for senior role. Good learning attitude and potential. May require significant mentoring and growth opportunities.'
  }
];

export function generateMockResults(fileCount: number): Candidate[] {
  return mockCandidates.slice(0, Math.min(fileCount, mockCandidates.length)).map((candidate, index) => ({
    ...candidate,
    id: `candidate-${index}`,
  }));
}

export const skillsFrequency = [
  { name: 'React', count: 85 },
  { name: 'Node.js', count: 72 },
  { name: 'TypeScript', count: 68 },
  { name: 'Python', count: 62 },
  { name: 'AWS', count: 58 },
  { name: 'Docker', count: 45 },
  { name: 'PostgreSQL', count: 42 },
  { name: 'GraphQL', count: 38 },
  { name: 'Kubernetes', count: 35 },
  { name: 'MongoDB', count: 32 },
];

export const experienceDistribution = [
  { name: '0-2 years', count: 8, percentage: 13 },
  { name: '2-4 years', count: 15, percentage: 25 },
  { name: '4-6 years', count: 18, percentage: 30 },
  { name: '6-8 years', count: 14, percentage: 23 },
  { name: '8+ years', count: 5, percentage: 9 },
];

export const matchScoreDistribution = [
  { range: '90-100%', count: 12, percentage: 20 },
  { range: '80-90%', count: 18, percentage: 30 },
  { range: '70-80%', count: 15, percentage: 25 },
  { range: '60-70%', count: 10, percentage: 17 },
  { range: 'Below 60%', count: 5, percentage: 8 },
];
