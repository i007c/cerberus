import { PostModel, ServerModel } from 'state'

type Mode = 'V' | 'O' | 'I' | 'Z' | 'C'
type General = {
    mode: Mode
    favorite_list: number[]
    end_page: boolean
    original: boolean
    sort_score: boolean
    isLocal: boolean
    page: number
    index: number
    posts: PostModel[]
    server: ServerModel
}
export { General as GeneralModel, Mode }
