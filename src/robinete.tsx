import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TapList } from './TapList'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TapList />
  </StrictMode>,
)
