import {
    autocomplete,
    cache_posts,
    overlay_info,
    plate_image,
    plate_video,
    slideshow_bar,
    tags_input,
    timeline_bar,
} from 'elements'
import { State } from 'globals'
import { AutoCompleteTag } from 'types'

var CACHE_CTRL: AbortController | null = null

function update_autocomplete(tags: AutoCompleteTag[]) {
    let last_tag = tags_input.value.split(' ').at(-1)

    if (tags.length === 0 || !last_tag) {
        autocomplete.style.display = 'none'
        State.autocomplete = null
        return
    }

    autocomplete.style.display = ''
    autocomplete.innerHTML = ''

    State.autocomplete = tags[0] ? tags[0].name : null

    tags.forEach(tag => {
        const item = document.createElement('li')
        item.className = tag.type

        const name = document.createElement('span')
        const count = document.createElement('span')

        name.className = 'name'
        count.className = 'count'

        name.innerHTML = tag.name.replace(
            new RegExp(last_tag || ''),
            match => `<mark>${match}</mark>`
        )
        if (tag.count === -1) count.innerText = ''
        else count.innerText = tag.count.toLocaleString()

        item.appendChild(name)
        item.appendChild(count)

        autocomplete.appendChild(item)
    })
}

async function search() {
    let L_POSTS = await State.server.search(tags_input.value, State.page)

    if (L_POSTS.length === 0 && State.page > 0) {
        State.page--
        State.posts = await State.server.search(tags_input.value, State.page)
        State.index = State.posts.length - 1
    } else {
        State.posts = L_POSTS
        State.index = 0
    }
    render_content()
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function toggle_fullscreen(el: HTMLElement) {
    if (document.fullscreenElement === el) {
        document.exitFullscreen()
    } else {
        el.requestFullscreen()
    }
}

function render_content() {
    if (State.posts.length === 0) return

    State.post = State.posts[State.index]!
    update_overlay_info()

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

    plate_image.src = State.post.sample
    plate_image.onerror = () => {
        if (!State.post) return
        plate_image.onerror = null
        plate_image.src = State.post.file
    }

    if (!plate_image.complete) State.slideshow.running = false

    if (CACHE_CTRL) {
        CACHE_CTRL.abort()
    }

    CACHE_CTRL = new AbortController()
    if (CACHE_CTRL) cache_content(CACHE_CTRL.signal)
}

function update_overlay_info() {
    let POST = State.post
    if (!POST) return

    overlay_info.index.innerText = `${State.index + 1}/${
        State.posts.length
    } | ${State.page}`

    overlay_info.id.innerText = POST.id.toString()

    if (POST.score === -1) {
        overlay_info.score.style.display = 'none'
    } else {
        overlay_info.score.innerText = POST.score.toString()
        overlay_info.score.style.display = ''
    }

    if (POST.parent_id) {
        overlay_info.parent.style.display = ''
        overlay_info.parent.innerText = `parent: ${POST.parent_id}`
    } else {
        overlay_info.parent.innerText = ''
        overlay_info.parent.style.display = 'none'
    }

    overlay_info.rating.innerText = capitalize(POST.rating)
    overlay_info.rating.className = 'rating ' + POST.rating

    overlay_info.tags.innerHTML = ''

    POST.tags.forEach(tag => {
        let el = document.createElement('span')
        el.innerText = tag
        overlay_info.tags.appendChild(el)
    })
}

async function change_content(movement: number) {
    if (State.posts.length === 0) {
        State.index = 0
        return
    }

    let bf_idx = State.index

    State.index += movement

    if (State.index >= State.posts.length) {
        State.page++
        State.index = 0
        search()
        return
    } else if (State.index < 0) {
        if (State.page > 0) {
            State.page--
            State.posts = await State.server.search(
                tags_input.value,
                State.page
            )
            State.index = State.posts.length - 1
            render_content()
            return
        }
        State.index = 0
        search()
        return
    }

    if (bf_idx !== State.index) {
        State.slideshow.pos = 0
        slideshow_bar.style.width = '0%'
        timeline_bar.style.width = '0%'

        if (State.slideshow.running) {
            State.slideshow.running = false
            setTimeout(() => {
                slideshow()
            }, 500)
        }

        render_content()
    }
}

async function cache_content(signal: AbortSignal) {
    cache_posts.innerHTML = ''

    for (let i = 1; i <= 3; i++) {
        if (signal.aborted) break

        let c_id = State.index + i
        if (c_id >= State.posts.length) {
            State.page++
            let L_POSTS = await State.server.search(
                tags_input.value,
                State.page
            )

            if (L_POSTS.length === 0) {
                State.page--
                break
            }

            State.posts = State.posts.concat(L_POSTS)
            update_overlay_info()
        }

        let item = State.posts[c_id]
        if (!item) break
        if (item.type !== 'image') continue

        let c_img = document.createElement('img')
        c_img.src = item.sample

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

export { update_autocomplete, search, toggle_fullscreen }
export { render_content, update_overlay_info, change_content }
export { cache_content, slideshow }
