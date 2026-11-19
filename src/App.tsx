import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ConfiguracaoApiPage } from './pages/ConfiguracaoApiPage'
import { HistoricoPage } from './pages/HistoricoPage'
import { InicioPage } from './pages/InicioPage'
import { MeusDadosPage } from './pages/MeusDadosPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PerfilFormPage } from './pages/PerfilFormPage'
import { PerfisPage } from './pages/PerfisPage'
import { SobrePage } from './pages/SobrePage'
import { apiConfigurada } from './services/http'

function App() {
  if (!apiConfigurada()) return <ConfiguracaoApiPage />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="historico" element={<HistoricoPage />} />
          <Route path="perfis" element={<PerfisPage />} />
          <Route path="perfis/novo" element={<PerfilFormPage />} />
          <Route path="perfis/:id/editar" element={<PerfilFormPage />} />
          <Route path="meus-dados" element={<MeusDadosPage />} />
          <Route path="sobre" element={<SobrePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
