import type { Announcement, MemberDetail } from "../../types";

export interface UserInfo {
  email: string;
  role: string;
  name?: string;
}

export interface ApiSponsor {
  company_name: string;
  email_list: string[];
  passcode: string;
  tier: string;
}

export interface SponsorUpdateData {
  companyName: string;
  description: string;
  links: string[];
}

export interface ConfirmDialogInfo {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface MemberSummary {
  email: string;
  name?: string;
  rank?: string;
}

export type { Announcement, MemberDetail };
