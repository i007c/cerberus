import React, { FC, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { get_action, KeyBinds } from 'keybinding'
import Content from 'layout/Content'
import Info from 'layout/Info'

import { useAtom } from 'jotai'
import { GlobalAtom, PostAtom, SlideshowAtom, ZoomAtom } from 'state'

import './style/index.scss'

const B2B = (bool: boolean) => (bool ? '1' : '0')

const App: FC = () => {
    // const setActiveAction = useSetAtom(ActiveActionAtom)

    const [PS, setPS] = useAtom(PostAtom)
    global.PostState = PS
    global.setPostState = setPS

    const [ZS, setZS] = useAtom(ZoomAtom)
    global.ZoomState = ZS
    global.setZoomState = setZS

    const [GlobalState, setGS] = useAtom(GlobalAtom)
    global.GlobalState = GlobalState
    global.setGlobalState = setGS

    const [SS, setSS] = useAtom(SlideshowAtom)
    global.SlideshowState = SS
    global.setSlideshowState = setSS

    useEffect(() => {
        global.ActiveKeys = {}

        document.addEventListener('keydown', e => {
            ActiveKeys[e.code] =
                `${e.code}-${B2B(e.altKey)}-` +
                `${B2B(e.ctrlKey)}-${B2B(e.metaKey)}-${B2B(e.shiftKey)}`

            Object.values(ActiveKeys).forEach(key => {
                const [amode, margs] = get_action(
                    KeyBinds[`${GlobalState.mode}-${key}`]
                )
                if (amode) amode.func(e, margs)

                const [action_glob, gargs] = get_action(KeyBinds[`*-${key}`])
                if (action_glob) action_glob.func(e, gargs)

                if (action_glob || amode) {
                    e.preventDefault()
                    e.stopPropagation()
                    e.stopImmediatePropagation()
                }
            })
        })

        document.addEventListener('keyup', e => {
            delete ActiveKeys[e.code]
        })
    }, [])

    return (
        <>
            <Content />
            <Info />
        </>
    )
}

const container = document.getElementById('root')!

createRoot(container).render(<App />)
