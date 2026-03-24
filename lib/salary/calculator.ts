import type {
  MedicalInsuranceTier,
  SalaryBreakdown,
  SalaryInput,
  SalaryResponse,
} from "@/lib/salary/types";

const STANDARD_DEDUCTION = 75_000;
const CAR_PERKS_AMOUNT = 1_800;
const BYOD_AMOUNT = 1_500;
const PROFESSIONAL_TAX_MONTHLY = 2_500 / 12;

function round(value: number) {
  return Math.round(value);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return round2(value);
}

function getMedicalInsuranceMonthly(tier: MedicalInsuranceTier) {
  if (tier === "oneMember") {
    return 833;
  }
  if (tier === "twoMembers") {
    return 1667;
  }
  return 0;
}

function getSlabTax(netTaxableIncome: number) {
  if (netTaxableIncome <= 1_200_000) {
    return 0;
  }

  const slabs = [
    { start: 0, end: 400_000, rate: 0 },
    { start: 400_000, end: 800_000, rate: 0.05 },
    { start: 800_000, end: 1_200_000, rate: 0.1 },
    { start: 1_200_000, end: 1_600_000, rate: 0.15 },
    { start: 1_600_000, end: 2_000_000, rate: 0.2 },
    { start: 2_000_000, end: 2_400_000, rate: 0.25 },
    { start: 2_400_000, end: Number.POSITIVE_INFINITY, rate: 0.3 },
  ];

  let tax = 0;
  for (const slab of slabs) {
    if (netTaxableIncome <= slab.start) {
      continue;
    }

    const taxableSlice = Math.min(netTaxableIncome, slab.end) - slab.start;
    tax += taxableSlice * slab.rate;
  }

  return round2(tax);
}

