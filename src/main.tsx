import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarPreferencias, lerPreferencias } from './services/preferencias'

// Aplica tema e tamanho do texto antes de desenhar, para a tela não piscar.
aplicarPreferencias(lerPreferencias())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
