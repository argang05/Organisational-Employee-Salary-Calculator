export type YesNo = "yes" | "no";
export type NpsRate = 0 | 5 | 10 | 14;
export type PfMode = "none" | "fixed1800" | "twelvePercent";
export type MedicalInsuranceTier = "none" | "oneMember" | "twoMembers";

export interface SalaryInput {
  annualCtc: number;
  byodChoice: YesNo;
  carRentalChoice: YesNo;
  carRentalAmount: number;
  npsRate: NpsRate;
  pfMode: PfMode;
  professionalTaxChoice: YesNo;
  vpfAmount: number;
  medicalInsuranceTier: MedicalInsuranceTier;
  loanAndAdvanceAmount: number;
}

export interface SalaryBreakdown {
  monthlyCtc: number;
  basic: number;
  hra: number;
  lta: number;
  bonusAllowance: number;
  byod: number;
  carPerks: number;
  nps: number;
  pf: number;
  gratuity: number;
  totalEmployerContribution: number;
  specialAllowanceBeforeAdjustments: number;
  specialAllowanceAfterAdjustments: number;
  grossSalaryBeforeAdjustments: number;
  grossSalaryAfterAdjustments: number;
  calculatedMonthlyCtc: number;
  netDiff: number;
  carRentalAmount: number;
  remainingCarRental: number;
  maxCarRentalAllowed: number;
  annualTaxableIncome: number;
  annualIncomeTax: number;
  educationCess: number;
  netAnnualTax: number;
  netMonthlyTax: number;
  professionalTaxMonthly: number;
  medicalInsuranceMonthly: number;
  totalDeductions: number;
  netInHandMonthly: number;
}

export interface SalaryResponse {
  input: SalaryInput;
  breakdown: SalaryBreakdown;
  warnings: string[];
  errors: string[];
  assumptions: string[];
}
