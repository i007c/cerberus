import { PostModel, ServerModel } from 'state'

type Mode = 'V' | 'O' | 'I' | 'Z' | 'C'
type General = {
    mode: Mode
    favorite_list: PostModel[]
    end_page: boolean
    original: boolean
    sort_score: boolean
    page: number
    index: number
    posts: PostModel[]
    server: ServerModel
    tags: string[]
}
export { General as GeneralModel, Mode }
