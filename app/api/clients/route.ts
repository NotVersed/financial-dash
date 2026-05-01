import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_TABLE_NAME,
  normalizeClient,
  METRICS_TABLE_NAME,
} from '@/app/dashboard/clients/dataInformation'

/**
 * Shape returned by SQL function get_latest_client_metrics
 * Must match your Postgres function output exactly.
 */
type LatestClientMetricRow = {
  client_id: number
  net_income: number | null
  net_worth: number | null
  credit_score: number | null
}

/**
 * GET /api/clients
 * Returns clients + latest financial state (derived from metrics table)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // -------------------------
    // 1. Fetch clients
    // -------------------------
    const { data: clients, error: clientError } = await supabase
      .from(CLIENT_TABLE_NAME)
      .select('*')
      .order('last_name', { ascending: true })

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // -------------------------
    // 2. Fetch latest metrics per client via RPC
    // -------------------------
    const { data: metrics, error: metricsError } = await supabase.rpc(
      'get_latest_client_metrics'
    ) as { data: LatestClientMetricRow[] | null; error: any }

    if (metricsError) {
      return NextResponse.json({ error: metricsError.message }, { status: 500 })
    }

    const latestByClient = new Map<number, LatestClientMetricRow>()

    for (const row of metrics ?? []) {
      latestByClient.set(row.client_id, row)
    }

    // -------------------------
    // 3. Merge clients + latest metrics
    // -------------------------
    const enrichedClients = (clients ?? []).map((c: any) => {
      const normalizedClientId = Number(c.client_id ?? c.id)
      const latest = latestByClient.get(normalizedClientId)

      return normalizeClient({
        ...c,
        current_net_income: latest?.net_income ?? null,
        current_net_worth: latest?.net_worth ?? null,
        current_credit_score: latest?.credit_score ?? null,
      })
    })

    return NextResponse.json({
      clients: enrichedClients,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 * Creates a client AND optionally inserts initial financial metrics
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const {
      first_name,
      last_name,
      email,
      status,
      current_net_income,
      current_net_worth,
      current_credit_score,
    } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    // -------------------------
    // 1. Insert client
    // -------------------------
    const { data: client, error: clientError } = await supabase
      .from(CLIENT_TABLE_NAME)
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          status: status ?? 'active',
        },
      ])
      .select()
      .single()

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // -------------------------
    // 2. Insert initial metrics (if provided)
    // -------------------------
    const hasMetrics =
      current_net_income != null ||
      current_net_worth != null ||
      current_credit_score != null

    if (hasMetrics) {
      const insertedClientId = Number(client.client_id ?? client.id)

      const { error: metricsError } = await supabase
        .from(METRICS_TABLE_NAME)
        .insert([
          {
            client_id: insertedClientId,
            net_income: current_net_income ?? null,
            net_worth: current_net_worth ?? null,
            credit_score: current_credit_score ?? null,
            measurement_date: new Date().toISOString(),
          },
        ])

      if (metricsError) {
        return NextResponse.json(
          { error: metricsError.message },
          { status: 500 }
        )
      }
    }

    // -------------------------
    // 3. Return merged response
    // -------------------------
    return NextResponse.json(
      {
        client: normalizeClient({
          ...client,
          current_net_income: current_net_income ?? null,
          current_net_worth: current_net_worth ?? null,
          current_credit_score: current_credit_score ?? null,
        }),
      },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}