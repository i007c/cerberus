import { atom } from 'jotai'
import { GlobalModel } from 'state'

const Global = atom<GlobalModel>({
    tab: 'info',
    favorite_list: [],
    mode: 'V',
    end_page: false,
    sort_score: false,
    original: false,
    isLocal: false,
    isFullScreen: false,
    showOverlayInfo: false,
    showOverlayInfoTags: false,
})

const GlobalAtom = atom(
    get => get(Global),
    (get, set, args: Partial<GlobalModel>) => {
        set(Global, { ...get(Global), ...args })
    }
)

const ActiveActionAtom = atom('')

export { GlobalAtom, ActiveActionAtom }
