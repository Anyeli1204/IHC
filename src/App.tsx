import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { CaseListPage } from './pages/cases/CaseListPage'
import { CaseWizardPage } from './pages/cases/CaseWizardPage'
import { CaseSummaryPage } from './pages/cases/CaseSummaryPage'
import { CaseEditPage } from './pages/cases/CaseEditPage'
import { CaseProgressPage } from './pages/cases/CaseProgressPage'
import { NotarialListPage } from './pages/notarial/NotarialListPage'
import { NotarialWizardPage } from './pages/notarial/NotarialWizardPage'
import { NotarialDetailPage } from './pages/notarial/NotarialDetailPage'
import { AgendaPage } from './pages/agenda/AgendaPage'
import { ActivityFormPage } from './pages/agenda/ActivityFormPage'
import { SyncPage } from './pages/SyncPage'
import { HelpHubPage } from './pages/help/HelpHubPage'
import { HelpTopicPage } from './pages/help/HelpTopicPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'casos',
        children: [
          { index: true, element: <CaseListPage /> },
          { path: 'nuevo', element: <CaseWizardPage /> },
          { path: ':id/editar', element: <CaseEditPage /> },
          { path: ':id/avance', element: <CaseProgressPage /> },
          { path: ':id', element: <CaseSummaryPage /> },
        ],
      },
      {
        path: 'actuaciones',
        children: [
          { index: true, element: <NotarialListPage /> },
          { path: 'nueva', element: <NotarialWizardPage /> },
          { path: ':id/editar', element: <NotarialWizardPage /> },
          { path: ':id', element: <NotarialDetailPage /> },
        ],
      },
      {
        path: 'agenda',
        children: [
          { index: true, element: <AgendaPage /> },
          { path: 'nueva', element: <ActivityFormPage /> },
          { path: ':id/editar', element: <ActivityFormPage /> },
        ],
      },
      { path: 'sincronizar', element: <SyncPage /> },
      { path: 'ayuda/:slug', element: <HelpTopicPage /> },
      { path: 'ayuda', element: <HelpHubPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}

