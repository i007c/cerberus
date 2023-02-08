import { is_favorite } from 'utils'

import { atom } from 'jotai'
import {
    AutoCompleteModel,
    GeneralAtom,
    get_data,
    PostModel,
    SetArgs,
} from 'state'

const DEFAULT_POST: PostModel = {
    type: 'null',
    id: 0,
    has_children: false,
    tags: [],
    rating: 'safe',
    ext: '',
    score: -1,
    file: '',
    sample: '',
    link: '',
}

const Post = atom<PostModel>(DEFAULT_POST)

const PostAtom = atom(
    get => get(Post),
    async (get, set, args: SetArgs<PostModel>) => {
        const state = get(Post)
        const data = await get_data(args, state)

        if (state.type === 'null' && data.type === 'null') {
            // dont do anything
            return
        }

        if (state.id !== data.id) {
            const general = get(GeneralAtom)
            data.is_favorite = is_favorite(general, data.id)
        }

        set(Post, data)
    }
)

const DEFAULT_AC = {
    tags: [],
    query: '',
    regQuery: new RegExp(''),
    index: 0,
}

const AutoComplete = atom<AutoCompleteModel>(DEFAULT_AC)

const AutoCompleteAtom = atom(
    get => get(AutoComplete),
    async (get, set, args: SetArgs<AutoCompleteModel>) => {
        let data = await get_data(args, get(AutoComplete))
        data.index = 0

        set(AutoComplete, data)
    }
)

export { AutoCompleteAtom, PostAtom }
