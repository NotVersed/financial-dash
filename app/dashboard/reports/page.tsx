import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Download, FileSpreadsheet } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Export client data for grant reporting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Client Progress Report</CardTitle>
                <CardDescription>All client financial data as CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Exports credit scores, net income, net worth, and savings milestones for all clients.
            </p>
            <a
              href="/api/reports/csv"
              className="flex items-center justify-center gap-2 w-full h-10 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base">Grant Summary Report</CardTitle>
                <CardDescription>Summary report for grant submissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Generates a formatted PDF report with program outcomes and client progress metrics.
            </p>
            <a
              href="/api/reports/pdf"
              className="flex items-center justify-center gap-2 w-full h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Exports</CardTitle>
            <CardDescription>Your last generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">No reports generated yet. Export a report above to get started.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
