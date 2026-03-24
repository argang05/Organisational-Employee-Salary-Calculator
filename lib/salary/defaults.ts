import type { ComparisonInput, SalaryInput } from "@/lib/salary/types";

export const defaultSalaryInput: SalaryInput = {
  annualCtc: 0,
  byodChoice: "yes",
  carRentalChoice: "no",
  carRentalAmount: 0,
  npsRate: 0,
  pfMode: "fixed1800",
  professionalTaxChoice: "yes",
  vpfAmount: 0,
  medicalInsuranceTier: "none",
  loanAndAdvanceAmount: 0,
};

export const defaultComparisonInput: ComparisonInput = {
  currentYear: {
    annualCtc: 0,
    byodChoice: "yes",
    npsRate: 0,
    pfMode: "fixed1800",
    carRentalChoice: "no",
    carRentalAmount: 0,
    vpfAmount: 0,
    medicalInsuranceTier: "none",
    loanAndAdvanceAmount: 0,
  },
  previousYear: {
    annualCtc: 0,
    byodChoice: "yes",
    npsRate: 0,
    pfMode: "twelvePercent",
    carRentalChoice: "no",
    carRentalAmount: 0,
    vpfAmount: 0,
    medicalInsuranceTier: "none",
    loanAndAdvanceAmount: 0,
  },
};
