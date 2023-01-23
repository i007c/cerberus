type Rating = 'questionable' | 'safe' | 'explicit'

type Post = {
    type: 'image' | 'video' | 'gif'
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
}

type AutoCompleteTag = {
    type: string
    name: string
    count: number
}

type Server = {
    name: string
    limit: number
    autocomplete: null | ((query: string) => Promise<AutoCompleteTag[]>)
    search: (tags: string, page: number) => Promise<Post[]>
}

type Posts = {
    page: number
    index: number

    posts: Post[]
    server: Server
    autocomplete: string | null
}

export {
    Posts as PostsModel,
    Post as PostModel,
    Rating,
    Server as ServerModel,
    AutoCompleteTag,
}
