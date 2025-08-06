import api from '../utils/api';

export const postCodeReview = async (sessionId: number, code: string) => {
  console.log(sessionId, code);
  const res = await api.post(`/sessions/${sessionId}/ai/review`, {
    code,
  });
  return res.data.response;
};

export const postAIQuestion = async (sessionId: number, question: string) => {
  console.log(sessionId, question);
  const res = await api.post(`/sessions/${sessionId}/ai/question`, {
    question,
  });
  return res.data.answer;
};
