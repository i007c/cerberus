import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import './style/index.scss'

import Content from 'layout/Content'
import Info from 'layout/Info'

const App: FC = () => {
    return (
        <>
            <Content />
            <Info />
        </>
    )
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
