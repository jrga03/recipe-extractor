/**
 * Constants
 */

// Use only common ingredients as main ingredients
const MAIN_INGREDIENTS = ["beef", "chicken", "fish", "lamb", "pork", "chocolate"];

const COMMON_INGREDIENT_UNITS = [
  "teaspoons",
  "teaspoon",
  "tsp.",
  "tsp",
  "tablespoons",
  "tablespoon",
  "tbl.",
  "tbl",
  "tbs.",
  "tbs",
  "tbsp.",
  "tbsp",
  "fluid ounce",
  "fl oz",
  "fl. oz.",
  "gills",
  "gill",
  "cups",
  "cup",
  "c",
  "pints",
  "pint",
  "p.",
  "p",
  "pt.",
  "pt",
  "fl. pt.",
  "fl pt",
  "quarts",
  "quart",
  "qt.",
  "q.",
  "fl. qt.",
  "qt",
  "q",
  "fl qt",
  "gallons",
  "gallon",
  "gal.",
  "gal",
  "milliliters",
  "milliliter",
  "millilitres",
  "millilitre",
  "cc.",
  "cc",
  "mL",
  "ml",
  "liters",
  "liter",
  "litres",
  "litre",
  "L",
  "l",
  "pounds",
  "pound",
  "lbs.",
  "lbs",
  "lb.",
  "lb",
  "ounces",
  "ounce",
  "oz.",
  "oz",
  "milligrams",
  "milligrammes",
  "milligram",
  "milligramme",
  "mg.",
  "mg",
  "grams",
  "grammes",
  "gram",
  "gramme",
  "g.",
  "g",
  "kilograms",
  "kilogrammes",
  "kilogram",
  "kilogramme",
  "kilos",
  "kilo",
  "kgs.",
  "kg.",
  "kgs",
  "kg",
  "pinch",
  "cloves",
  "clove",
  "strips",
  "strip",
  "pieces",
  "piece",
  "bundles",
  "bundle",
  "thumbs",
  "thumb"
];

const FRACTION_MAPPING: { [index: number]: string } = {
  188: "1/4",
  189: "1/2",
  190: "3/4",
  8528: "1/7",
  8529: "1/9",
  8530: "1/10",
  8531: "1/3",
  8532: "2/3",
  8533: "1/5",
  8534: "2/5",
  8535: "3/5",
  8536: "4/5",
  8537: "1/6",
  8538: "5/6",
  8539: "1/8",
  8540: "3/8",
  8541: "5/8",
  8542: "7/8"
};

type StringOrUndefined = string | undefined;

/**
 * Convert duration string to readable format
 */
function parseDuration(duration: string = ""): { hours: number; minutes: number } {
  const regexp = new RegExp(
    /(P((?<year>\d+)Y)?((?<month>\d+)M)?((?<week>\d+)W)?((?<day>\d+)D)?)?(T((?<hour>\d+)H)?((?<minute>\d+)M)?((?<second>\d+)S)?)?/
  );
  const match = duration.match(regexp);

  if (match) {
    const { year, month, week, day, hour, minute } = match?.groups as {
      year: StringOrUndefined;
      month: StringOrUndefined;
      week: StringOrUndefined;
      day: StringOrUndefined;
      hour: StringOrUndefined;
      minute: StringOrUndefined;
    };

    let hours = parseInt(hour ?? "", 10) || 0;

    if (year) hours += (parseInt(year, 10) || 0) * 8760;
    if (month) hours += (parseInt(month, 10) || 0) * 730;
    if (week) hours += (parseInt(week, 10) || 0) * 168;
    if (day) hours += (parseInt(day, 10) || 0) * 24;

    let minutes = parseInt(minute ?? "", 10) || 0;
    if (minutes >= 60) {
      hours += minutes / 60;
      minutes = minutes % 60;
    }

    return {
      hours,
      minutes
    };
  }

  return {
    hours: 0,
    minutes: 0
  };
}

