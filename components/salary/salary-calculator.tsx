"use client";

import * as React from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  CarFront,
  CircleAlert,
  GitCompareArrows,
  IndianRupee,
  Landmark,
  ShieldPlus,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { calculateSalary } from "@/lib/salary/calculator";
import { defaultComparisonInput, defaultSalaryInput } from "@/lib/salary/defaults";
import type {
  ComparisonInput,
  ComparisonResponse,
  ComparisonYearInput,
  SalaryComparisonColumn,
  SalaryInput,
  SalaryResponse,
} from "@/lib/salary/types";
import { cn, formatCurrency } from "@/lib/utils";

const comparisonCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatComparisonCurrency(value: number) {
  return comparisonCurrencyFormatter.format(value);
}

export function SalaryCalculator() {
  const { toast } = useToast();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [mode, setMode] = React.useState<"calculator" | "comparison">("calculator");
  const [form, setForm] = React.useState<SalaryInput>(defaultSalaryInput);
  const [comparisonForm, setComparisonForm] =
    React.useState<ComparisonInput>(defaultComparisonInput);
  const [result, setResult] = React.useState<SalaryResponse | null>(() =>
    calculateSalary(defaultSalaryInput),
  );
  const [comparisonResult, setComparisonResult] =
    React.useState<ComparisonResponse | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isComparisonPending, startComparisonTransition] = React.useTransition();
  const lastToastKeyRef = React.useRef<string>("");

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      async function runCalculation() {
        const response = await fetch("/api/salary/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = (await response.json()) as SalaryResponse;
        setResult(data);

        const toastKey = JSON.stringify({
          errors: data.errors,
          warnings: data.warnings,
        });

        if (toastKey !== lastToastKeyRef.current) {
          lastToastKeyRef.current = toastKey;

          if (data.errors?.length) {
            toast({
              title: "Please revise the figures",
              description: data.errors[0],
              variant: "destructive",
            });
          } else if (data.warnings?.length) {
            toast({
              title: "Calculation updated",
              description: data.warnings[0],
            });
          }
        }
      }

      startTransition(() => {
        void runCalculation();
      });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [form, toast]);

  React.useEffect(() => {
    if (mode !== "comparison") {
      return;
    }

    const handle = window.setTimeout(() => {
      async function runComparison() {
        const response = await fetch("/api/salary/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comparisonForm),
        });

        const data = (await response.json()) as ComparisonResponse;
        setComparisonResult(data);
      }

      startComparisonTransition(() => {
        void runComparison();
      });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [comparisonForm, mode]);

  const breakdown = result?.breakdown;
  const comparison = comparisonResult?.comparison;
  const comparisonCurrentYear = comparison?.currentYear;

  function setField<K extends keyof SalaryInput>(field: K, value: SalaryInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setComparisonField<
    Y extends keyof ComparisonInput,
    K extends keyof ComparisonInput[Y],
  >(
    year: Y,
    field: K,
    value: ComparisonInput[Y][K],
  ) {
    setComparisonForm((current) => ({
      ...current,
      [year]: {
        ...current[year],
        [field]: value,
      },
    }));
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="grid-surface overflow-hidden border-none bg-transparent shadow-none">
          <CardContent className="grid gap-8 p-0 md:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground shadow-soft md:px-10">
              <Badge className="bg-white/14 text-white">Salary Architecture</Badge>
              <div className="mt-6 max-w-2xl space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  {mode === "comparison"
                    ? "Salary Appraisal Comparison for two financial years"
                    : "Salary Calculator for Indian payroll structures"}
                </h1>
                <p className="text-sm leading-7 text-white/80 md:text-base">
                  {mode === "comparison"
                    ? "Compare monthly salary structure, benefits, and deductions for 2025-26 and 2026-27 with dedicated inputs for each year."
                    : "Fixed annual CTC goes in first. Salary structure, employer contribution, tax, optional benefits, and net in hand are calculated on the server and reflected instantly in the UI."}
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <HeroStat
                  icon={Calculator}
                  label={mode === "comparison" ? "2026-27 Net Salary" : "Monthly CTC"}
                  value={
                    mode === "comparison"
                      ? comparisonCurrentYear
                        ? formatCurrency(comparisonCurrentYear.netSalary)
                        : formatCurrency(0)
                      : breakdown
                        ? formatCurrency(breakdown.monthlyCtc)
                        : formatCurrency(0)
                  }
                />
                <HeroStat
                  icon={ShieldPlus}
                  label={mode === "comparison" ? "2025-26 Net Salary" : "Basic Salary"}
                  value={
                    mode === "comparison"
                      ? comparison?.previousYear
                        ? formatCurrency(comparison.previousYear.netSalary)
                        : formatCurrency(0)
                      : breakdown
                        ? formatCurrency(breakdown.basic)
                        : formatCurrency(0)
                  }
                />
                <HeroStat
                  icon={Landmark}
                  label={mode === "comparison" ? "Net Salary Difference" : "Net In Hand"}
                  value={
                    mode === "comparison"
                      ? comparisonCurrentYear && comparison?.previousYear
                        ? formatCurrency(
                            comparisonCurrentYear.netSalary -
                              comparison.previousYear.netSalary,
                          )
                        : formatCurrency(0)
                      : breakdown
                        ? formatCurrency(breakdown.netInHandMonthly)
                        : formatCurrency(0)
                  }
                  highlight
                />
              </div>
            </div>

            <Card className="border-white/80 bg-white/85">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {mode === "comparison" ? "Comparison Mode" : "Two-step flow"}
                    </CardTitle>
                    <CardDescription>
                      {mode === "comparison"
                        ? "Switch back to the salary calculator anytime, or stay here to compare both years."
                        : "Step 1 sets the structure. Step 2 applies employee choices."}
                    </CardDescription>
                  </div>
                  <Badge>{mode === "comparison" ? "Compare" : `Step ${step} of 2`}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {mode === "calculator" ? (
                  <>
                    <StepPill
                      active={step === 1}
                      index={1}
                      title="Core salary structure"
                      description="CTC, BYOD, PF, NPS, and car rental."
                    />
                    <StepPill
                      active={step === 2}
                      index={2}
                      title="Employee deductions"
                      description="VPF, medical insurance, loans, tax, and net salary."
                    />
                  </>
                ) : (
                  <StepPill
                    active
                    index={3}
                    title="Compare Salary Appraisal"
                    description="Two dedicated year sections feed the comparison table below."
                  />
                )}
                <div className="grid gap-3 md:grid-cols-3">
                  <Button
                    variant={mode === "calculator" && step === 1 ? "default" : "outline"}
                    onClick={() => {
                      setMode("calculator");
                      setStep(1);
                    }}
                    className="flex-1"
                  >
                    Structure
                  </Button>
                  <Button
                    variant={mode === "calculator" && step === 2 ? "default" : "outline"}
                    onClick={() => {
                      setMode("calculator");
                      setStep(2);
                    }}
                    className="flex-1"
                  >
                    Deductions
                  </Button>
                  <Button
                    variant={mode === "comparison" ? "default" : "outline"}
                    onClick={() => setMode("comparison")}
                    className="flex-1 gap-2"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare Appraisal
                  </Button>
                </div>
                {mode === "calculator" && isPending ? (
                  <p className="text-sm text-muted-foreground">
                    Recalculating figures...
                  </p>
                ) : null}
                {mode === "comparison" && isComparisonPending ? (
                  <p className="text-sm text-muted-foreground">
                    Recalculating comparison...
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {mode === "calculator" ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              {step === 1 ? (
                <StepOne form={form} setField={setField} breakdown={breakdown} />
              ) : (
                <StepTwo form={form} setField={setField} breakdown={breakdown} />
              )}
            </div>

            <div className="space-y-6">
              <SummaryCard result={result} />
              <TaxCard result={result} />
            </div>
          </div>
        ) : (
          <ComparisonModule
            form={comparisonForm}
            setField={setComparisonField}
            result={comparisonResult}
            isPending={isComparisonPending}
          />
        )}
      </div>
    </div>
  );
}

function StepOne({
  form,
  setField,
  breakdown,
}: {
  form: SalaryInput;
  setField: <K extends keyof SalaryInput>(field: K, value: SalaryInput[K]) => void;
  breakdown: SalaryResponse["breakdown"] | null | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Fixed CTC and structure</CardTitle>
        <CardDescription>
          This step mirrors the workbook logic for basic, HRA, LTA, bonus,
          employer contribution, and special allowance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <Label htmlFor="annualCtc">Fixed annual CTC 2026-27</Label>
            <Input
              id="annualCtc"
              type="number"
              min={1}
              value={form.annualCtc || ""}
              onChange={(event) =>
                setField("annualCtc", Number(event.target.value) || 0)
              }
              placeholder="Enter annual CTC"
            />
          </Field>

          <Field>
            <Label htmlFor="byodChoice">BYOD choice</Label>
            <Select
              id="byodChoice"
              value={form.byodChoice}
              onChange={(event) =>
                setField("byodChoice", event.target.value as SalaryInput["byodChoice"])
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="carRentalChoice">Car rental option</Label>
            <Select
              id="carRentalChoice"
              value={form.carRentalChoice}
              onChange={(event) =>
                setField(
                  "carRentalChoice",
                  event.target.value as SalaryInput["carRentalChoice"],
                )
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="carRentalAmount">
              Car rental amount
              {breakdown ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  Max {formatCurrency(breakdown.maxCarRentalAllowed)}
                </span>
              ) : null}
            </Label>
            <Input
              id="carRentalAmount"
              type="number"
              min={0}
              value={form.carRentalAmount || ""}
              disabled={form.carRentalChoice === "no"}
              onChange={(event) =>
                setField("carRentalAmount", Number(event.target.value) || 0)
              }
              placeholder="Enter car rental amount"
            />
            <p className="text-xs text-muted-foreground">
              Car perks of {formatCurrency(1800)} are applied automatically when
              car rental is enabled.
            </p>
          </Field>

          <Field>
            <Label htmlFor="npsRate">NPS contribution</Label>
            <Select
              id="npsRate"
              value={String(form.npsRate)}
              onChange={(event) =>
                setField("npsRate", Number(event.target.value) as SalaryInput["npsRate"])
              }
            >
              <option value="0">No</option>
              <option value="5">Yes - 5%</option>
              <option value="10">Yes - 10%</option>
              <option value="14">Yes - 14%</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="pfMode">PF contribution</Label>
            <Select
              id="pfMode"
              value={form.pfMode}
              onChange={(event) =>
                setField("pfMode", event.target.value as SalaryInput["pfMode"])
              }
            >
              <option value="fixed1800">Yes - Rs. 1,800</option>
              <option value="twelvePercent">Yes - 12% of basic</option>
              <option value="none">No</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="professionalTaxChoice">Professional tax</Label>
            <Select
              id="professionalTaxChoice"
              value={form.professionalTaxChoice}
              onChange={(event) =>
                setField(
                  "professionalTaxChoice",
                  event.target.value as SalaryInput["professionalTaxChoice"],
                )
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>
        </div>

        <SalarySnapshot
          title="Auto-calculated structure"
          items={[
            ["Monthly CTC", breakdown?.monthlyCtc],
            ["Basic", breakdown?.basic],
            ["HRA", breakdown?.hra],
            ["LTA", breakdown?.lta],
            ["Bonus allowance", breakdown?.bonusAllowance],
            ["Gratuity", breakdown?.gratuity],
            ["Employer contribution", breakdown?.totalEmployerContribution],
            ["Special allowance", breakdown?.specialAllowanceBeforeAdjustments],
          ]}
        />
      </CardContent>
    </Card>
  );
}

function StepTwo({
  form,
  setField,
  breakdown,
}: {
  form: SalaryInput;
  setField: <K extends keyof SalaryInput>(field: K, value: SalaryInput[K]) => void;
  breakdown: SalaryResponse["breakdown"] | null | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Choice-based deductions</CardTitle>
        <CardDescription>
          Special allowance stays unchanged here. VPF, medical insurance, and
          loans are now deducted from net in hand with live caps applied on the
          server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MiniPanel
            icon={IndianRupee}
            title="Current special allowance"
            value={
              breakdown
                ? formatCurrency(breakdown.specialAllowanceBeforeAdjustments)
                : formatCurrency(0)
            }
            negative={Boolean(
              breakdown && breakdown.specialAllowanceBeforeAdjustments < 0,
            )}
          />
          <MiniPanel
            icon={ShieldPlus}
            title="Net in hand before optional deductions"
            value={
              breakdown
                ? formatCurrency(breakdown.netInHandBeforeOptionalDeductions)
                : formatCurrency(0)
            }
          />
          <MiniPanel
            icon={CarFront}
            title="Remaining car rental"
            value={
              breakdown ? formatCurrency(breakdown.remainingCarRental) : formatCurrency(0)
            }
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <Label htmlFor="vpfAmount">
              VPF amount
              {breakdown ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  Max {formatCurrency(breakdown.maxVpfAllowed)}
                </span>
              ) : null}
            </Label>
            <Input
              id="vpfAmount"
              type="number"
              min={0}
              value={form.vpfAmount || ""}
              onChange={(event) =>
                setField("vpfAmount", Number(event.target.value) || 0)
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              VPF is deducted from net in hand and capped monthly using basic
              salary.
            </p>
          </Field>

          <Field>
            <Label htmlFor="medicalInsuranceTier">Medical insurance</Label>
            <Select
              id="medicalInsuranceTier"
              value={form.medicalInsuranceTier}
              onChange={(event) =>
                setField(
                  "medicalInsuranceTier",
                  event.target.value as SalaryInput["medicalInsuranceTier"],
                )
              }
            >
              <option value="none">No</option>
              <option value="oneMember">1 member - Rs. 833 / month</option>
              <option value="twoMembers">2 members - Rs. 1,667 / month</option>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="loanAndAdvanceAmount">
              Loans and advances
              {breakdown ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  Max {formatCurrency(breakdown.maxLoanAdvanceAllowed)}
                </span>
              ) : null}
            </Label>
            <Input
              id="loanAndAdvanceAmount"
              type="number"
              min={0}
              value={form.loanAndAdvanceAmount || ""}
              onChange={(event) =>
                setField("loanAndAdvanceAmount", Number(event.target.value) || 0)
              }
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Loans and advances are capped at 70% of net in hand, while also
              ensuring net in hand does not become negative.
            </p>
          </Field>
        </div>

        <SalarySnapshot
          title="Figures carried forward"
          items={[
            ["Gross salary", breakdown?.grossSalaryAfterAdjustments],
            ["Net taxable income", breakdown?.annualTaxableIncome],
            ["Net in hand before optional deductions", breakdown?.netInHandBeforeOptionalDeductions],
            ["Net monthly tax", breakdown?.netMonthlyTax],
            ["Total deductions", breakdown?.totalDeductions],
            ["Net in hand monthly", breakdown?.netInHandMonthly],
          ]}
        />
      </CardContent>
    </Card>
  );
}

function SummaryCard({ result }: { result: SalaryResponse | null }) {
  const breakdown = result?.breakdown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation summary</CardTitle>
        <CardDescription>
          All important figures are consolidated here for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result?.errors?.map((error) => (
          <Alert key={error} variant="destructive">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </Alert>
        ))}
        {result?.warnings?.map((warning) => (
          <Alert key={warning}>{warning}</Alert>
        ))}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Figure</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SummaryRow label="Monthly CTC" value={breakdown?.monthlyCtc} />
            <SummaryRow label="Gross salary" value={breakdown?.grossSalaryAfterAdjustments} />
            <SummaryRow
              label="Employer contribution"
              value={breakdown?.totalEmployerContribution}
            />
            <SummaryRow
              label="Special allowance"
              value={breakdown?.specialAllowanceAfterAdjustments}
              negative={Boolean(
                breakdown && breakdown.specialAllowanceAfterAdjustments < 0,
              )}
            />
            <SummaryRow label="Net annual tax" value={breakdown?.netAnnualTax} />
            <SummaryRow label="Total deductions" value={breakdown?.totalDeductions} />
            <SummaryRow
              label="Net in hand before optional deductions"
              value={breakdown?.netInHandBeforeOptionalDeductions}
            />
            <SummaryRow label="Net in hand monthly" value={breakdown?.netInHandMonthly} />
          </TableBody>
        </Table>

        {result?.assumptions?.length ? (
          <div className="space-y-2 rounded-2xl bg-secondary/40 p-4">
            <p className="text-sm font-semibold">Formula assumptions used</p>
            {result.assumptions.map((assumption) => (
              <p key={assumption} className="text-sm text-muted-foreground">
                {assumption}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TaxCard({ result }: { result: SalaryResponse | null }) {
  const breakdown = result?.breakdown;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax and deductions</CardTitle>
        <CardDescription>
          Based on the slab image you shared and the workbook style calculation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <MiniPanel
            icon={BriefcaseBusiness}
            title="Taxable income"
            value={
              breakdown ? formatCurrency(breakdown.annualTaxableIncome) : formatCurrency(0)
            }
          />
          <MiniPanel
            icon={Landmark}
            title="Monthly tax"
            value={breakdown ? formatCurrency(breakdown.netMonthlyTax) : formatCurrency(0)}
          />
        </div>

        <Table>
          <TableBody>
            <SummaryRow label="Annual income tax" value={breakdown?.annualIncomeTax} />
            {breakdown?.surcharge ? (
              <SummaryRow label="Surcharge" value={breakdown?.surcharge} />
            ) : null}
            <SummaryRow label="Education cess" value={breakdown?.educationCess} />
            <SummaryRow label="Professional tax" value={breakdown?.professionalTaxMonthly} />
            <SummaryRow label="PF" value={breakdown?.pf} />
            <SummaryRow label="VPF" value={breakdown?.vpfMonthly} />
            <SummaryRow label="Medical insurance" value={breakdown?.medicalInsuranceMonthly} />
            <SummaryRow label="Loans and advances" value={breakdown?.loanAndAdvanceMonthly} />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ComparisonCardTable({ result }: { result: ComparisonResponse | null }) {
  const comparison = result?.comparison;
  const currentYear = comparison?.currentYear;
  const previousYear = comparison?.previousYear;

  const rows: Array<{
    label: string;
    getValue: (column: SalaryComparisonColumn | null | undefined) => number;
    emphasis?: "subtotal" | "deduction";
    shouldShow?: (
      previous: SalaryComparisonColumn | null | undefined,
      current: SalaryComparisonColumn | null | undefined,
    ) => boolean;
  }> = [
    { label: "Basic", getValue: (column) => column?.basic ?? 0 },
    { label: "House Rent Allowance", getValue: (column) => column?.hra ?? 0 },
    { label: "Leave Travel Allowance", getValue: (column) => column?.lta ?? 0 },
    { label: "Special Allowance", getValue: (column) => column?.specialAllowance ?? 0 },
    { label: "Bonus", getValue: (column) => column?.bonus ?? 0 },
    {
      label: "Total Gross Salary (A)",
      getValue: (column) => column?.grossSalary ?? 0,
      emphasis: "subtotal",
    },
    {
      label: "Provident fund and pension scheme",
      getValue: (column) => column?.pf ?? 0,
    },
    { label: "Gratuity", getValue: (column) => column?.gratuity ?? 0 },
    { label: "NPS", getValue: (column) => column?.nps ?? 0 },
    {
      label: "Other Benefits (B)",
      getValue: (column) => column?.otherBenefits ?? 0,
      emphasis: "subtotal",
    },
    {
      label: "S. Total (A+B)",
      getValue: (column) => column?.subtotal ?? 0,
      emphasis: "subtotal",
    },
    { label: "BYOD", getValue: (column) => column?.byod ?? 0 },
    {
      label: "Provident fund and pension scheme",
      getValue: (column) => column?.pf ?? 0,
    },
    { label: "Professional Tax", getValue: (column) => column?.professionalTax ?? 0 },
    {
      label: "Surcharge",
      getValue: (column) => column?.surcharge ?? 0,
      shouldShow: (previous, current) =>
        Boolean((previous?.surcharge ?? 0) > 0 || (current?.surcharge ?? 0) > 0),
    },
    { label: "Income Tax", getValue: (column) => column?.incomeTax ?? 0 },
    { label: "Car Rental Deduction", getValue: (column) => column?.remainingCarRental ?? 0 },
    { label: "VPF", getValue: (column) => column?.vpf ?? 0 },
    { label: "Medical Insurance", getValue: (column) => column?.medicalInsurance ?? 0 },
    { label: "Loans and Advances", getValue: (column) => column?.loansAndAdvances ?? 0 },
    {
      label: "Employee Deduction (C)",
      getValue: (column) => column?.employeeDeduction ?? 0,
      emphasis: "deduction",
    },
    {
      label: "S. Total (A-C)",
      getValue: (column) => column?.netSalary ?? 0,
      emphasis: "subtotal",
    },
  ];

  return (
    <div className="space-y-4">
      {comparison?.warnings?.map((warning) => (
        <Alert key={warning}>{warning}</Alert>
      ))}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Particulars</TableHead>
            <TableHead className="text-right">Monthly Breakup-2025-26</TableHead>
            <TableHead className="text-right">Monthly Breakup-2026-27</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows
            .filter((row) =>
              row.shouldShow ? row.shouldShow(previousYear, currentYear) : true,
            )
            .map((row, index) => (
            <TableRow
              key={`${row.label}-${index}`}
              className={cn(
                row.emphasis === "subtotal" && "bg-secondary/35 font-semibold",
                row.emphasis === "deduction" && "bg-secondary/20 font-semibold",
              )}
            >
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell className="text-right">
                {previousYear
                  ? formatComparisonCurrency(row.getValue(previousYear))
                  : "\u2014"}
              </TableCell>
              <TableCell className="text-right">
                {currentYear
                  ? formatComparisonCurrency(row.getValue(currentYear))
                  : "\u2014"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ComparisonModule({
  form,
  setField,
  result,
  isPending,
}: {
  form: ComparisonInput;
  setField: <
    Y extends keyof ComparisonInput,
    K extends keyof ComparisonInput[Y],
  >(
    year: Y,
    field: K,
    value: ComparisonInput[Y][K],
  ) => void;
  result: ComparisonResponse | null;
  isPending: boolean;
}) {
  const previousYearBreakdown = result?.comparison.previousYear;
  const currentYearBreakdown = result?.comparison.currentYear;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-secondary/20 shadow-none">
          <CardHeader>
            <CardTitle>2025-26</CardTitle>
            <CardDescription>
              Separate previous-year rules apply here.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="comparePreviousAnnualCtc">Fixed annual CTC</Label>
              <Input
                id="comparePreviousAnnualCtc"
                type="number"
                min={0}
                value={form.previousYear.annualCtc || ""}
                onChange={(event) =>
                  setField("previousYear", "annualCtc", Number(event.target.value) || 0)
                }
                placeholder="Enter 2025-26 annual CTC"
              />
            </Field>

            <Field>
              <Label htmlFor="comparePreviousByodChoice">BYOD choice</Label>
              <Select
                id="comparePreviousByodChoice"
                value={form.previousYear.byodChoice}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "byodChoice",
                    event.target.value as ComparisonYearInput["byodChoice"],
                  )
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="comparePreviousNpsRate">NPS contribution</Label>
              <Select
                id="comparePreviousNpsRate"
                value={String(form.previousYear.npsRate)}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "npsRate",
                    Number(event.target.value) as ComparisonYearInput["npsRate"],
                  )
                }
              >
                <option value="0">No</option>
                <option value="10">Yes - 10%</option>
                <option value="14">Yes - 14%</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="comparePreviousCarRentalChoice">Car rental option</Label>
              <Select
                id="comparePreviousCarRentalChoice"
                value={form.previousYear.carRentalChoice}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "carRentalChoice",
                    event.target.value as ComparisonYearInput["carRentalChoice"],
                  )
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="comparePreviousCarRentalAmount">Car rental amount</Label>
              {previousYearBreakdown ? (
                <p className="text-xs text-muted-foreground">
                  Max {formatCurrency(previousYearBreakdown.maxCarRentalAllowed)}
                </p>
              ) : null}
              <Input
                id="comparePreviousCarRentalAmount"
                type="number"
                min={0}
                disabled={form.previousYear.carRentalChoice === "no"}
                value={form.previousYear.carRentalAmount || ""}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "carRentalAmount",
                    Number(event.target.value) || 0,
                  )
                }
                placeholder="Enter car rental amount"
              />
            </Field>

            <Field>
              <Label htmlFor="comparePreviousVpf">
                VPF amount
                {previousYearBreakdown ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Max {formatCurrency(previousYearBreakdown.maxVpfAllowed)}
                  </span>
                ) : null}
              </Label>
              <Input
                id="comparePreviousVpf"
                type="number"
                min={0}
                value={form.previousYear.vpfAmount || ""}
                onChange={(event) =>
                  setField("previousYear", "vpfAmount", Number(event.target.value) || 0)
                }
                placeholder="0"
              />
            </Field>

            <Field>
              <Label htmlFor="comparePreviousMedical">Medical insurance</Label>
              <Select
                id="comparePreviousMedical"
                value={form.previousYear.medicalInsuranceTier}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "medicalInsuranceTier",
                    event.target.value as ComparisonYearInput["medicalInsuranceTier"],
                  )
                }
              >
                <option value="none">No</option>
                <option value="oneMember">1 member - Rs. 833 / month</option>
                <option value="twoMembers">2 members - Rs. 1,667 / month</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="comparePreviousLoan">
                Loans and advances
                {previousYearBreakdown ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Max {formatCurrency(previousYearBreakdown.maxLoanAdvanceAllowed)}
                  </span>
                ) : null}
              </Label>
              <Input
                id="comparePreviousLoan"
                type="number"
                min={0}
                value={form.previousYear.loanAndAdvanceAmount || ""}
                onChange={(event) =>
                  setField(
                    "previousYear",
                    "loanAndAdvanceAmount",
                    Number(event.target.value) || 0,
                  )
                }
                placeholder="0"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/20 shadow-none">
          <CardHeader>
            <CardTitle>2026-27</CardTitle>
            <CardDescription>
              Current-year appraisal comparison inputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="compareCurrentAnnualCtc">Fixed annual CTC</Label>
              <Input
                id="compareCurrentAnnualCtc"
                type="number"
                min={0}
                value={form.currentYear.annualCtc || ""}
                onChange={(event) =>
                  setField("currentYear", "annualCtc", Number(event.target.value) || 0)
                }
                placeholder="Enter 2026-27 annual CTC"
              />
            </Field>

            <Field>
              <Label htmlFor="compareCurrentByodChoice">BYOD choice</Label>
              <Select
                id="compareCurrentByodChoice"
                value={form.currentYear.byodChoice}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "byodChoice",
                    event.target.value as ComparisonYearInput["byodChoice"],
                  )
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="compareCurrentPfMode">PF contribution</Label>
              <Select
                id="compareCurrentPfMode"
                value={form.currentYear.pfMode}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "pfMode",
                    event.target.value as ComparisonYearInput["pfMode"],
                  )
                }
              >
                <option value="fixed1800">Yes - Rs. 1,800</option>
                <option value="twelvePercent">Yes - 12% of basic</option>
                <option value="none">No</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="compareCurrentNpsRate">NPS contribution</Label>
              <Select
                id="compareCurrentNpsRate"
                value={String(form.currentYear.npsRate)}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "npsRate",
                    Number(event.target.value) as ComparisonYearInput["npsRate"],
                  )
                }
              >
                <option value="0">No</option>
                <option value="5">Yes - 5%</option>
                <option value="10">Yes - 10%</option>
                <option value="14">Yes - 14%</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="compareCurrentCarRentalChoice">Car rental option</Label>
              <Select
                id="compareCurrentCarRentalChoice"
                value={form.currentYear.carRentalChoice}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "carRentalChoice",
                    event.target.value as ComparisonYearInput["carRentalChoice"],
                  )
                }
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="compareCurrentCarRentalAmount">Car rental amount</Label>
              {currentYearBreakdown ? (
                <p className="text-xs text-muted-foreground">
                  Max {formatCurrency(currentYearBreakdown.maxCarRentalAllowed)}
                </p>
              ) : null}
              <Input
                id="compareCurrentCarRentalAmount"
                type="number"
                min={0}
                disabled={form.currentYear.carRentalChoice === "no"}
                value={form.currentYear.carRentalAmount || ""}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "carRentalAmount",
                    Number(event.target.value) || 0,
                  )
                }
                placeholder="Enter car rental amount"
              />
            </Field>

            <Field>
              <Label htmlFor="compareCurrentVpf">
                VPF amount
                {currentYearBreakdown ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Max {formatCurrency(currentYearBreakdown.maxVpfAllowed)}
                  </span>
                ) : null}
              </Label>
              <Input
                id="compareCurrentVpf"
                type="number"
                min={0}
                value={form.currentYear.vpfAmount || ""}
                onChange={(event) =>
                  setField("currentYear", "vpfAmount", Number(event.target.value) || 0)
                }
                placeholder="0"
              />
            </Field>

            <Field>
              <Label htmlFor="compareCurrentMedical">Medical insurance</Label>
              <Select
                id="compareCurrentMedical"
                value={form.currentYear.medicalInsuranceTier}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "medicalInsuranceTier",
                    event.target.value as ComparisonYearInput["medicalInsuranceTier"],
                  )
                }
              >
                <option value="none">No</option>
                <option value="oneMember">1 member - Rs. 833 / month</option>
                <option value="twoMembers">2 members - Rs. 1,667 / month</option>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="compareCurrentLoan">
                Loans and advances
                {currentYearBreakdown ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Max {formatCurrency(currentYearBreakdown.maxLoanAdvanceAllowed)}
                  </span>
                ) : null}
              </Label>
              <Input
                id="compareCurrentLoan"
                type="number"
                min={0}
                value={form.currentYear.loanAndAdvanceAmount || ""}
                onChange={(event) =>
                  setField(
                    "currentYear",
                    "loanAndAdvanceAmount",
                    Number(event.target.value) || 0,
                  )
                }
                placeholder="0"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">
          Recalculating comparison...
        </p>
      ) : null}

      <ComparisonCardTable result={result} />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: number | undefined;
  negative?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className={cn("font-medium", negative && "text-destructive")}>
        {label}
      </TableCell>
      <TableCell className={cn("text-right", negative && "font-semibold text-destructive")}>
        {typeof value === "number" ? formatCurrency(value) : formatCurrency(0)}
      </TableCell>
    </TableRow>
  );
}

