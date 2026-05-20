import api from './api'

const aiService = {
  chat:            (message)  => api.post('/ai/chat', { message }),
  analyzeSymptoms: (symptoms) => api.post('/ai/symptom-analysis', { symptoms }),
  getChatHistory:  ()         => api.get('/ai/chat/history'),
}

export default aiService
