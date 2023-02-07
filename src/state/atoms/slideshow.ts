import { atom } from 'jotai'
import { get_data, SetArgs, SlideShowModel } from 'state'

const DEFAULT_VALUE: SlideShowModel = {
    speed: 7,
    running: false,
    pos: 0,
}

const SlideShow = atom<SlideShowModel>(DEFAULT_VALUE)

const SlideShowAtom = atom(
    get => get(SlideShow),
    (get, set, args: SetArgs<SlideShowModel>) => {
        set(SlideShow, get_data(args, get(SlideShow)))
    }
)

export { SlideShowAtom }
