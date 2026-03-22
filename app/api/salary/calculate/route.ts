import { NextResponse } from "next/server";

import { calculateSalary } from "@/lib/salary/calculator";
import { defaultSalaryInput } from "@/lib/salary/defaults";
import type { SalaryInput } from "@/lib/salary/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SalaryInput>;
    const result = calculateSalary({
      ...defaultSalaryInput,
      ...body,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        errors: ["Unable to calculate salary. Please check the request payload."],
      },
      { status: 400 },
    );
  }
}
