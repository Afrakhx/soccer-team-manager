export interface CornerRating {
  score: number;
  label: string;
  observation: string;
}

export interface DrillRecommendation {
  name: string;
  description: string;
}

export interface AIAssessmentResult {
  technical: CornerRating;
  tactical: CornerRating;
  physical: CornerRating;
  psychological: CornerRating;
  strengths: string[];
  areasToImprove: string[];
  drills: DrillRecommendation[];
  summary: string;
  isDemo: boolean;
}

export interface AreaData {
  checked: string[];   // labels of checked observations
  notes: string;
}

export interface GuidedAssessmentData {
  technical: AreaData;
  tactical: AreaData;
  physical: AreaData;
  psychological: AreaData;
}

function scoreLabel(corner: string, score: number): string {
  const labels: Record<string, string[]> = {
    technical:    ['Needs Fundamentals', 'Early Developer', 'Competent', 'Proficient', 'Technically Strong'],
    tactical:     ['Unaware', 'Reads Basic Play', 'Situationally Aware', 'Smart Player', 'Tactically Excellent'],
    physical:     ['Needs Conditioning', 'Developing Athleticism', 'Age-Appropriate', 'Above Average', 'Outstanding Athlete'],
    psychological:['Needs Encouragement', 'Building Confidence', 'Consistent Attitude', 'Mentally Strong', 'Elite Mentality'],
  };
  return labels[corner]?.[score - 1] ?? 'Unknown';
}

