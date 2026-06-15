import { z } from "zod";

// Accept message OR image OR phone (at least one). Image is a base64 data URL.
export const analysisInputSchema = z
  .object({
    message: z.string().trim().max(12_000).optional().default(""),
    imageDataUrl: z
      .string()
      .regex(/^data:image\/(png|jpe?g|webp|gif);base64,/i, "Image must be a PNG, JPG, WEBP, or GIF data URL.")
      .max(8_000_000, "Image is too large. Use one under ~6 MB.")
      .optional(),
    phoneNumber: z.string().trim().max(40).optional(),
  })
  .refine((v) => (v.message?.length ?? 0) >= 8 || !!v.imageDataUrl || !!v.phoneNumber, {
    message: "Provide a message (8+ chars), a screenshot, or a phone number.",
  });

export type AnalysisInput = z.infer<typeof analysisInputSchema>;

export const phoneAnalysisSchema = z.object({
  number: z.string().min(1).max(40),
  country: z.string().max(80),
  carrierType: z.string().max(80), // e.g. "Mobile (likely VoIP)"
  reputation: z.enum(["Safe", "Unknown", "Suspicious", "Known scam pattern"]),
  notes: z.string().max(600),
});

export type PhoneAnalysis = z.infer<typeof phoneAnalysisSchema>;

export const scamAnalysisSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  scamType: z.string().min(1).max(80),
  redFlags: z.array(z.string().min(1).max(180)).max(12),
  explanation: z.string().min(1).max(2_000),
  recommendation: z.string().min(1).max(1_000),
  eli15: z.string().min(1).max(1_000),
  confidence: z.number().int().min(0).max(100),
  phone: phoneAnalysisSchema.nullable().optional(),
});

export type ScamAnalysis = z.infer<typeof scamAnalysisSchema>;

export type HistoryEntry = ScamAnalysis & {
  id: string;
  input: string;
  createdAt: string;
  kind: "message" | "url" | "image" | "phone";
};
