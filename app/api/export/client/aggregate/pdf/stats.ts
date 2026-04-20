export function computeStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mid = Math.floor(sorted.length / 2)
  return {
    mean: sum / sorted.length,
    median: sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

export function buildStats(data: any[]) {
  return {
    creditScore:     computeStats(data.map(c => Number(c.current_credit_score)).filter(Boolean)),
    goalCreditScore: computeStats(data.map(c => Number(c.goal_credit_score)).filter(Boolean)),
    netWorth:        computeStats(data.map(c => Number(c.current_net_worth)).filter(Boolean)),
    goalNetWorth:    computeStats(data.map(c => Number(c.goal_net_worth)).filter(Boolean)),
    netIncome:       computeStats(data.map(c => Number(c.current_net_income)).filter(Boolean)),
    goalNetIncome:   computeStats(data.map(c => Number(c.goal_net_income)).filter(Boolean)),
  }
}