import { atom } from 'jotai'
import { ZoomStateModel } from 'state'

const Zoom = atom<ZoomStateModel>({
    level: 10,
    x: 1,
    y: 1,
    speed: 10,
})

const ZoomAtom = atom(
    get => get(Zoom),
    (get, set, args: Partial<ZoomStateModel>) => {
        set(Zoom, { ...get(Zoom), ...args })
    }
)

export { ZoomAtom }
