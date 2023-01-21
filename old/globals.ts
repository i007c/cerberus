import { gelbooru, realbooru, rule34, yandere } from 'servers'
import { StateModel } from 'types'

const EMPTY_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+Q8AAQ0BBYgRfXMAAAAASUVORK5CYII='

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
        level: 10,
        x: 1,
        y: 1,
        speed: 10,
    },
    favorite_list: [],
    isLocal: false,
    original: false,
    end_page: false,
    ActiveKeys: {},
}

const SERVERS = {
    rule34: rule34,
    yandere: yandere,
    danbooru: rule34,
    gelbooru: gelbooru,
    realbooru: realbooru,
}

export { State, SERVERS, EMPTY_IMAGE }