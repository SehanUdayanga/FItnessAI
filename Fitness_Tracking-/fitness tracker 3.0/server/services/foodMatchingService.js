// Sri Lankan Food Matching Engine

const SRI_LANKAN_ALIASES = {
  // Dhal / Parippu
  'parippu': 'Dhal Curry',
  'parippu curry': 'Dhal Curry',
  'dal': 'Dhal Curry',
  'dal curry': 'Dhal Curry',
  'dhal': 'Dhal Curry',
  'dhal curry': 'Dhal Curry',
  'dhal curry with coconut milk': 'Dhal Curry with coconut milk',
  'yellow dhal': 'Dhal Curry',

  // Kottu
  'kottu': 'Chicken Kottu',
  'kottu roti': 'Chicken Kottu',
  'koththu': 'Chicken Kottu',
  'kothu': 'Chicken Kottu',
  'kotu': 'Chicken Kottu',
  'chicken kottu': 'Chicken Kottu',
  'chicken koththu': 'Chicken Kottu',
  'egg kottu': 'Egg Kottu',
  'beef kottu': 'Beef Kottu',
  'vegetable kottu': 'Vegetable Kottu',
  'veg kottu': 'Vegetable Kottu',

  // String Hoppers / Idiyappam
  'string hopper': 'Idiyappam',
  'string hoppers': 'Idiyappam',
  'indi appa': 'Idiyappam',
  'indiappa': 'Idiyappam',
  'idiyappam': 'Idiyappam',

  // Hoppers / Appa
  'appa': 'Hoppers',
  'appam': 'Hoppers',
  'hopper': 'Hoppers',
  'hoppers': 'Hoppers',
  'plain hopper': 'Hoppers',
  'plain hoppers': 'Hoppers',
  'egg appa': 'Hoppers',
  'egg hopper': 'Hoppers',
  'egg hoppers': 'Hoppers',

  // Roti
  'pol roti': 'Coconut Roti',
  'polroti': 'Coconut Roti',
  'coconut roti': 'Coconut Roti',
  'roti': 'Coconut Roti',

  // Sambal / Sambol
  'pol sambol': 'Coconut Sambal',
  'polsambol': 'Coconut Sambal',
  'coconut sambal': 'Coconut Sambal',
  'coconut sambol': 'Coconut Sambal',
  'sambal': 'Coconut Sambal',
  'sambol': 'Coconut Sambal',
  'lunu miris': 'Lunu Miris',
  'lunumiris': 'Lunu Miris',
  'seeni sambol': 'Lunu Miris',
  'seenisambol': 'Lunu Miris',
  'kata sambol': 'Lunu Miris',

  // Rice
  'sudu bath': 'White Rice',
  'bath': 'White Rice',
  'buth': 'White Rice',
  'rice': 'White Rice',
  'cooked rice': 'White Rice',
  'steamed rice': 'White Rice',
  'white rice': 'White Rice',
  'brown rice': 'Brown Rice',
  'red rice': 'Red Rice',
  'rathu bath': 'Red Rice',
  'yellow rice': 'Yellow Rice',
  'kaha bath': 'Yellow Rice',

  // Milk Rice
  'kiri bath': 'Kiribath',
  'kiribath': 'Kiribath',
  'milk rice': 'Kiribath',

  // Curries & Meats
  'kukul mas': 'Chicken Curry',
  'kukul mas curry': 'Chicken Curry',
  'chicken': 'Chicken Curry',
  'chicken curry': 'Chicken Curry',
  'chicken breast': 'Chicken Breast',
  'chicken gravy': 'Chicken Gravy',
  'fried halmesso': 'Fried Halmesso',
  'halmesso': 'Fried Halmesso',
  'fried karawala': 'Fried Karawala',
  'karawala': 'Fried Karawala',
  'dry fish': 'Fried Karawala',
  'soya meat': 'Soya meat curry',
  'soya meat curry': 'Soya meat curry',
  'beetroot': 'Beetroot curry with coconut milk',
  'beetroot curry': 'Beetroot curry with coconut milk',
  'kiri hodi': 'Kiri Hodi',
  'kirihodi': 'Kiri Hodi',
  'kola mallum': 'Kola Mallum',
  'mallum': 'Kola Mallum',
  'malluma': 'Kola Mallum',

  // Short Eats / Breads
  'roast paan': 'Roast Paan',
  'roast bread': 'Roast Paan',
  'thati paan': 'Thati Paan',
  'kibula banis': 'Kibula Banis',
  'kimbula banis': 'Kibula Banis',
  'vegetable roll': 'Vegetable Roll',
  'chinese roll': 'Vegetable Roll',
  'roll': 'Vegetable Roll',
  'samaposha': 'Samaposha Aggala',
  'samaposha aggala': 'Samaposha Aggala',
  'lavariya': 'Lavariya',
  'dodol': 'Dodol',
  'helapa': 'Helapa',
  'aluwa': 'Aluwa',

  // Grains / Boiled Pulses
  'cowpea': 'Boiled Cowpea',
  'boiled cowpea': 'Boiled Cowpea',
  'chickpea': 'Boiled Chickpeas',
  'chickpeas': 'Boiled Chickpeas',
  'boiled chickpeas': 'Boiled Chickpeas',
  'kadala': 'Boiled Chickpeas',
  'mung': 'Boiled Mung',
  'boiled mung': 'Boiled Mung',
  'bathala': 'Boiled Sweet Potato',
  'sweet potato': 'Boiled Sweet Potato',
  'boiled sweet potato': 'Boiled Sweet Potato',
  'manioc': 'Boiled Sweet Potato'
};

