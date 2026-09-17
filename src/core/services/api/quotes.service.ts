export interface AdviceResponse {
  slip: {
    id: number;
    advice: string;
  };
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
}

export async function getRandomAdvice(): Promise<string> {
  // 1. Fetch da API Original em Inglês
  const adviceResponse = await fetch('https://api.adviceslip.com/advice', {
    cache: 'no-store',
  });

  if (!adviceResponse.ok) {
    throw new Error('Falha ao obter conselho original.');
  }

  const adviceData = (await adviceResponse.json()) as AdviceResponse;
  const englishAdvice = adviceData.slip.advice;

  // 2. Fetch do Mashup (API de Tradução para PT-BR)
  const encodedText = encodeURIComponent(englishAdvice);
  const translationResponse = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|pt-br`,
  );

  if (!translationResponse.ok) {
    throw new Error('Falha na tradução da dica. Tente novamente.');
  }

  const translationData = (await translationResponse.json()) as TranslationResponse;
  return translationData.responseData.translatedText;
}
