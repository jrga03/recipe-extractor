import axios from "axios";
import cheerio from "cheerio";

import { extractRecipeInitialValues, isRecipeType } from "utils/recipe";

export default async function importRecipe(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      res.status(406).json({ message: "url is required" });
      return;
    }

    let valid = false;
    try {
      valid = Boolean(new URL(url));
    } catch {
      // Not a valid URL
    }
    if (!valid) {
      res.status(406).json({ message: "url is not a valid URL" });
      return;
    }

    const raw = await axios(url);
    const html = raw.data;
    const $ = cheerio.load(html, { xmlMode: false });
    const scripts = $("script[type='application/ld+json']").toArray();

    const recipes = scripts.reduce((acc, script) => {
      script.children.forEach((child) => {
        try {
          const ldJson = JSON.parse(child.data);
          const graphs = ldJson?.["@graph"];

          if (Array.isArray(ldJson) || Array.isArray(graphs)) {
            const recipe = (graphs || ldJson)?.find?.((graph) => isRecipeType(graph));

            if (recipe) {
              acc.push(recipe);
            }
          }

          if (isRecipeType(ldJson)) acc.push(ldJson);
          if (isRecipeType(graphs)) acc.push(graphs);
        } catch (error) {
          console.log("Error parsing ld+json", error);
          // DO nothing
        }
      });
      return acc;
    }, []);

    if (recipes.length === 0) {
      res.status(404).json({ message: "Recipe data not found" });
      return
    }

    const data = extractRecipeInitialValues(recipes[0]);

    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || "Something went wrong" });
  }
}