// Distinct protein/base tokens that must never conflict
const CONFLICT_TOKENS = ['chicken', 'fish', 'egg', 'beef', 'vegetable', 'veg', 'pork', 'mutton', 'soya'];

/**
 * Clean and normalize a food name string
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ');
}

/**
 * Handle singular/plural variations (e.g. hoppers -> hopper)
 */
function toSingularPluralForms(text) {
  const forms = [text];
  if (text.endsWith('s') && text.length > 3) {
    forms.push(text.slice(0, -1));
  } else if (!text.endsWith('s')) {
    forms.push(text + 's');
  }
  return forms;
}

/**
 * Check whether two strings share conflicting key ingredient tokens
 */
function hasIngredientConflict(nameA, nameB) {
  const normA = normalizeText(nameA).split(' ');
  const normB = normalizeText(nameB).split(' ');

  for (const token of CONFLICT_TOKENS) {
    const inA = normA.includes(token);
    const inB = normB.includes(token);
    if ((inA && !inB) || (!inA && inB)) {
      // One has chicken and the other does not (e.g. fish, egg, veg)
      for (const other of CONFLICT_TOKENS) {
        if (token !== other && ((inA && normB.includes(other)) || (inB && normA.includes(other)))) {
          return true; // Direct conflict like chicken vs fish
        }
      }
    }
  }
  return false;
}

/**
 * Intelligent food-matching function:
 * Matches raw detected name or AI-proposed name against MongoDB foods.
 *
 * @param {string} detectedName - e.g. "Parippu Curry" or "Rice"
 * @param {string} aiMatchedName - e.g. "Dhal Curry" or "White Rice"
 * @param {Array} allDbFoods - Array of Food documents [{ _id, name, caloriesPer100g }]
 * @returns {Object} { matchedFood, isKnown, foodName, caloriesPer100g, possibleMatches }
 */
