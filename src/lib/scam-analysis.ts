import { z } from "zod";

export const analysisInputSchema = z.object({
  message: z.string().trim().min(8, "Enter at least 8 characters to analyze.").max(12_000),
});

export const scamAnalysisSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  scamType: z.string().min(1).max(80),
  redFlags: z.array(z.string().min(1).max(180)).max(12),
  explanation: z.string().min(1).max(2_000),
  recommendation: z.string().min(1).max(1_000),
  eli15: z.string().min(1).max(1_000),
  confidence: z.number().int().min(0).max(100),
});

export type ScamAnalysis = z.infer<typeof scamAnalysisSchema>;

export type HistoryEntry = ScamAnalysis & {
  id: string;
  input: string;
  createdAt: string;
};