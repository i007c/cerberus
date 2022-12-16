import { rule34, yandere } from 'servers'
import { CRT_Model } from 'types'

var CRT: CRT_Model = {
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
    server: null,
}

const SERVERS = {
    rule34: rule34,
    yandere: yandere,
    danbooru: rule34,
    gelbooru: rule34,
}

// var CRT_ITEM = null
// var CRT_SITE = yandere
// var CONTENT_LIST = []

// var tags_container = info.querySelector('div.tags')

// var overlay_info_parent = overlay_info.querySelector('.parent')
// var overlay_info_tags = overlay_info.querySelector('.tags')
// var overlay_info_id = overlay_info.querySelector('.isr .id')
// var overlay_info_score = overlay_info.querySelector('.isr .score')
// var overlay_info_rating = overlay_info.querySelector('.isr .rating')
// var overlay_info_index = overlay_info.querySelector('.isr .index')
// var overlay_info_ISR = overlay_info.querySelector('.isr')
// var overlay_info_slideshow = overlay_info.querySelector('.isr .slideshow')

export { CRT, SERVERS }
