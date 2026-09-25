import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { registerServiceWorker } from './lib/registerServiceWorker'
import { TapList } from './TapList'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TapList />
  </StrictMode>,
)
