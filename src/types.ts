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
}

type ModeDataModel = {
    [k in Mode]: {
        event: (e: KeyboardEvent) => void
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
}

interface ServerModel {
    rating_table: { [k: string]: Rating }
    autocomplete: null | ((query: string) => Promise<AutoCompleteTag[]>)
    search: (tags: string, page: number) => Promise<PostModel[]>
    open_post: (post_id: string | number) => void
}

export { StateModel, AutoCompleteTag, PostModel, Rating, ServerModel }
export { Mode, ModeDataModel }
