import type { SalaryInput } from "@/lib/salary/types";

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
