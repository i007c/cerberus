import { yandere } from 'servers'

import { atom } from 'jotai'
import { GeneralModel, get_data, SetArgs } from 'state'

const DEFAULT_VALUE: GeneralModel = {
    favorite_list: [],
    mode: 'V',
    end_page: false,
    sort_score: false,
    original: false,
    page: 0,
    index: 0,
    posts: [],
    server: yandere,
}

const General = atom<GeneralModel>(DEFAULT_VALUE)

const GeneralAtom = atom(
    get => get(General),
    async (get, set, args: SetArgs<GeneralModel>) => {
        set(General, await get_data(args, get(General)))
    }
)

export { GeneralAtom }
