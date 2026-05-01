import { NextResponse } from 'next/server'
import { createClient } from '@/app/api/server/serverClient'

type ClientRow = {
  clientId?: string
  first_name: string
  last_name: string
  email: string
  client_dob: string
  goal_credit_score: string
  goal_net_worth: string
  goal_net_income: string
  created?: string
  last_updated?: string
}

function parseCSV(text: string): ClientRow[] {
  const lines = text.trim().replace(/\r/g, '').split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
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

      if (!row.first_name || !row.last_name || !row.email) {
        errors.push(`Row ${rowNumber}: first_name, last_name, and email are required.`)
        continue
      }

      if (!isValidEmail(row.email)) {
        errors.push(`Row ${rowNumber}: invalid email "${row.email}".`)
        continue
      }

      // Normalize numeric fields safely
      const credit = Number(row.goal_credit_score)
      const netWorth = Number(row.goal_net_worth)
      const netIncome = Number(row.goal_net_income)

      const insertPayload = {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        client_dob: row.client_dob || null,

        goal_credit_score: Number.isFinite(credit) ? credit : null,
        goal_net_worth: Number.isFinite(netWorth) ? netWorth : null,
        goal_net_income: Number.isFinite(netIncome) ? netIncome : null,
      }

      const { error: insertError } = await supabase
        .from('clients')
        .insert(insertPayload)
        .select()

      if (insertError) {
        console.error(`Insert error row ${rowNumber}:`, insertError)
        errors.push(`Row ${rowNumber}: ${insertError.message}`)
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
    console.error('CSV import fatal error:', error)
    return NextResponse.json({ error: 'Server error during CSV import.' }, { status: 500 })
  }
}