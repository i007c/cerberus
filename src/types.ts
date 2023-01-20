type Rating = 'questionable' | 'safe' | 'explicit'
type Mode = 'V' | 'O' | 'I' | 'Z' | 'C'

interface StateModel {
    tab: 'info' | 'content'
    slideshow: {
        speed: number
        running: boolean
        pos: number
    }
    page: number
    index: number
    post: PostModel | null
    posts: PostModel[]
    server: ServerModel
    mode: Mode
    autocomplete: string | null
    zoom: {
        level: number
        x: number
        y: number
        speed: number
    }
    favorite_list: number[]
    isLocal: boolean
    original: boolean
    end_page: boolean
    ActiveKeys: { [k: string]: string }
}

type ModeDataModel = {
    [k in Mode]: {
        // event: (e: KeyboardEvent) => void
        setup?: () => void
        clean?: () => void
    }
}

interface AutoCompleteTag {
    type: string
    name: string
    count: number
}

interface PostModel {
    type: 'image' | 'video'
    score: number
    file: string
    parent_id: number | null
    sample: string
    id: number
    has_children: boolean
    tags: string[]
    rating: Rating
    ext: string
}

type ServerModel = {
    name: string
    limit: number
    rating_table: { [k: string]: Rating }
    autocomplete: null | ((query: string) => Promise<AutoCompleteTag[]>)
    search: (tags: string, page: number) => Promise<PostModel[]>
    open_post: (post_id: string | number) => void
    sync_favs?: (local_favs: number[]) => Promise<number[]>
}

interface ActionModel {
    title: string
    description?: string
    func: ActionFunc
    // prevent_default?: false
    // stop_propagation?: false
}

type ActionFunc = (e: KeyboardEvent, args: unknown[]) => void
type ActionBind = string | [string, unknown]

export { StateModel, AutoCompleteTag, PostModel, Rating, ServerModel }
export { Mode, ModeDataModel, ActionFunc, ActionBind, ActionModel }
