import { atom } from 'jotai'
import { AutoCompleteModel, PostModel } from 'state'

const Post = atom<PostModel | null>(null)
global.Post = null

const PostAtom = atom(
    get => get(Post),
    (_, set, args: PostModel | null) => {
        if (args !== null)
            args.is_favorite = general.favorite_list.includes(args.id)
        set(Post, args)
    }
)

const DEFAULT_VALUE = {
    tags: [],
    query: '',
    regQuery: new RegExp(''),
    index: 0,
}

const AutoComplete = atom<AutoCompleteModel>(DEFAULT_VALUE)
global.AutoComplete = DEFAULT_VALUE

const AutoCompleteAtom = atom(
    get => get(AutoComplete),
    (get, set, args: Partial<AutoCompleteModel>) => {
        args.index = 0
        set(AutoComplete, { ...get(AutoComplete), ...args })
    }
)

export { AutoCompleteAtom, PostAtom }
