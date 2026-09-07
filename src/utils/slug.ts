/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(text: string): string {
  // Transliterate non-ASCII characters to ASCII (basic implementation for common characters)
  const transliterated = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If result is empty or too short, use a fallback
  if (!transliterated || transliterated.length < 3) {
    return 'story-' + Date.now();
  }

  return transliterated.toLowerCase();
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 */
export async function generateUniqueSlug(
  text: string,
  collectionName: string,
  db: any
): Promise<string> {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists in the collection
  while (true) {
    const querySnapshot = await db
      .collection(collectionName)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
