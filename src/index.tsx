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

global.general = {
    tab: 'info',
    favorite_list: [],
    mode: 'V',
    end_page: false,
    sort_score: false,
    original: false,
    isLocal: false,
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
