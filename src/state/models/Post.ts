type Rating = 'questionable' | 'safe' | 'explicit'

type Post = {
    type: 'image' | 'video' | 'null'
    id: number
    parent?: number
    has_children: boolean
    tags: string[]
    rating: Rating
    ext: string
    score: number
    file: string
    sample: string
    link: string
    force_original?: boolean
    is_favorite?: boolean
    width?: number
    height?: number
}

type AutoCompleteTag = {
    type: string
    name: string
    count: number
}

type AutoComplete = {
    tags: AutoCompleteTag[]
    query: string
    regQuery: RegExp
    index: number
}

type Server = {
    sort_score: string
    name: string
    limit: number
    autocomplete: null | ((query: string) => Promise<AutoCompleteTag[]>)
    search: (tags: string, page: number) => Promise<Post[]>
    open_tags: (tags: string) => void
}

export {
    Post as PostModel,
    Rating,
    Server as ServerModel,
    AutoCompleteTag,
    AutoComplete as AutoCompleteModel,
}