function areaScore(area: AreaData, total: number): number {
  const ratio = area.checked.length / total;
  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

function generateDemoResult(
  data: GuidedAssessmentData,
  playerName: string,
  position: string,
  ageGroup: string,
  ITEMS: Record<string, string[]>,
): AIAssessmentResult {
  const t  = areaScore(data.technical,    ITEMS.technical.length);
  const ta = areaScore(data.tactical,     ITEMS.tactical.length);
  const ph = areaScore(data.physical,     ITEMS.physical.length);
  const ps = areaScore(data.psychological,ITEMS.psychological.length);

  const checkedStr = (area: AreaData) =>
    area.checked.length ? `Observed: ${area.checked.join(', ')}.` : 'Nothing specifically noted.';
  const notesStr = (area: AreaData) => area.notes ? ` Coach notes: "${area.notes}".` : '';

  return {
    technical: {
      score: t,
      label: scoreLabel('technical', t),
      observation: `${playerName} demonstrated ${t >= 3 ? 'solid' : 'developing'} technical ability for a ${ageGroup} ${position}. ${checkedStr(data.technical)}${notesStr(data.technical)} ${t >= 4 ? 'Continue building complexity.' : 'Repetition drills will build consistency.'}`,
    },
    tactical: {
      score: ta,
      label: scoreLabel('tactical', ta),
      observation: `Game understanding appears ${ta >= 3 ? 'on track' : 'still emerging'} for the age group. ${checkedStr(data.tactical)}${notesStr(data.tactical)} ${ta >= 4 ? 'Introduce more complex positional concepts.' : 'Small-sided games will accelerate game reading.'}`,
    },
    physical: {
      score: ph,
      label: scoreLabel('physical', ph),
      observation: `Physically ${ph >= 3 ? 'developing well' : 'with areas to target'} relative to ${ageGroup} benchmarks. ${checkedStr(data.physical)}${notesStr(data.physical)} ${ph >= 4 ? 'Leverage their athleticism with position-specific demands.' : 'Agility and coordination circuits will help.'}`,
    },
    psychological: {
      score: ps,
      label: scoreLabel('psychological', ps),
      observation: `${playerName} shows a ${ps >= 3 ? 'positive' : 'growing'} mental approach. ${checkedStr(data.psychological)}${notesStr(data.psychological)} ${ps >= 4 ? 'Resilience and attitude are clear strengths.' : 'Build confidence through achievable progressive challenges.'}`,
    },
    strengths: [
      data.technical.checked[0]  ?? 'Shows willingness to engage with the ball',
      data.tactical.checked[0]   ?? 'Tries to follow team structure',
      data.psychological.checked[0] ?? 'Demonstrates commitment to attending and participating',
    ],
    areasToImprove: [
      data.technical.checked.length < 3  ? 'Develop technical foundations through daily ball work' : 'Polish execution under defensive pressure',
      data.tactical.checked.length < 3   ? 'Build game awareness through small-sided games' : 'Sharpen off-ball movement and positioning',
      data.psychological.checked.length < 3 ? 'Build match confidence through role clarity and encouragement' : 'Challenge with leadership responsibilities in session activities',
    ],
    drills: [
      { name: 'Rondo (4v2)', description: 'Possession circle with 2 defenders. Develops quick passing, decision-making, and pressing habits. 10 minutes per session.' },
      { name: 'Coerver Ball Mastery', description: 'Structured skill circuit: toe taps, inside-outside rolls, V-moves. 5–10 minutes at the start of each session to build muscle memory.' },
      { name: '1v1 Box Challenge', description: '10x10 yard box, attacker vs defender with a small goal. Builds confidence on the ball and defensive shape. Rotate every 60 seconds.' },
    ],
    summary: `${playerName} is a ${ageGroup} ${position} showing ${(t + ta + ph + ps) >= 14 ? 'above-average' : (t + ta + ph + ps) >= 10 ? 'solid' : 'early-stage'} development across all four pillars. ${(t + ta + ph + ps) >= 14 ? 'They are tracking ahead of age-group norms — consider introducing more complex challenges.' : 'Consistent training, positive reinforcement, and fun repetition will drive the most growth at this stage.'} ⚠️ This is a DEMO assessment — add your Claude API key in Settings for real AI-powered analysis.`,
    isDemo: true,
  };
}

const SYSTEM_PROMPT = `You are an expert youth soccer development coach with deep knowledge of:
- US Soccer Federation Player Development Initiatives (PDI)
- UEFA Youth Coaching methodology
- Long-Term Athlete Development (LTAD) framework
- The 4 Corner Model (Technical, Tactical, Physical, Psychological)
- Age-appropriate benchmarks for youth players (U7 through U17)

You are helping a volunteer/parent coach who is NOT technically trained. They have completed a guided checklist of observable behaviours for one of their players. Your job is to interpret those observations objectively and produce a professional, constructive development report.

Be warm, encouraging, and practical. Write as if addressing a fellow coach. Respond with valid JSON only — no markdown, no extra text.`;

function buildPrompt(
  data: GuidedAssessmentData,
  playerName: string,
  position: string,
  ageGroup: string,
): string {
  function summarise(area: AreaData, label: string) {
    const obs = area.checked.length
      ? `Observed behaviours: ${area.checked.join(' | ')}`
      : 'No specific behaviours were ticked for this area.';
    const notes = area.notes ? `\nCoach notes: "${area.notes}"` : '';
    return `${label}:\n${obs}${notes}`;
  }

  return `Guided assessment for ${playerName} (Position: ${position}, Age Group: ${ageGroup}).
A non-technical volunteer coach completed the following checklist after observing this player:

${summarise(data.technical,     '--- TECHNICAL (Ball Skills)')}

${summarise(data.tactical,      '--- TACTICAL (Game Understanding)')}

${summarise(data.physical,      '--- PHYSICAL (Athletic Ability)')}

${summarise(data.psychological, '--- PSYCHOLOGICAL (Attitude & Mindset)')}

Using the 4 Corner Model and LTAD frameworks, produce an objective assessment. Return ONLY a JSON object:
{
  "technical":     { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences>" },
  "tactical":      { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences>" },
  "physical":      { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences>" },
  "psychological": { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences>" },
  "strengths":     ["<strength>", "<strength>", "<strength>"],
  "areasToImprove":["<actionable area>", "<actionable area>", "<actionable area>"],
  "drills": [
    { "name": "<drill>", "description": "<how to run it and why, 1-2 sentences>" },
    { "name": "<drill>", "description": "<how to run it and why, 1-2 sentences>" },
    { "name": "<drill>", "description": "<how to run it and why, 1-2 sentences>" }
  ],
  "summary": "<2-3 sentence developmental summary benchmarked to age group>"
}

Score: 1=Significant gaps, 2=Early development, 3=Age-appropriate, 4=Above average for age, 5=Exceptional.`;
}

export async function runAIAssessment(
  data: GuidedAssessmentData,
  playerName: string,
  position: string,
  ageGroup: string,
  ITEMS: Record<string, string[]>,
): Promise<AIAssessmentResult> {
  const apiKey = localStorage.getItem('u10_claude_key');

  if (!apiKey) {
    return generateDemoResult(data, playerName, position, ageGroup, ITEMS);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildPrompt(data, playerName, position, ageGroup) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  const raw = await response.json();
  const text: string = raw.content[0].text;
  const result = JSON.parse(text) as Omit<AIAssessmentResult, 'isDemo'>;
  return { ...result, isDemo: false };
}
