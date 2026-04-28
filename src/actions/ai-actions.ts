'use server';

import Groq from 'groq-sdk';

export async function generateTaskDescription(title: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return "Lütfen .env.local veya Vercel ayarlarına GROQ_API_KEY ekleyin.";
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const response = await groq.chat.completions.create({
      // We can use the fast llama-3.1-8b-instant or 70b-versatile
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Sen profesyonel bir proje yönetim asistanısın. Verilen görev başlığına göre net, uygulanabilir ve kısa bir görev açıklaması (description) oluştur. Çıktı mutlaka Türkçe olmalı. Birkaç cümlelik özet ve sonuna 2-3 maddelik kısa Kabul Kriterleri (Acceptance Criteria) ekle. Toplam metin 100 kelimeyi geçmesin.',
        },
        {
          role: 'user',
          content: `Şu görev başlığı için bir açıklama oluştur: "${title}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || 'Açıklama oluşturulamadı.';
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Yapay zeka servisiyle iletişim kurulurken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.";
  }
}
