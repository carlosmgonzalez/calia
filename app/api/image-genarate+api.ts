import { ai } from "@/lib/server/google/genai";
import { Modality } from "@google/genai";
import { z } from "zod/v4";

const bodySchema = z
  .object({
    prompt: z.string(),
  })
  .strict();

export const POST = async (request: Request) => {
  const body = await request.json();

  const { data, success, error } = await bodySchema.safeParseAsync(body);

  if (!success) {
    return Response.json(
      {
        message: `Prompt incorrecto`,
        error: error.issues,
      },
      { status: 404 }
    );
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: data.prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  if (!response) return Response.json({ message: "error" }, { status: 500 });

  for (const part of response.candidates![0].content!.parts!) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData!, "base64");
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png", // Cambia esto si el formato es diferente
          "Content-Disposition": 'inline; filename="image.png"',
        },
      });
    }
  }

  return Response.json({ message: "No image found" }, { status: 404 });
};
