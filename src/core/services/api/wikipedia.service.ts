export interface WikipediaResponse {
  query: {
    pages: {
      [key: string]: {
        pageid?: number;
        title: string;
        extract: string;
      };
    };
  };
}

export async function getWikipediaSummary(term: string): Promise<string> {
  const encodedTerm = encodeURIComponent(term.trim());
  const url = `https://pt.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodedTerm}&origin=*`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao comunicar com a Wikipedia.');
  }

  const data = (await response.json()) as WikipediaResponse;
  
  if (!data.query || !data.query.pages) {
    throw new Error('Formato de resposta inválido.');
  }

  const pages = Object.values(data.query.pages);
  const page = pages[0];

  if (!page || page.pageid === undefined || !page.extract) {
    throw new Error(`O termo "${term}" não foi encontrado na Wikipedia.`);
  }

  return page.extract;
}
