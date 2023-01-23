import { PostModel, PostsModel, SlideShowModel } from 'state'

declare global {
    var ClearActiveKeys: CustomEvent<{}>

    type Mode = 'V' | 'O' | 'I' | 'Z' | 'C'
    var general: {
        tab: 'info' | 'content'
        mode: Mode
        favorite_list: number[]
        end_page: boolean
        original: boolean
        sort_score: boolean
        isLocal: boolean
    }

    var Post: PostModel | null
    var Posts: PostsModel
    var SlideShow: SlideShowModel
}

export {}
