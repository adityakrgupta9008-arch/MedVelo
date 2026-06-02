import { MOCK_MEDICINES } from "./supabase";

/**
 * Computes the Levenshtein distance between two strings to support robust fuzzy matching.
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][i - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes text by removing special characters, lowercasing, and standardizing common OCR substitutions.
 */
export function normalizeOCRText(text: string): string[] {
  if (!text) return [];
  
  // Create a copy and lowercase
  let normalized = text.toLowerCase();

  // Replace common OCR errors with best guesses
  // Note: we preserve original letters as well since regex matching is multi-layered
  const tokens = normalized
    .replace(/[^a-z0-9\s-]/g, " ") // Replace punctuation/symbols with spaces
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  // Return list of words along with basic substitutions for OCR compensation
  const expandedTokens: string[] = [];
  for (const token of tokens) {
    expandedTokens.push(token);
    
    // Attempt standard substitutions (e.g. '1' -> 'i'/'l', '0' -> 'o', '5' -> 's')
    const substituted = token
      .replace(/[1|]/g, "i")
      .replace(/0/g, "o")
      .replace(/5/g, "s");
      
    if (substituted !== token) {
      expandedTokens.push(substituted);
    }
    
    const substitutedL = token
      .replace(/[1|]/g, "l")
      .replace(/0/g, "o")
      .replace(/5/g, "s");
      
    if (substitutedL !== token && substitutedL !== substituted) {
      expandedTokens.push(substitutedL);
    }
  }

  return Array.from(new Set(expandedTokens));
}

// List of common dosage/frequency abbreviations to ignore during drug matching
const SKIPPED_WORDS = new Set([
  "mg", "mcg", "g", "ml", "tab", "tabs", "tablet", "tablets", "cap", "caps", "capsule", "capsules",
  "bd", "tds", "od", "qid", "hs", "prn", "rx", "daily", "once", "twice", "take", "refill", "refills"
]);

/**
 * Parses raw OCR string and scans for a known brand medicine name.
 * Supports exact matches, overlapping substring matches, and fuzzy matches.
 * Returns the matching brand name in its original DB casing, or null if no match is found.
 */
export function extractMedicineName(rawText: string): string | null {
  // 4. Fallback logger to print exact camera scan contents in dev console
  console.log("Raw Scanned Text:", rawText);

  if (!rawText) return null;

  // Normalize text, tokenize, and filter out common dosage metadata
  const tokens = normalizeOCRText(rawText).filter((token) => !SKIPPED_WORDS.has(token));
  const knownBrands = MOCK_MEDICINES.map((m) => m.brand_name.toLowerCase());

  // 1. Exact Match Pass
  for (const token of tokens) {
    for (const brand of knownBrands) {
      if (token === brand) {
        const match = MOCK_MEDICINES.find((m) => m.brand_name.toLowerCase() === brand);
        return match ? match.brand_name : null;
      }
    }
  }

  // 2. Partial 'ilike' / Substring Overlap Match Pass
  // Matches tokens that are substrings of the brand, or brands that are substrings of the token.
  let bestOverlapBrand: string | null = null;
  let highestOverlapScore = 0;

  for (const token of tokens) {
    if (token.length < 3) continue; // Ensure candidate has minimal length

    for (const brand of knownBrands) {
      if (brand.includes(token) || token.includes(brand)) {
        const overlapScore = Math.min(token.length, brand.length) / Math.max(token.length, brand.length);
        // We match if it has at least a 50% length overlap, taking the best match
        if (overlapScore >= 0.50 && overlapScore > highestOverlapScore) {
          highestOverlapScore = overlapScore;
          bestOverlapBrand = brand;
        }
      }
    }
  }

  if (bestOverlapBrand) {
    const match = MOCK_MEDICINES.find((m) => m.brand_name.toLowerCase() === bestOverlapBrand);
    return match ? match.brand_name : null;
  }

  // 3. Fuzzy Levenshtein Match Pass (up to 2 character differences for words >= 4 chars)
  let bestFuzzyBrand: string | null = null;
  let minFuzzyDistance = 3; // Must be < 3 (i.e. max 2 edits)

  for (const token of tokens) {
    for (const brand of knownBrands) {
      if (token.length < 4 || brand.length < 4) continue;

      // Skip if lengths are too different
      if (Math.abs(token.length - brand.length) > 2) continue;

      const dist = getLevenshteinDistance(token, brand);
      if (dist < minFuzzyDistance) {
        minFuzzyDistance = dist;
        bestFuzzyBrand = brand;
      }
    }
  }

  if (bestFuzzyBrand) {
    const match = MOCK_MEDICINES.find((m) => m.brand_name.toLowerCase() === bestFuzzyBrand);
    return match ? match.brand_name : null;
  }

  return null;
}
