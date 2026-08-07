import type { TranslationKey } from "@/lib/i18n/useI18n";
import type { Lead } from "@/lib/db/schema";

export type LeadQualificationStatus = Lead["qualificationStatus"];

export const LEAD_QUALIFICATION_STATUS = {
  new: "new",
  contacted: "contacted",
  qualified: "qualified",
  discarded: "discarded",
} as const satisfies Record<string, LeadQualificationStatus>;

export interface LeadQualificationStageConfig {
  id: LeadQualificationStatus;
  labelKey: TranslationKey;
}

export const LEAD_QUALIFICATION_STAGES: LeadQualificationStageConfig[] = [
  { id: LEAD_QUALIFICATION_STATUS.new, labelKey: "leads.board.stage.new" },
  { id: LEAD_QUALIFICATION_STATUS.contacted, labelKey: "leads.board.stage.contacted" },
  { id: LEAD_QUALIFICATION_STATUS.qualified, labelKey: "leads.board.stage.qualified" },
  { id: LEAD_QUALIFICATION_STATUS.discarded, labelKey: "leads.board.stage.discarded" },
];
