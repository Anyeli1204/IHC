import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { CaseListPage } from './pages/cases/CaseListPage'
import { CaseWizardPage } from './pages/cases/CaseWizardPage'
import { CaseDetailPage } from './pages/cases/CaseDetailPage'
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
      /* Casos: rutas estáticas antes de :id */
      { path: 'casos/nuevo', element: <CaseWizardPage /> },
      { path: 'casos/:id/editar', element: <CaseEditPage /> },
      { path: 'casos/:id/avance', element: <CaseProgressPage /> },
      { path: 'casos/:id', element: <CaseDetailPage /> },
      { path: 'casos', element: <CaseListPage /> },
      /* Actuaciones */
      { path: 'actuaciones/nueva', element: <NotarialWizardPage /> },
      { path: 'actuaciones/:id', element: <NotarialDetailPage /> },
      { path: 'actuaciones', element: <NotarialListPage /> },
      /* Agenda */
      { path: 'agenda/nueva', element: <ActivityFormPage /> },
      { path: 'agenda/:id/editar', element: <ActivityFormPage /> },
      { path: 'agenda', element: <AgendaPage /> },
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

