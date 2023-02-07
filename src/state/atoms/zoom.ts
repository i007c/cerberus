import { atom } from 'jotai'
import { get_data, SetArgs, ZoomModel } from 'state'

const Zoom = atom<ZoomModel>({
    level: 10,
    x: 1,
    y: 1,
    speed: 10,
})

const ZoomAtom = atom(
    get => get(Zoom),
    (get, set, args: SetArgs<ZoomModel>) => {
        set(Zoom, get_data(args, get(Zoom)))
    }
)

export { ZoomAtom }
