import axios from 'axios';

export const postAIChat = async (
  token: string,
  sessionId: number,
  data: { mode: 'review' | 'question'; content: string },
) => {
  const prompt =
    data.mode === 'review'
      ? `다음 코드에 대해 코드 리뷰를 해 줘. 코드: ${data.content}`
      : data.content;

  console.log(prompt);
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sessions/${sessionId}/ai/review`,
    { prompt },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};
