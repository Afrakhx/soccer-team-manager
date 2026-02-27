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

function scoreLabel(corner: string, score: number): string {
  const labels: Record<string, string[]> = {
    technical: ['Needs Fundamentals', 'Early Developer', 'Competent', 'Proficient', 'Technically Strong'],
    tactical: ['Unaware', 'Reads Basic Play', 'Situationally Aware', 'Smart Player', 'Tactically Excellent'],
    physical: ['Needs Conditioning', 'Developing Athleticism', 'Age-Appropriate', 'Above Average', 'Outstanding Athlete'],
    psychological: ['Needs Encouragement', 'Building Confidence', 'Consistent Attitude', 'Mentally Strong', 'Elite Mentality'],
  };
  return labels[corner]?.[score - 1] ?? 'Unknown';
}

function generateDemoResult(
  observations: string,
  playerName: string,
  position: string,
  ageGroup: string,
): AIAssessmentResult {
  const text = observations.toLowerCase();

  const positiveWords = ['great', 'excellent', 'good', 'strong', 'fast', 'scored', 'brilliant',
    'impressive', 'outstanding', 'well', 'improved', 'confident', 'vocal', 'leader'];
  const negativeWords = ['struggled', 'slow', 'weak', 'missed', 'lost', 'confused',
    'hesitant', 'poor', 'trouble', 'difficult', 'shy', 'nervous', 'frustrated'];

  const positiveCount = positiveWords.filter(w => text.includes(w)).length;
  const negativeCount = negativeWords.filter(w => text.includes(w)).length;
  const base = Math.max(2, Math.min(4, 3 + positiveCount - negativeCount));

  const t = Math.max(1, Math.min(5, base + (text.includes('dribbl') || text.includes('pass') || text.includes('control') ? 1 : 0)));
  const ta = Math.max(1, Math.min(5, base + (text.includes('position') || text.includes('decision') || text.includes('read') ? 1 : 0)));
  const ph = Math.max(1, Math.min(5, base + (text.includes('fast') || text.includes('speed') ? 1 : 0) - (text.includes('slow') || text.includes('tired') ? 1 : 0)));
  const ps = Math.max(1, Math.min(5, base + (text.includes('confident') || text.includes('leader') || text.includes('vocal') ? 1 : 0) - (text.includes('frustrated') || text.includes('nervous') ? 1 : 0)));

  return {
    technical: {
      score: t,
      label: scoreLabel('technical', t),
      observation: `Based on your observations, ${playerName} shows ${t >= 3 ? 'solid' : 'developing'} technical ability for a ${ageGroup} ${position}. ${t >= 4 ? 'Continue building on these strong fundamentals with higher-complexity challenges.' : 'Focus on repetition drills to build muscle memory and consistency.'}`,
    },
    tactical: {
      score: ta,
      label: scoreLabel('tactical', ta),
      observation: `${playerName}'s game understanding appears ${ta >= 3 ? 'on track' : 'still emerging'} for their age group. ${ta >= 4 ? 'They are beginning to anticipate play and make decisions ahead of time.' : 'Use small-sided games to help them read game situations faster.'}`,
    },
    physical: {
      score: ph,
      label: scoreLabel('physical', ph),
      observation: `Physically, ${playerName} ${ph >= 3 ? 'is developing well' : 'has clear areas to target'} relative to ${ageGroup} benchmarks. ${ph >= 4 ? 'Their athleticism is a genuine asset — leverage it with position-specific demands.' : 'Coordination and agility circuits will accelerate physical development.'}`,
    },
    psychological: {
      score: ps,
      label: scoreLabel('psychological', ps),
      observation: `${playerName} demonstrates a ${ps >= 3 ? 'positive and consistent' : 'growing'} mental approach to the game. ${ps >= 4 ? 'Their resilience and attitude set a good example for teammates.' : 'Building confidence through achievable, progressive challenges is the priority.'}`,
    },
    strengths: [
      positiveCount > 0 ? 'Shows genuine enthusiasm and engagement during sessions' : 'Demonstrates commitment and consistent attendance',
      text.includes('team') || text.includes('vocal') ? 'Communicates well and supports teammates' : 'Works constructively within the team structure',
      t >= 3 ? 'Technical foundation is developing positively' : 'Shows effort and willingness to learn in technical areas',
    ],
    areasToImprove: [
      negativeCount > 0 ? 'Build consistency in execution across the full session' : 'Continue developing decision-making speed under pressure',
      text.includes('left') || text.includes('weak foot') ? 'Dedicated weaker-foot development through daily touches' : 'Improve composure and decision quality in tight 1v1 situations',
      ta <= 3 ? 'Develop positional awareness and smarter off-ball movement' : 'Refine pressing triggers and defensive transition shape',
    ],
    drills: [
      {
        name: 'Rondo (4v2)',
        description: 'Possession circle with 2 defenders in the middle. Develops quick decision-making, passing accuracy, and pressing habits. Run for 10 minutes per session.',
      },
      {
        name: 'Coerver Ball Mastery Sequence',
        description: 'Structured individual skill circuit: toe taps, inside-outside rolls, V-moves, L-turns. 5–10 minutes at the start of every session builds muscle memory.',
      },
      {
        name: '1v1 Box Challenge',
        description: '10x10 yard box, attacker vs defender with a small target goal. Builds confidence on the ball and defensive positioning. Rotate every 60 seconds.',
      },
    ],
    summary: `${playerName} is a ${ageGroup} ${position} showing ${base >= 3 ? 'promising' : 'early-stage'} development across all four pillars. ${base >= 4 ? 'They are ahead of typical developmental benchmarks and should be challenged with more complex tasks and responsibilities.' : base >= 3 ? 'They are tracking well against age-group norms. Consistent training, positive reinforcement, and technical repetition will accelerate their growth.' : 'The priority at this stage is enjoyment, confidence, and foundational skill repetition in a safe and encouraging environment.'} ⚠️ This is a DEMO assessment — add your Claude API key in Settings for full AI-powered analysis.`,
    isDemo: true,
  };
}

