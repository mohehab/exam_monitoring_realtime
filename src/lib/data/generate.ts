import {
  type ConnectionQuality,
  type ExamSession,
  type SessionStatus,
  riskLevelFromScore,
} from "@/types";

/**
 * Small, fast, deterministic PRNG (mulberry32). A fixed seed keeps the dataset
 * stable across server requests, which matters because the realtime source
 * emits events that reference session ids generated here.
 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Aisha", "Liam", "Sofia", "Noah", "Mia", "Omar", "Yuki", "Lucas",
  "Fatima", "Ethan", "Chloe", "Mateo", "Aria", "Hassan", "Zoe", "Diego",
  "Layla", "Arjun", "Nora", "Ivan", "Priya", "Marco", "Elif", "Kofi",
];
const LAST_NAMES = [
  "Khan", "Smith", "Garcia", "Chen", "Patel", "Okafor", "Nguyen", "Rossi",
  "Haddad", "Kim", "Silva", "Müller", "Ivanova", "Mensah", "Dubois", "Tanaka",
  "Costa", "Andersson", "Reyes", "Novak",
];
const EXAMS = [
  "Calculus II Final", "Organic Chemistry Midterm", "Constitutional Law",
  "Data Structures", "Financial Accounting", "Anatomy & Physiology",
  "Macroeconomics", "Spanish B2 Certification", "Network Security",
  "Linear Algebra", "Cognitive Psychology", "Project Management (PMP)",
];
const REGIONS = [
  "NA-East", "NA-West", "EU-Central", "EU-West", "MENA", "APAC", "LATAM",
];

const STATUS_WEIGHTS: [SessionStatus, number][] = [
  ["active", 0.62],
  ["flagged", 0.14],
  ["paused", 0.08],
  ["submitted", 0.1],
  ["disconnected", 0.06],
];

const CONNECTION_WEIGHTS: [ConnectionQuality, number][] = [
  ["good", 0.78],
  ["unstable", 0.16],
  ["lost", 0.06],
];

function weighted<T>(rand: number, weights: [T, number][]): T {
  let acc = 0;
  for (const [value, weight] of weights) {
    acc += weight;
    if (rand <= acc) return value;
  }
  return weights[weights.length - 1][0];
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

/**
 * Generate a stable list of exam sessions.
 *
 * @param count number of sessions to create (defaults to 12,000 — comfortably
 *   above the 10,000-record floor the brief requires).
 * @param seed PRNG seed; keep fixed for a reproducible dataset.
 */
export function generateSessions(count = 12_000, seed = 1337): ExamSession[] {
  const rand = mulberry32(seed);
  const now = Date.now();
  const sessions: ExamSession[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const status = weighted(rand(), STATUS_WEIGHTS);
    const connection =
      status === "disconnected" ? "lost" : weighted(rand(), CONNECTION_WEIGHTS);

    // Flagged sessions skew toward higher risk.
    const base = status === "flagged" ? 45 : 5;
    const riskScore = Math.min(
      100,
      Math.round(base + rand() * (status === "flagged" ? 55 : 70)),
    );
    const flagsCount =
      status === "flagged"
        ? 1 + Math.floor(rand() * 6)
        : Math.floor(rand() * 2);

    const startedAt = now - Math.floor(rand() * 90 * 60_000); // up to 90m ago
    const candidateName = `${pick(FIRST_NAMES, rand())} ${pick(LAST_NAMES, rand())}`;

    sessions[i] = {
      id: `S-${(100000 + i).toString(36).toUpperCase()}`,
      candidateName,
      candidateId: `C${(200000 + i).toString().padStart(6, "0")}`,
      examName: pick(EXAMS, rand()),
      region: pick(REGIONS, rand()),
      status,
      riskScore,
      riskLevel: riskLevelFromScore(riskScore),
      flagsCount,
      progress:
        status === "submitted" ? 100 : Math.floor(rand() * 100),
      connectionQuality: connection,
      startedAt,
      lastEventAt: startedAt,
      notesCount: flagsCount > 3 ? Math.floor(rand() * 3) : 0,
    };
  }

  return sessions;
}
