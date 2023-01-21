type PostState = {
    page: number
    index: number
    post: Post
    posts: Post[]
    server: ServerModel
    autocomplete: string | null
}

export { PostState as PostStateModel }
