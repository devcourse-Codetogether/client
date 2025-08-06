import api from '../utils/api';

/**
 * 코드 실행 요청
 * POST /sessions/{sessionId}/code/execute
 */
export const executeCode = async (
  sessionId: number,
  language: string,
  code: string,
  stdin: string = '',
): Promise<string> => {
  const res = await api.post(`/sessions/${sessionId}/code/execute`, {
    language,
    code,
    stdin,
  });
  return res.data.output;
};

/**
 * 코드 저장 요청
 * PUT /sessions/{sessionId}/code/save
 */
export const saveCode = async (
  sessionId: number,
  language: string,
  code: string,
): Promise<void> => {
  await api.put(`/sessions/${sessionId}/code/save`, {
    language,
    code,
  });
};
