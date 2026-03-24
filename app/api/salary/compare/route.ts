import { NextResponse } from "next/server";

import { calculateSalaryComparison } from "@/lib/salary/calculator";
import { defaultComparisonInput } from "@/lib/salary/defaults";
import type { ComparisonInput } from "@/lib/salary/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ComparisonInput>;
    const result = calculateSalaryComparison({
      ...defaultComparisonInput,
      ...body,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        errors: ["Unable to calculate salary comparison. Please check the request payload."],
      },
      { status: 400 },
    );
  }
}
