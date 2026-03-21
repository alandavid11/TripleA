import { supabase } from './supabase';
import { Vacancy, CvCandidate, InterviewQuestion, GeneratedJD } from '../types';

// ── Type helpers for DB rows ──────────────────────────────────────────────────

function rowToVacancy(row: any): Vacancy {
  return {
    id: row.id,
    title: row.title,
    team: row.team,
    status: row.status,
    createdAt: new Date(row.created_at).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    applicants: row.applicants ?? 0,
    approved: row.approved ?? 0,
    rejected: row.rejected ?? 0,
    budget: row.budget ?? undefined,
    jdRawText: row.jd_raw_text ?? undefined,
    jdBenefits: row.jd_benefits ?? undefined,
    jdGenerated: row.jd_generated ?? undefined,
    teamSummary: row.team_summary ?? undefined,
  };
}

function rowToCandidate(row: any): CvCandidate {
  return {
    id: row.id,
    name: row.name,
    matchScore: row.match_score ?? 0,
    status: row.status ?? 'pending',
    currentRole: row.current_position ?? '',
    experience: row.experience ?? '',
    strengths: row.strengths ?? [],
    gaps: row.gaps ?? [],
    feedback: row.feedback ?? '',
    expectedSalary: row.expected_salary ?? undefined,
    crossMatchVacancy: row.cross_match_vacancy_id ?? undefined,
    crossMatchScore: row.cross_match_score ?? undefined,
    cvText: row.cv_text ?? undefined,
    cvFilePath: row.cv_file_path ?? undefined,
    hmDecision: row.hm_decision ?? undefined,
    hmScore: row.hm_score ?? undefined,
    hmFeedback: row.hm_feedback ?? undefined,
  };
}

function rowToQuestion(row: any): InterviewQuestion {
  return {
    id: row.id,
    category: row.category ?? '',
    question: row.question,
    expectedAnswer: row.expected_answer ?? '',
    candidateAnswer: row.candidate_answer ?? '',
    tailoredFor: row.tailored_for ?? undefined,
    questionType: row.question_type ?? (row.candidate_id ? 'personalized' : 'base'),
    interviewStage: row.interview_stage ?? 'hr',
  };
}

// ── Vacancies ─────────────────────────────────────────────────────────────────

export async function fetchVacancies(): Promise<Vacancy[]> {
  const { data, error } = await supabase
    .from('vacancies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToVacancy);
}

export async function createVacancy(
  title: string,
  team: string,
  budget?: number
): Promise<Vacancy> {
  const { data, error } = await supabase
    .from('vacancies')
    .insert({ title, team, budget, status: 'draft' })
    .select()
    .single();

  if (error) throw error;
  return rowToVacancy(data);
}

export async function updateVacancyStatus(
  id: string,
  status: Vacancy['status']
): Promise<void> {
  const { error } = await supabase
    .from('vacancies')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVacancy(id: string): Promise<void> {
  const { error } = await supabase.from('vacancies').delete().eq('id', id);
  if (error) throw error;
}

// ── JD Generation ─────────────────────────────────────────────────────────────

export async function generateJD(
  vacancyId: string,
  title: string,
  team: string,
  jdRawText: string,
  benefits: string
): Promise<GeneratedJD> {
  const { data, error } = await supabase.functions.invoke('generate-jd', {
    body: { vacancyId, title, team, jdRawText, benefits },
  });

  if (error) {
    // Try to surface the server-side error message
    const serverMsg = (data as any)?.error ?? error.message ?? String(error);
    throw new Error(serverMsg);
  }
  if (!data?.jdGenerated) throw new Error('La función no devolvió un JD generado.');
  return data.jdGenerated as GeneratedJD;
}

// ── CV Processing ─────────────────────────────────────────────────────────────

export async function processCV(
  vacancyId: string,
  cvFile: File,
  cvText: string
): Promise<void> {
  const filePath = `${vacancyId}/${Date.now()}_${cvFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from('cv-files')
    .upload(filePath, cvFile, { contentType: 'application/pdf', upsert: false });

  if (uploadError) throw uploadError;

  const { error } = await supabase.functions.invoke('process-cvs', {
    body: {
      vacancyId,
      candidates: [{ name: cvFile.name.replace('.pdf', ''), cvText, cvFilePath: filePath }],
    },
  });

  if (error) throw error;
}

export async function processCVBatch(
  vacancyId: string,
  files: { file: File; cvText: string }[]
): Promise<void> {
  const uploadedCandidates: { name: string; cvText: string; cvFilePath: string }[] = [];

  for (const { file, cvText } of files) {
    const filePath = `${vacancyId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('cv-files')
      .upload(filePath, file, { contentType: 'application/pdf', upsert: false });

    if (uploadError) throw uploadError;
    uploadedCandidates.push({
      name: file.name.replace(/\.pdf$/i, ''),
      cvText,
      cvFilePath: filePath,
    });
  }

  const { data, error } = await supabase.functions.invoke('process-cvs', {
    body: { vacancyId, candidates: uploadedCandidates },
  });

  if (error) {
    const serverMsg = (data as any)?.error ?? error.message ?? String(error);
    throw new Error(serverMsg);
  }
}

// ── Candidates ────────────────────────────────────────────────────────────────

export async function fetchCandidates(vacancyId: string): Promise<CvCandidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('vacancy_id', vacancyId)
    .order('match_score', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToCandidate);
}

export async function updateCandidateStatus(
  candidateId: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({ status })
    .eq('id', candidateId);
  if (error) throw error;
}

export async function updateCandidateSalary(
  candidateId: string,
  expectedSalary: number | null
): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({ expected_salary: expectedSalary })
    .eq('id', candidateId);
  if (error) throw error;
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
  if (error) throw error;
}

