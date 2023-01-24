import { atom } from 'jotai'
import { SlideShowModel } from 'state'

const DEFAULT_VALUE: SlideShowModel = {
    speed: 7,
    running: false,
    pos: 0,
}

const SlideShow = atom<SlideShowModel>(DEFAULT_VALUE)
global.SlideShow = DEFAULT_VALUE

const SlideShowAtom = atom(
    get => get(SlideShow),
    (get, set, args: Partial<SlideShowModel>) => {
        set(SlideShow, { ...get(SlideShow), ...args })
    }
)

export { SlideShowAtom }
