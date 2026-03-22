# Salary Calculator

This is a Next.js salary calculator web app for Indian payroll structures. It uses:

- Next.js for frontend and backend
- App Router with an API route for calculation logic
- Tailwind CSS
- shadcn-style UI components inside `components/ui`

## Project structure

- `/app` contains routes, layout, and the backend API route
- `/components/salary` contains the calculator UI
- `/components/ui` contains reusable shadcn-style components
- `/lib/salary/calculator.ts` contains the core salary engine

## Step-by-step setup with shadcn

1. Create the Next.js app.

```bash
npx create-next-app@latest salary-calculator --typescript --tailwind --eslint --app
```

2. Move into the project.

```bash
cd salary-calculator
```

3. Initialize shadcn.

```bash
npx shadcn@latest init
```

4. Pick the app settings when prompted.

- Style: `Default`
- Base color: choose your preferred color
- Components path: `components`
- Utils path: `lib/utils.ts`
- CSS file: `app/globals.css`
- React Server Components: `Yes`

5. Add the UI components you need.

```bash
npx shadcn@latest add button card input label select table toast alert
```

6. Install dependencies.

```bash
npm install
```

7. Start the app.

```bash
npm run dev
```

## Formula notes used in this implementation

- Monthly CTC = `ceil(fixed annual CTC / 12)`
- Basic = `max(50% of monthly CTC, 17000)`
- HRA = `40% of basic`
- LTA = `10% of basic`
- Bonus = `8.33% of basic` when annual CTC is below `504000` or basic is below `21000`
- Gratuity = `4.81% of basic`
- BYOD = `1500` when selected
- Car perks = `1800` when selected
- Car rental is capped at `70%` of special allowance before car rental
- Tax slabs follow the image you shared:
  - `0 - 4,00,000`: 0%
  - `4,00,001 - 8,00,000`: 5%
  - `8,00,001 - 12,00,000`: 10%
  - `12,00,001 - 16,00,000`: 15%
  - `16,00,001 - 20,00,000`: 20%
  - `20,00,001 - 24,00,000`: 25%
  - `24,00,001+`: 30%
- If net taxable income is `12,00,000` or below, tax is treated as zero
- Education cess = `4%` of annual income tax
- Professional tax = `2500 / 12` monthly when selected

## Important assumptions

- The workbook and written instructions conflict slightly on bonus and car-rental handling. This implementation follows your written rule for bonus and treats car rental as the total monthly amount, with `1800` carved out first when car perks are enabled.
- VPF, medical insurance, and loans/advances reduce special allowance before final gross salary and tax are calculated.
- Negative special allowance is blocked and surfaced to the user through visible warnings and toast messages.

## Run locally

```bash
npm install
npm run dev
```
