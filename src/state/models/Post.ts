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
}

export { Post as PostModel, Rating }
