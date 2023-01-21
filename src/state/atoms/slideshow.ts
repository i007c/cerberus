import { atom } from 'jotai'
import { SlideshowStateModel } from 'state'

const Slideshow = atom<SlideshowStateModel>({
    speed: 7,
    running: false,
    pos: 0,
})

const SlideshowAtom = atom(
    get => get(Slideshow),
    (get, set, args: Partial<SlideshowStateModel>) => {
        set(Slideshow, { ...get(Slideshow), ...args })
    }
)

export { SlideshowAtom }
