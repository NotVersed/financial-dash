import { Suspense } from 'react'
import { LoginContent } from './loginContent'

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginContent />
    </Suspense>
  )
}