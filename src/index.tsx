import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import './style/index.scss'

const App: FC = () => {
    return <div>gg</div>
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
