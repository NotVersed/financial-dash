import { NextResponse } from 'next/server'
import { createClient } from '@/app/api/server/serverClient'

type ClientRow = {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  currentCreditScore: string
  currentNetWorth: string
  currentNetIncome: string
  goalCreditScore: string
  goalNetWorth: string
  goalNetIncome: string
}

function parseCSV(text: string): ClientRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    return row as ClientRow
  })
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No CSV file uploaded.' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only .csv files are allowed.' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or invalid.' }, { status: 400 })
    }

    const supabase = await createClient()

    let importedCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2

      if (!row.firstName || !row.lastName || !row.email) {
        errors.push(`Row ${rowNumber}: firstName, lastName, and email are required.`)
        continue
      }

      if (!isValidEmail(row.email)) {
        errors.push(`Row ${rowNumber}: invalid email "${row.email}".`)
        continue
      }

      const { data: existingClient, error: lookupError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', row.email)
        .maybeSingle()

      if (lookupError) {
        errors.push(`Row ${rowNumber}: database lookup failed.`)
        continue
      }

      if (existingClient) {
        errors.push(`Row ${rowNumber}: email "${row.email}" already exists.`)
        continue
      }

      const insertPayload = {
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email,
        date_of_birth: row.dateOfBirth || null,
        current_credit_score: row.currentCreditScore ? Number(row.currentCreditScore) : null,
        current_net_worth: row.currentNetWorth ? Number(row.currentNetWorth) : null,
        current_net_income: row.currentNetIncome ? Number(row.currentNetIncome) : null,
        goal_credit_score: row.goalCreditScore ? Number(row.goalCreditScore) : null,
        goal_net_worth: row.goalNetWorth ? Number(row.goalNetWorth) : null,
        goal_net_income: row.goalNetIncome ? Number(row.goalNetIncome) : null,
      }

      const { error: insertError } = await supabase.from('clients').insert(insertPayload)

      if (insertError) {
        errors.push(`Row ${rowNumber}: failed to insert client "${row.email}".`)
        continue
      }

      importedCount++
    }

    return NextResponse.json({
      message: 'CSV import completed.',
      importedCount,
      failedCount: errors.length,
      errors,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error during CSV import.' }, { status: 500 })
  }
}