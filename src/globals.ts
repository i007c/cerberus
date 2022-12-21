import { rule34, yandere } from 'servers'
import { StateModel } from 'types'

var State: StateModel = {
    tab: 'info',
    tags: [],
    slideshow: {
        speed: 7,
        running: false,
        pos: 0,
    },
    page: 0,
    index: 0,
    post: null,
    posts: [],
    server: rule34,
    mode: 'V',
}

const SERVERS = {
    rule34: rule34,
    yandere: yandere,
    danbooru: rule34,
    gelbooru: rule34,
}

export { State, SERVERS }
