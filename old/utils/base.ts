import {
    cache_posts,
    overlay_info,
    plate_image,
    plate_video,
    slideshow_bar,
    timeline_bar,
} from 'elements'
import { State } from 'globals'

import { update_plate_image } from './loader'

var CACHE_CTRL: AbortController | null = null

async function search(replace = false) {
    render_content()
}

function render_content() {
    if (State.posts.length === 0) return

    State.post = State.posts[State.index]!

    timeline_bar.style.width = '0%'

    if (State.post.type === 'video') {
        plate_image.style.display = 'none'
        plate_video.style.display = ''
        timeline_bar.style.display = ''

        plate_video.src = State.post.file
        return
    }

    plate_video.style.display = 'none'
    plate_video.src = ''
    timeline_bar.style.display = 'none'
    plate_image.style.display = ''

    if (State.original) update_plate_image(State.post.file)
    else update_plate_image(State.post.sample)

    plate_image.onerror = () => {
        if (!State.post) return
        plate_image.onerror = null
        update_plate_image(State.post.file)
    }

    if (!plate_image.complete) State.slideshow.running = false

    if (CACHE_CTRL) {
        CACHE_CTRL.abort()
    }

    CACHE_CTRL = new AbortController()
    if (CACHE_CTRL) cache_content(CACHE_CTRL.signal)
}

async function cache_content(signal: AbortSignal) {
    cache_posts.innerHTML = ''

    for (let i = 1; i <= 3; i++) {
        if (signal.aborted) break

        let c_id = State.index + i
        // if (c_id >= State.posts.length && !State.isLocal) {
        //     State.page++
        //     let L_POSTS = await State.server.search(
        //         tags_input.value,
        //         State.page
        //     )

        //     if (L_POSTS.length === 0) {
        //         State.page--
        //         break
        //     }

        //     State.posts = State.posts.concat(L_POSTS)
        //     update_overlay_info()
        // }

        let item = State.posts[c_id]
        if (!item) break
        if (item.type !== 'image') continue

        let c_img = document.createElement('img')
        if (State.original) c_img.src = item.file
        else c_img.src = item.sample

        // c_img.onload = () => console.log(`image ${c_id} loaded`)
        // c_img.onerror = () => console.log(`image ${c_id} error`)

        signal.addEventListener('abort', () => {
            c_img.src = ''
        })

        cache_posts.appendChild(c_img)
    }
}

function slideshow() {
    State.slideshow.running = true
    let _speed = State.slideshow.speed
    let total = State.slideshow.speed * 1000
    let start = performance.now()
    let progress = 0

    if (State.slideshow.pos) {
        start = start - (total / 100) * State.slideshow.pos
    }

    overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍏`

    function anime() {
        if (!State.slideshow.running) {
            overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍎`
            return
        }

        if (_speed !== State.slideshow.speed) {
            total = State.slideshow.speed * 1000
            _speed = State.slideshow.speed
            overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍏`
        }

        progress = performance.now() - start

        State.slideshow.pos = (100 / total) * progress
        slideshow_bar.style.width = State.slideshow.pos + '%'

        // restart
        if (progress > total) {
            start = performance.now()
            change_content(+1)
        }

        requestAnimationFrame(anime)
    }

    requestAnimationFrame(anime)
}

export { search }
export { render_content }
export { slideshow }