function matchFoodToDatabase(detectedName, aiMatchedName, allDbFoods = []) {
  if (!allDbFoods || allDbFoods.length === 0) {
    return {
      matchedFood: null,
      isKnown: false,
      foodName: detectedName || 'Unknown Food',
      caloriesPer100g: null,
      possibleMatches: []
    };
  }

  const normDetected = normalizeText(detectedName);
  const normAiMatched = normalizeText(aiMatchedName);

  // Candidate names to check against the database
  const queryCandidates = [
    detectedName,
    aiMatchedName,
    SRI_LANKAN_ALIASES[normDetected],
    SRI_LANKAN_ALIASES[normAiMatched]
  ].filter(Boolean);

  // 1. Exact Match (Case-Insensitive)
  for (const candidate of queryCandidates) {
    const normCand = normalizeText(candidate);
    const exact = allDbFoods.find((f) => normalizeText(f.name) === normCand);
    if (exact) {
      return {
        matchedFood: exact,
        isKnown: true,
        foodName: exact.name,
        caloriesPer100g: exact.caloriesPer100g,
        possibleMatches: []
      };
    }
  }

  // 2. Singular / Plural variations (e.g. "String Hopper" -> "String Hoppers", "Hopper" -> "Hoppers")
  for (const candidate of queryCandidates) {
    const variations = toSingularPluralForms(normalizeText(candidate));
    for (const v of variations) {
      const match = allDbFoods.find((f) => normalizeText(f.name) === v);
      if (match) {
        return {
          matchedFood: match,
          isKnown: true,
          foodName: match.name,
          caloriesPer100g: match.caloriesPer100g,
          possibleMatches: []
        };
      }
    }
  }

  // 3. Normalized Substring / Token matching with conflict protection
  let bestMatch = null;
  let bestScore = 0;
  const possibleMatches = [];

  for (const dbFood of allDbFoods) {
    const normDb = normalizeText(dbFood.name);

    for (const candidate of queryCandidates) {
      const normCand = normalizeText(candidate);
      if (!normCand) continue;

      if (hasIngredientConflict(normCand, normDb)) {
        continue; // Prevent Chicken Curry -> Fish Curry
      }

      // Check substring containment
      if (normDb.includes(normCand) || normCand.includes(normDb)) {
        const lengthDiff = Math.abs(normDb.length - normCand.length);
        const score = 100 - lengthDiff;

        if (!possibleMatches.some((p) => p._id.toString() === dbFood._id.toString())) {
          possibleMatches.push({
            _id: dbFood._id,
            name: dbFood.name,
            caloriesPer100g: dbFood.caloriesPer100g
          });
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = dbFood;
        }
      }
    }
  }

  if (bestMatch && bestScore >= 60) {
    return {
      matchedFood: bestMatch,
      isKnown: true,
      foodName: bestMatch.name,
      caloriesPer100g: bestMatch.caloriesPer100g,
      possibleMatches: possibleMatches.filter((p) => p._id.toString() !== bestMatch._id.toString()).slice(0, 3)
    };
  }

  // 4. If no safe match found, check if it's a known generic dish with choices (e.g., "Kottu")
  if (normDetected.includes('kottu') || normAiMatched.includes('kottu')) {
    const kottuOptions = allDbFoods
      .filter((f) => f.name.toLowerCase().includes('kottu'))
      .map((f) => ({ _id: f._id, name: f.name, caloriesPer100g: f.caloriesPer100g }));

    // Default to Chicken Kottu if in DB or first kottu
    const defaultKottu = kottuOptions.find((f) => f.name === 'Chicken Kottu') || kottuOptions[0];

    if (defaultKottu) {
      return {
        matchedFood: defaultKottu,
        isKnown: true,
        foodName: defaultKottu.name,
        caloriesPer100g: defaultKottu.caloriesPer100g,
        possibleMatches: kottuOptions.filter((k) => k.name !== defaultKottu.name)
      };
    }
  }

  // 5. Truly Unmatched / Unknown Food
  return {
    matchedFood: null,
    isKnown: false,
    foodName: aiMatchedName || detectedName || 'Unknown Food',
    caloriesPer100g: null,
    possibleMatches: possibleMatches.slice(0, 3)
  };
}

module.exports = {
  SRI_LANKAN_ALIASES,
  normalizeText,
  matchFoodToDatabase
};
