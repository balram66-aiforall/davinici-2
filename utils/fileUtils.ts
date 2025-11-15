
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const parseDataUrl = (dataUrl: string): { mimeType: string; base64Data: string } => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error("Invalid Data URL format.");
    }
    const metaPart = parts[0].split(':')[1];
    if (!metaPart) {
        throw new Error("Invalid Data URL: Missing metadata.");
    }
    const mimeType = metaPart.split(';')[0];
    
    return {
        mimeType,
        base64Data: parts[1],
    };
};
