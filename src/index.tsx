import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import './style/index.scss'

import Info from 'layout/info'

const App: FC = () => {
    return (
        <>
            <Info />
        </>
    )
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
