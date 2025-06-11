import { ai } from "@/lib/server/google/genai";

import { z } from "zod/v4";

const bodySchema = z
  .object({
    inlineData: z.object({
      mimeType: z.string(),
      data: z.base64(),
    }),
  })
  .strict();

export const POST = async (request: Request) => {
  const body = await request.json();

  const { data, error, success } = await bodySchema.safeParseAsync(body);

  if (!success) {
    return Response.json({
      ok: false,
      error: error.issues,
      message: "",
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        inlineData: data.inlineData,
      },
      {
        text: `Analiza esta imagen de alimento y proporciona información nutricional detallada en el siguiente formato JSON:
    {
      "foodAnalysis": {
        "identifiedFood": "Nombre y descripción detallada de lo que ves en la imagen",
        "portionSize": "Tamaño estimado de la porción en gramos",
        "recognizedServingSize": "Tamaño estimado de la ración reconocida en gramos",
        "nutritionFactsPerPortion": {
          "calories": "Calorías estimadas",
          "protein": "Proteína estimada en gramos",
          "carbs": "Carbohidratos estimados en gramos",
          "fat": "Grasa estimada en gramos",
          "fiber": "Fibra estimada en gramos",
          "sugar": "Azúcar estimado en gramos",
          "sodium": "Sodio estimado en mg",
          "cholesterol": "Colesterol estimado en mg"
        },
        "nutritionFactsPer100g": {
          "calories": "Calorías por 100g",
          "protein": "Proteína en gramos por 100g",
          "carbs": "Carbohidratos en gramos por 100g",
          "fat": "Grasa en gramos por 100g",
          "fiber": "Fibra en gramos por 100g",
          "sugar": "Azúcar en gramos por 100g",
          "sodium": "Sodio en mg por 100g",
          "cholesterol": "Colesterol en mg por 100g"
        },
        "additionalNotes": [
          "Cualquier característica nutricional notable",
          "Presencia de alérgenos",
          "Si es vegetariano/vegano/sin gluten, si aplica"
        ]
      }
    }
    
    Asegúrate de que la respuesta esté en formato JSON válido, exactamente como se especifica arriba, sin ningún formato de Markdown.
    Proporciona estimaciones realistas basadas en tamaños de porción típicos y bases de datos nutricionales.
    Sé lo más específico y preciso posible al identificar el alimento y sus componentes.
    Da todas las respuestas en español.
    Asegúrate de calcular los valores nutricionales tanto por porción como por cada 100g para facilitar la comparación.`,
      },
    ],
  });

  const text = response.candidates![0].content!.parts![0].text;
  const cleanedText = text!.replace(/```json\n?|\n?```/g, "").trim();
  const parseText = JSON.parse(cleanedText);

  return Response.json({
    ok: true,
    error: null,
    analysis: parseText,
  });
};