export async function transferCandidateToVacancy(
  candidate: CvCandidate,
  targetVacancyId: string,
  crossMatchScore: number
): Promise<void> {
  const autoStatus = crossMatchScore >= 70 ? 'approved' : 'pending';

  const { error } = await supabase.from('candidates').insert({
    vacancy_id: targetVacancyId,
    name: candidate.name,
    match_score: crossMatchScore,
    status: autoStatus,
    current_position: candidate.currentRole,
    experience: candidate.experience,
    strengths: candidate.strengths,
    gaps: candidate.gaps,
    feedback: `[Transferido desde otra vacante] ${candidate.feedback}`,
    expected_salary: candidate.expectedSalary ?? null,
    cv_text: candidate.cvText ?? null,
    cv_file_path: candidate.cvFilePath ?? null,
  });

  if (error) throw error;

  // Recompute applicant counts on the target vacancy
  const { data: allCandidates } = await supabase
    .from('candidates')
    .select('status')
    .eq('vacancy_id', targetVacancyId);

  const applicants = allCandidates?.length ?? 0;
  const approved = allCandidates?.filter((c: any) => c.status === 'approved').length ?? 0;
  const rejected = allCandidates?.filter((c: any) => c.status === 'rejected').length ?? 0;

  await supabase
    .from('vacancies')
    .update({ applicants, approved, rejected })
    .eq('id', targetVacancyId);
}

export async function updateCandidateHmDecision(
  candidateId: string,
  decision: 'accepted' | 'rejected',
  hmScore: number,
  hmFeedback: string
): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update({ hm_decision: decision, hm_score: hmScore, hm_feedback: hmFeedback })
    .eq('id', candidateId);
  if (error) throw error;
}

export async function recomputeVacancyCounts(vacancyId: string): Promise<void> {
  const { data, error } = await supabase
    .from('candidates')
    .select('status')
    .eq('vacancy_id', vacancyId);

  if (error) throw error;

  const applicants = data?.length ?? 0;
  const approved = data?.filter((c) => c.status === 'approved').length ?? 0;
  const rejected = data?.filter((c) => c.status === 'rejected').length ?? 0;

  await supabase
    .from('vacancies')
    .update({ applicants, approved, rejected })
    .eq('id', vacancyId);
}

// ── Interview Questions ───────────────────────────────────────────────────────

export async function generateQuestions(vacancyId: string): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase.functions.invoke('generate-questions', {
    body: { vacancyId },
  });

  if (error) throw error;
  return data.questions as InterviewQuestion[];
}

export async function fetchQuestions(
  vacancyId: string,
  candidateId?: string,
  interviewStage?: 'hr' | 'hm'
): Promise<InterviewQuestion[]> {
  let query = supabase
    .from('interview_questions')
    .select('*')
    .eq('vacancy_id', vacancyId)
    .order('created_at', { ascending: true });

  if (candidateId) {
    query = query.or(`candidate_id.is.null,candidate_id.eq.${candidateId}`);
  } else {
    query = query.is('candidate_id', null);
  }

  if (interviewStage) {
    query = query.eq('interview_stage', interviewStage);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToQuestion);
}

export async function saveAnswer(questionId: string, answer: string): Promise<void> {
  const { error } = await supabase
    .from('interview_questions')
    .update({ candidate_answer: answer })
    .eq('id', questionId);
  if (error) throw error;
}

// ── Interview Evaluation ──────────────────────────────────────────────────────

export async function evaluateInterview(
  vacancyId: string,
  candidateId: string,
  answeredQuestions: { questionId: string; answer: string }[],
  interviewStage: 'hr' | 'hm' = 'hr'
): Promise<{ score: number; justification: string }> {
  const { data, error } = await supabase.functions.invoke('evaluate-interview', {
    body: { vacancyId, candidateId, answeredQuestions, interviewStage },
  });

  if (error) throw error;
  return data as { score: number; justification: string };
}
