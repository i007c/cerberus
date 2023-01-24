import { yandere } from 'servers'

import { atom } from 'jotai'
import { GeneralModel } from 'state'

const DEFAULT_VALUE: GeneralModel = {
    favorite_list: [],
    mode: 'V',
    end_page: false,
    sort_score: false,
    original: false,
    isLocal: false,
    page: 0,
    index: 0,
    posts: [],
    server: yandere,
}

const General = atom<GeneralModel>(DEFAULT_VALUE)
global.general = DEFAULT_VALUE

const GeneralAtom = atom(
    get => get(General),
    (get, set, args: Partial<GeneralModel>) => {
        set(General, { ...get(General), ...args })
    }
)

export { GeneralAtom }
