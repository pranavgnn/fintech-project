import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout'
import { Spinner } from '@/components/ui/spinner'

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Offers = lazy(() => import('@/pages/offers'))
const Customers = lazy(() => import('@/pages/customers'))
const CustomerDetail = lazy(() => import('@/pages/customers/detail'))
const Accounts = lazy(() => import('@/pages/accounts'))
const CreateAccount = lazy(() => import('@/pages/accounts/create'))
const AssignAccount = lazy(() => import('@/pages/accounts/assign'))
const AccountDetail = lazy(() => import('@/pages/accounts/detail'))
const EditAccount = lazy(() => import('@/pages/accounts/edit'))
const NotFound = lazy(() => import('@/pages/not-found'))

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/offers" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <Offers />
            </Suspense>
          } />
          <Route path="/customers" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <Customers />
            </Suspense>
          } />
          <Route path="/customers/:id" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <CustomerDetail />
            </Suspense>
          } />
          <Route path="/accounts" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <Accounts />
            </Suspense>
          } />
          <Route path="/accounts/create" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <CreateAccount />
            </Suspense>
          } />
          <Route path="/accounts/assign" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <AssignAccount />
            </Suspense>
          } />
          <Route path="/accounts/:id/edit" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <EditAccount />
            </Suspense>
          } />
          <Route path="/accounts/:id" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <AccountDetail />
            </Suspense>
          } />
          <Route path="*" element={
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
              <NotFound />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
