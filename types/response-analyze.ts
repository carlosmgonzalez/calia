export interface AnalyzedResponse {
  foodAnalysis: FoodAnalysis;
}

export interface FoodAnalysis {
  identifiedFood: string;
  portionSize: string;
  recognizedServingSize: string;
  nutritionFactsPerPortion: NutritionFactsPer;
  nutritionFactsPer100g: NutritionFactsPer;
  additionalNotes: string[];
}

export interface NutritionFactsPer {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  cholesterol: string;
}