const SYSTEM_PROMPT = `You are an expert youth soccer coaching assessment specialist. You have deep knowledge of:
- US Soccer Federation Player Development Initiatives (PDI)
- UEFA Youth Coaching methodology
- Long-Term Athlete Development (LTAD) framework
- The 4 Corner Model (Technical, Tactical, Physical, Psychological)
- Age-appropriate developmental benchmarks for youth players (U8 through U14)

Your role is to analyze a coach's free-form observations and produce an objective, evidence-based structured assessment. Be constructive, developmental in tone, and age-appropriate. Always respond with valid JSON only — no markdown, no extra text.`;

function buildPrompt(observations: string, playerName: string, position: string, ageGroup: string): string {
  return `Coach observations for ${playerName} (Position: ${position}, Age Group: ${ageGroup}):

"${observations}"

Analyze these observations using the 4 Corner Model and produce an objective coaching assessment. Return ONLY a JSON object with this exact structure:
{
  "technical": { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences specific to what was observed>" },
  "tactical": { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences specific to what was observed>" },
  "physical": { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences specific to what was observed>" },
  "psychological": { "score": <1-5>, "label": "<brief label>", "observation": "<2 sentences specific to what was observed>" },
  "strengths": ["<specific observed strength>", "<specific observed strength>", "<specific observed strength>"],
  "areasToImprove": ["<specific actionable area>", "<specific actionable area>", "<specific actionable area>"],
  "drills": [
    { "name": "<drill name>", "description": "<how to run it and why it helps, 1-2 sentences>" },
    { "name": "<drill name>", "description": "<how to run it and why it helps, 1-2 sentences>" },
    { "name": "<drill name>", "description": "<how to run it and why it helps, 1-2 sentences>" }
  ],
  "summary": "<2-3 sentence overall developmental summary benchmarked to their age group>"
}

Score rubric (relative to age group norms):
1 = Needs significant foundational work
2 = Early development stage
3 = Age-appropriate / on track
4 = Above average for age group
5 = Exceptional for age group`;
}

export async function runAIAssessment(
  observations: string,
  playerName: string,
  position: string,
  ageGroup: string,
): Promise<AIAssessmentResult> {
  const apiKey = localStorage.getItem('u10_claude_key');

  if (!apiKey) {
    return generateDemoResult(observations, playerName, position, ageGroup);
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
      messages: [{ role: 'user', content: buildPrompt(observations, playerName, position, ageGroup) }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text;
  const result = JSON.parse(text) as Omit<AIAssessmentResult, 'isDemo'>;
  return { ...result, isDemo: false };
}
