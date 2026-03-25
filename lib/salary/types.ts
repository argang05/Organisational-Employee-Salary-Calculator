export type YesNo = "yes" | "no";
export type NpsRate = 0 | 5 | 10 | 14;
export type PreviousYearNpsRate = 0 | 10 | 14;
export type PfMode = "none" | "fixed1800" | "twelvePercent";
export type MedicalInsuranceTier = "none" | "oneMember" | "twoMembers";

export interface ComparisonYearInput {
  annualCtc: number;
  byodChoice: YesNo;
  npsRate: NpsRate | PreviousYearNpsRate;
  pfMode: PfMode;
  carRentalChoice: YesNo;
  carRentalAmount: number;
  vpfAmount: number;
  medicalInsuranceTier: MedicalInsuranceTier;
  loanAndAdvanceAmount: number;
}

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

export interface ComparisonInput {
  currentYear: ComparisonYearInput;
  previousYear: ComparisonYearInput;
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
  surcharge: number;
  educationCess: number;
  netAnnualTax: number;
  netMonthlyTax: number;
  professionalTaxMonthly: number;
  vpfMonthly: number;
  medicalInsuranceMonthly: number;
  loanAndAdvanceMonthly: number;
  maxVpfAllowed: number;
  maxLoanAdvanceAllowed: number;
  netInHandBeforeOptionalDeductions: number;
  totalDeductions: number;
  netInHandMonthly: number;
}

export interface SalaryComparisonColumn {
  annualCtc: number;
  monthlyCtc: number;
  basic: number;
  hra: number;
  lta: number;
  carPerks: number;
  carRentalAmount: number;
  remainingCarRental: number;
  maxCarRentalAllowed: number;
  specialAllowance: number;
  bonus: number;
  grossSalary: number;
  pf: number;
  gratuity: number;
  nps: number;
  vpf: number;
  medicalInsurance: number;
  loansAndAdvances: number;
  maxVpfAllowed: number;
  maxLoanAdvanceAllowed: number;
  otherBenefits: number;
  subtotal: number;
  byod: number;
  professionalTax: number;
  surcharge: number;
  incomeTax: number;
  employeeDeduction: number;
  netSalary: number;
}

export interface SalaryComparison {
  previousYear: SalaryComparisonColumn | null;
  currentYear: SalaryComparisonColumn | null;
  warnings: string[];
}

export interface SalaryResponse {
  input: SalaryInput;
  breakdown: SalaryBreakdown;
  warnings: string[];
  errors: string[];
  assumptions: string[];
}

export interface ComparisonResponse {
  input: ComparisonInput;
  comparison: SalaryComparison;
  warnings: string[];
  errors: string[];
  assumptions: string[];
}
