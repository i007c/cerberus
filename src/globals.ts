import { realbooru, rule34, yandere } from 'servers'
import { StateModel } from 'types'

var State: StateModel = {
    tab: 'info',
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
    autocomplete: null,
    zoom: {
        level: 1,
        x: 1,
        y: 1,
        speed: 10,
    },
}

const SERVERS = {
    rule34: rule34,
    yandere: yandere,
    danbooru: rule34,
    gelbooru: rule34,
    realbooru: realbooru,
}

export { State, SERVERS }
