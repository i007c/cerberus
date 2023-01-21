import {
    GlobalModel,
    PostStateModel,
    SlideshowStateModel,
    ZoomStateModel,
} from 'state'

declare global {
    var ActiveKeys: { [k: string]: string }

    var PostState: PostStateModel
    var setPostState: (update: Partial<PostStateModel>) => void

    var ZoomState: ZoomStateModel
    var setZoomState: (update: Partial<ZoomStateModel>) => void

    var GlobalState: GlobalModel
    var setGlobalState: (update: Partial<GlobalModel>) => void

    var SlideshowState: SlideshowStateModel
    var setSlideshowState: (update: Partial<SlideshowStateModel>) => void

    type ActionModel = {
        title: string
        description?: string
        func: ActionFunc
    }
    type ActionArg = string | number | boolean
    type ActionFunc = (e: KeyboardEvent, args: ActionArg[]) => void
    type ActionBind = string | [string, ActionArg | ArgActionArg[]]

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

    type AutoCompleteTag = {
        type: string
        name: string
        count: number
    }

    type ServerModel = {
        name: string
        limit: number
        rating_table: { [k: string]: Rating }
        autocomplete: null | ((query: string) => Promise<AutoCompleteTag[]>)
        search: (tags: string, page: number) => Promise<Post[]>
        open_post: (post_id: string | number) => void
    }
}