export function calculateSalary(rawInput: SalaryInput): SalaryResponse {
  const input: SalaryInput = {
    ...rawInput,
    annualCtc: clampMoney(rawInput.annualCtc),
    carRentalAmount: clampMoney(rawInput.carRentalAmount),
    vpfAmount: clampMoney(rawInput.vpfAmount),
    loanAndAdvanceAmount: clampMoney(rawInput.loanAndAdvanceAmount),
  };

  const errors: string[] = [];
  const warnings: string[] = [];
  const assumptions = [
    "Bonus is applied when annual CTC is below Rs. 5,04,000 or when monthly basic is below Rs. 21,000, based on your written rule.",
    "Car perks of Rs. 1,800 are applied automatically whenever car rental is enabled.",
    "VPF, medical insurance, and loans/advances are treated as monthly deductions from net in hand, not from special allowance.",
    "Because Dearness Allowance is not captured in this calculator, the VPF cap is calculated monthly against basic salary only.",
  ];

  if (input.annualCtc <= 0) {
    return {
      input,
      breakdown: {
        monthlyCtc: 0,
        basic: 0,
        hra: 0,
        lta: 0,
        bonusAllowance: 0,
        byod: 0,
        carPerks: 0,
        nps: 0,
        pf: 0,
        gratuity: 0,
        totalEmployerContribution: 0,
        specialAllowanceBeforeAdjustments: 0,
        specialAllowanceAfterAdjustments: 0,
        grossSalaryBeforeAdjustments: 0,
        grossSalaryAfterAdjustments: 0,
        calculatedMonthlyCtc: 0,
        netDiff: 0,
        carRentalAmount: 0,
        remainingCarRental: 0,
        maxCarRentalAllowed: 0,
        annualTaxableIncome: 0,
        annualIncomeTax: 0,
        educationCess: 0,
        netAnnualTax: 0,
        netMonthlyTax: 0,
        professionalTaxMonthly: 0,
        vpfMonthly: 0,
        medicalInsuranceMonthly: 0,
        loanAndAdvanceMonthly: 0,
        maxVpfAllowed: 0,
        maxLoanAdvanceAllowed: 0,
        netInHandBeforeOptionalDeductions: 0,
        totalDeductions: 0,
        netInHandMonthly: 0,
      },
      warnings: [],
      errors: [],
      assumptions,
    };
  }

  const monthlyCtc = Math.ceil(input.annualCtc / 12);
  const basic = round(Math.max(monthlyCtc * 0.5, 17_000));
  const hra = round(basic * 0.4);
  const lta = round(basic * 0.1);
  const bonusAllowance = round(
    input.annualCtc < 504_000 || basic < 21_000 ? basic * 0.0833 : 0,
  );
  const byod = input.byodChoice === "yes" ? BYOD_AMOUNT : 0;
  const carPerks = input.carRentalChoice === "yes" ? CAR_PERKS_AMOUNT : 0;

  const nps =
    input.npsRate > 0 ? round2((basic * input.npsRate) / 100) : 0;
  const pf =
    input.pfMode === "fixed1800"
      ? 1800
      : input.pfMode === "twelvePercent"
        ? round2(basic * 0.12)
        : 0;
  const gratuity = round(basic * 0.0481);
  const totalEmployerContribution = round2(nps + pf + gratuity);

  const baseSpecialAllowance =
    monthlyCtc -
    basic -
    hra -
    lta -
    bonusAllowance -
    carPerks -
    totalEmployerContribution;

  const maxCarRentalAllowed = Math.max(0, round2(baseSpecialAllowance * 0.95));
  let carRentalAmount =
    input.carRentalChoice === "yes" ? input.carRentalAmount : 0;

  if (input.carRentalChoice === "yes" && carRentalAmount > maxCarRentalAllowed) {
    warnings.push(
      `Car rental exceeds 95% of special allowance. It has been capped at Rs. ${maxCarRentalAllowed.toLocaleString("en-IN")}.`,
    );
    carRentalAmount = maxCarRentalAllowed;
  }

  if (input.carRentalChoice === "no") {
    carRentalAmount = 0;
  }

  const specialAllowanceBeforeAdjustments = round2(
    baseSpecialAllowance - carRentalAmount,
  );

  if (specialAllowanceBeforeAdjustments < 0) {
    warnings.push(
      "Special allowance is negative after employer contributions and car-rental choices, and the gross salary has been reduced accordingly.",
    );
  }

  const medicalInsuranceMonthly = getMedicalInsuranceMonthly(
    input.medicalInsuranceTier,
  );
  const specialAllowanceAfterAdjustments = round2(
    specialAllowanceBeforeAdjustments,
  );

  const grossSalaryBeforeAdjustments = round2(
    basic + hra + lta + bonusAllowance + specialAllowanceBeforeAdjustments,
  );
  const grossSalaryAfterAdjustments = round2(
    basic + hra + lta + bonusAllowance + specialAllowanceAfterAdjustments,
  );
  const calculatedMonthlyCtc = round2(
    grossSalaryBeforeAdjustments + totalEmployerContribution,
  );
  const netDiff = round2(monthlyCtc - calculatedMonthlyCtc);
  const remainingCarRental = round2(Math.max(0, carRentalAmount - carPerks));

  const annualTaxableIncome = round2(
    Math.max(0, (grossSalaryAfterAdjustments + byod) * 12 - STANDARD_DEDUCTION),
  );
  const annualIncomeTax = getSlabTax(annualTaxableIncome);
  const educationCess = round2(annualIncomeTax * 0.04);
  const netAnnualTax = round2(annualIncomeTax + educationCess);
  const netMonthlyTax = round2(netAnnualTax / 12);
  const professionalTaxMonthly =
    input.professionalTaxChoice === "yes"
      ? round2(PROFESSIONAL_TAX_MONTHLY)
      : 0;
  const baseDeductions = round2(professionalTaxMonthly + netMonthlyTax + pf);
  const netInHandBeforeOptionalDeductions = round2(
    grossSalaryAfterAdjustments + byod - baseDeductions,
  );
  const maxVpfAllowed = round2(Math.max(0, Math.min(basic, netInHandBeforeOptionalDeductions)));
  let vpfAmount = round2(Math.min(input.vpfAmount, maxVpfAllowed));

  if (input.vpfAmount > maxVpfAllowed) {
    warnings.push(
      `VPF exceeds the allowed monthly limit. It has been capped at Rs. ${maxVpfAllowed.toLocaleString("en-IN")}.`,
    );
  }

  const maxLoanAdvanceAllowed = round2(
    Math.max(
      0,
      Math.min(
        netInHandBeforeOptionalDeductions - vpfAmount - medicalInsuranceMonthly,
        netInHandBeforeOptionalDeductions * 0.7,
      ),
    ),
  );
  let loanAndAdvanceAmount = round2(
    Math.min(input.loanAndAdvanceAmount, maxLoanAdvanceAllowed),
  );

  if (input.loanAndAdvanceAmount > maxLoanAdvanceAllowed) {
    warnings.push(
      `Loans and advances exceed the allowed monthly limit. They have been capped at Rs. ${maxLoanAdvanceAllowed.toLocaleString("en-IN")}.`,
    );
  }

  const totalDeductions = round2(
    baseDeductions + vpfAmount + medicalInsuranceMonthly + loanAndAdvanceAmount,
  );
  const netInHandMonthly = round2(
    Math.max(0, grossSalaryAfterAdjustments + byod - totalDeductions),
  );

  if (medicalInsuranceMonthly + vpfAmount + loanAndAdvanceAmount > 0) {
    warnings.push(
      "VPF, medical insurance, and loans/advances are being deducted from net in hand.",
    );
  }

  const breakdown: SalaryBreakdown = {
    monthlyCtc,
    basic,
    hra,
    lta,
    bonusAllowance,
    byod,
    carPerks,
    nps,
    pf,
    gratuity,
    totalEmployerContribution,
    specialAllowanceBeforeAdjustments: round2(specialAllowanceBeforeAdjustments),
    specialAllowanceAfterAdjustments: round2(specialAllowanceAfterAdjustments),
    grossSalaryBeforeAdjustments,
    grossSalaryAfterAdjustments,
    calculatedMonthlyCtc,
    netDiff,
    carRentalAmount: round2(carRentalAmount),
    remainingCarRental,
    maxCarRentalAllowed,
    annualTaxableIncome,
    annualIncomeTax,
    educationCess,
    netAnnualTax,
    netMonthlyTax,
    professionalTaxMonthly,
    vpfMonthly: vpfAmount,
    medicalInsuranceMonthly,
    loanAndAdvanceMonthly: loanAndAdvanceAmount,
    maxVpfAllowed,
    maxLoanAdvanceAllowed,
    netInHandBeforeOptionalDeductions,
    totalDeductions,
    netInHandMonthly,
  };

  return {
    input,
    breakdown,
    warnings,
    errors,
    assumptions,
  };
}
