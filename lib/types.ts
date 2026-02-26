export type Client = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  enrollment_date: string
  program_type: 'credit_builder' | 'financial_coaching' | 'loan_program'
  status: 'active' | 'completed' | 'inactive'
  created_at: string
  updated_at: string
}

export type FinancialMetric = {
  id: string
  client_id: string
  metric_date: string
  credit_score: number | null
  monthly_income: number | null
  total_savings: number | null
  total_debt: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type LoanParticipation = {
  id: string
  client_id: string
  loan_type: 'microenterprise' | 'emergency' | 'home_improvement'
  loan_amount: number
  disbursement_date: string
  repayment_status: 'active' | 'paid_off' | 'defaulted'
  amount_repaid: number
  created_at: string
  updated_at: string
}

export type Milestone = {
  id: string
  client_id: string
  milestone_type: 'credit_score_increase' | 'income_increase' | 'savings_goal' | 'debt_reduction'
  description: string
  achieved_date: string
  metric_value: number | null
  created_at: string
}

export type DashboardStats = {
  totalClients: number
  activeClients: number
  avgCreditScoreChange: number
  totalLoansAmount: number
  totalLoansCount: number
  clientsWithSavingsGoals: number
}
