import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'

import { KeyBinding } from 'KeyBinding'
import Content from 'layout/Content'
import Info from 'layout/Info'

import './style/index.scss'

const App: FC = () => {
    return (
        <>
            <Content />
            <Info />
            <KeyBinding />
        </>
    )
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
