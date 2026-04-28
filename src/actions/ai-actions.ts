'use server';

import { GoogleGenAI } from '@google/genai';

export async function generateTaskDescription(title: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Lütfen .env.local veya Vercel ayarlarına GEMINI_API_KEY ekleyin.";
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  try {
    const prompt = `Sen profesyonel bir proje yönetim asistanısın. Verilen görev başlığına göre net, uygulanabilir ve kısa bir görev açıklaması (description) oluştur. Çıktı mutlaka Türkçe olmalı. Birkaç cümlelik özet ve sonuna 2-3 maddelik kısa Kabul Kriterleri (Acceptance Criteria) ekle. Toplam metin 100 kelimeyi geçmesin.
    
    Görev Başlığı: "${title}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    return response.text || 'Açıklama oluşturulamadı.';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Yapay zeka servisiyle iletişim kurulurken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.";
  }
}