function SalarySnapshot({
  title,
  items,
}: {
  title: string;
  items: Array<[string, number | undefined]>;
}) {
  return (
    <div className="rounded-3xl bg-secondary/35 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl bg-white/80 p-4",
              label.toLowerCase().includes("special allowance") &&
                typeof value === "number" &&
                value < 0 &&
                "border border-destructive/25 bg-destructive/10",
            )}
          >
            <p
              className={cn(
                "text-xs uppercase tracking-[0.16em] text-muted-foreground",
                label.toLowerCase().includes("special allowance") &&
                  typeof value === "number" &&
                  value < 0 &&
                  "text-destructive",
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "mt-2 text-lg font-semibold",
                label.toLowerCase().includes("special allowance") &&
                  typeof value === "number" &&
                  value < 0 &&
                  "text-destructive",
              )}
            >
              {typeof value === "number" ? formatCurrency(value) : formatCurrency(0)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-3xl border p-4",
        highlight
          ? "border-amber-200/60 bg-gradient-to-br from-amber-300 via-orange-300 to-amber-200 text-slate-950 shadow-2xl"
          : "border-white/10 bg-white/10",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          highlight ? "text-slate-950" : "text-accent-foreground",
        )}
      />
      <p
        className={cn(
          "mt-3 text-xs uppercase tracking-[0.16em]",
          highlight ? "text-slate-800/80" : "text-white/60",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 max-w-full font-semibold leading-tight tabular-nums",
          highlight
            ? "text-[clamp(1.6rem,2vw,2.35rem)] tracking-[-0.03em]"
            : "text-xl",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MiniPanel({
  icon: Icon,
  title,
  value,
  negative = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-white/85 p-4",
        negative && "border-destructive/30 bg-destructive/10",
      )}
    >
      <Icon className={cn("h-5 w-5 text-primary", negative && "text-destructive")} />
      <p
        className={cn(
          "mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground",
          negative && "text-destructive",
        )}
      >
        {title}
      </p>
      <p className={cn("mt-2 text-lg font-semibold", negative && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

function StepPill({
  active,
  index,
  title,
  description,
}: {
  active: boolean;
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition",
        active
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-secondary/20",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {index}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
