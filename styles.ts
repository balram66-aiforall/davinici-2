export interface PhotoStyle {
  id: string;
  name: string;
  prompt: string;
}

export const styles: PhotoStyle[] = [
  {
    id: 'professional',
    name: 'Professional Headshot',
    prompt:
      'A professional studio headshot. The subject is well-groomed and looking directly at the camera with a confident, serious expression. Lighting is dramatic, high-contrast Rembrandt style, with subtle rim lighting outlining the subject from a solid, deep charcoal gray or black, smooth gradient background. The focus is incredibly sharp on the face, with a shallow depth of field. High-resolution, corporate portraiture, digital photography, ultra-detailed, 8K.',
  },
  {
    id: 'casual',
    name: 'Casual Portrait',
    prompt:
      'A relaxed, casual outdoor portrait. The subject has a natural, friendly smile. The photo is taken during the golden hour with warm, soft lighting. The background is a slightly blurred park or nature setting. The style is candid and authentic. Shot on a high-quality mirrorless camera with a prime lens, creating a beautiful bokeh effect.',
  },
  {
    id: 'artistic',
    name: 'Artistic Black & White',
    prompt:
      'A powerful, artistic black and white portrait. The lighting is highly dramatic, creating deep shadows and bright highlights (chiaroscuro). The subject has a thoughtful or intense expression. The texture of the skin and hair is highly detailed and sharp. The background is a simple, dark, textured wall. The style is timeless, evocative, and cinematic.',
  },
  {
    id: 'social-media',
    name: 'Social Media Profile',
    prompt:
      'A vibrant and modern profile picture suitable for social media. The subject looks approachable and energetic. The background is a clean, bright, and colorful urban wall or a modern office space with some out-of-focus elements. The lighting is bright and even, making the subject pop. The image is cropped in a square aspect ratio. It looks polished but not overly corporate.',
  },
  {
    id: 'futuristic',
    name: 'Futuristic / Sci-Fi',
    prompt:
      'A futuristic, sci-fi themed portrait. The subject is integrated with subtle cybernetic elements or holographic interfaces. Lighting is neon-hued, with blues, purples, and magentas casting dramatic glows. The background is a sleek, minimalist futuristic cityscape or a high-tech interior. The style is inspired by cyberpunk and high-concept science fiction films. Ultra-high resolution, sharp focus, with a cinematic feel.',
  },
  {
    id: 'vintage',
    name: 'Vintage / Retro',
    prompt:
      'A vintage-style portrait reminiscent of classic film photography from the 1970s. The subject has a nostalgic expression. The image has warm, slightly faded colors with a noticeable but pleasant film grain. The lighting is soft and natural, perhaps coming from a window. The background is a retro-styled room or outdoor scene. The final image has the characteristic look of being shot on Kodak Portra or a similar film stock.',
  },
];
