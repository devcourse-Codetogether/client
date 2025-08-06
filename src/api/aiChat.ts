import api from '../utils/api';

export const postAIChat = async (
  sessionId: number,
  data: { mode: 'review' | 'question'; content: string },
) => {
  const prompt =
    data.mode === 'review'
      ? `다음 코드에 대해 코드 리뷰를 해 줘. 코드: ${data.content}`
      : data.content;

  console.log(prompt);
  const res = await api.post(`/sessions/${sessionId}/ai/review`, { prompt });
  return res.data;
};
