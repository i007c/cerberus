import { atom } from 'jotai'
import { SlideShowModel } from 'state'

const SlideShow = atom<SlideShowModel>({
    speed: 7,
    running: false,
    pos: 0,
})

const SlideShowAtom = atom(
    get => get(SlideShow),
    (get, set, args: Partial<SlideShowModel>) => {
        set(SlideShow, { ...get(SlideShow), ...args })
    }
)

export { SlideShowAtom }
