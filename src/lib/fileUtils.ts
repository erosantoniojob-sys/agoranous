/**
 * Converte um arquivo de imagem selecionado localmente em uma string Base64.
 * Utiliza FileReader para permitir armazenamento offline e previzualização imediata.
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc.).'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Não foi possível ler o arquivo de imagem.'));
      }
    };

    reader.onerror = (error) => {
      reject(error || new Error('Erro ao converter imagem em Base64.'));
    };
  });
};