/**
 * Generate instructions from an array of instructions
 */
function generateInstructionsString(instructions: string | Array<{ text: string }> = []): string {
  if (typeof instructions === "string") {
    return instructions;
  }

  return instructions
    .reduce((str, instruction) => {
      return str.concat(instruction.text).concat("\n\n");
    }, "")
    .trim();
}

/**
 * Format recipe ingredients
 * @param {string[]} ingredients
 * @returns {object[]}
 */
function parseIngredients(ingredients: string[] = []) {
  try {
    return ingredients.map((_ingredient) => {
      let note = "";
      let withoutNote = _ingredient;
      const commaIndex = _ingredient.indexOf(",");
      if (commaIndex > -1) {
        note = _ingredient.slice(commaIndex + 1).trim();
        withoutNote = _ingredient.slice(0, commaIndex);
      }

      const parensRegex = new RegExp(/\((?<additionalNote>.+)\)/);
      if (parensRegex.test(withoutNote)) {
        const match = withoutNote.match(parensRegex);
        const additionalNote = match?.groups?.additionalNote;
        note = `${additionalNote}${note ? ", " : ""}${note}`;
        withoutNote = withoutNote.replace(parensRegex, "").replace(/\s{2,}/g, " ");
      }

      // convert numbers to fractions
      const withoutNoteParsedAndSplit = withoutNote
        .split(/\s|,/)
        .map((item) => FRACTION_MAPPING[item.charCodeAt(0)] || item);
      const unitIndex = withoutNoteParsedAndSplit.findIndex((word) =>
        COMMON_INGREDIENT_UNITS.includes(word.toLowerCase())
      );

      let unit = "";
      let amount = "";
      let ingredient = "";
      if (unitIndex > -1) {
        amount = withoutNoteParsedAndSplit.slice(0, unitIndex).join(" ");
        unit = withoutNoteParsedAndSplit[unitIndex];
        ingredient = withoutNoteParsedAndSplit.slice(unitIndex + 1).join(" ");
      } else {
        const joined = withoutNoteParsedAndSplit.join(" ").replace(/\s,/g, ",");
        const amountIngredientRegexp = new RegExp(
          /(?<parsedAmount>\d+\s\d+\/\d+|\d+\/\d+|\d+)?(?<parsedIngredient>.+)/
        );
        const match = joined.match(amountIngredientRegexp);
        const { parsedAmount, parsedIngredient } = match?.groups as {
          parsedAmount: StringOrUndefined;
          parsedIngredient: StringOrUndefined;
        };
        amount = (parsedAmount || "").trim();
        ingredient = (parsedIngredient || "").trim();
      }

      return {
        note,
        unit,
        amount,
        ingredient
      };
    });
  } catch (error) {
    console.log("Error in parseIngredients", error);
    return [];
  }
}

/**
 * Check if Recipe type
 */
export function isRecipeType(object: { "@type"?: string } = {}) {
  return object?.["@type"] === "Recipe";
}

/**
 * Get duration string for display in UI
 */
export function getDurationDisplay(hr: string, min: string): string {
  const hour = parseInt(hr, 10);
  const minute = parseInt(min, 10);
  if (!hour && !minute) return "---";
  const durations = [];
  if (hour) durations.push(`${hour} hr`);
  if (minute) durations.push(`${minute} min`);
  return durations.join(" ");
}

/**
 * Extract recipe data
 * @param {object} recipe - Recipe data
 * @returns {object}
 */
export function extractRecipeInitialValues(
  recipe: {
    name?: string;
    description?: string;
    recipeInstructions?: string | Array<{ text: string }>;
    recipeIngredient?: Array<string>;
  } = {}
) {
  return {
    title: recipe.name || "",
    description: recipe.description || "",
    ingredients: parseIngredients(recipe.recipeIngredient),
    // "prep-notes": [],
    directions: generateInstructionsString(recipe.recipeInstructions)
  };
}
