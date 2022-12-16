import {
    autocomplete,
    cache_posts,
    overlay_info,
    plate_image,
    plate_video,
    slideshow_bar,
    tags_container,
    tags_input,
    timeline_bar,
    volume_bar,
} from 'elements'
import { CRT } from 'globals'
import { AutoCompleteTag } from 'types'

var CACHE_CTRL: AbortController | null = null

function update_autocomplete(tags: AutoCompleteTag[]) {
    if (tags.length === 0) {
        autocomplete.style.display = 'none'
        return
    }

    autocomplete.style.display = ''
    autocomplete.innerHTML = ''

    tags.forEach(tag => {
        const item = document.createElement('li')
        item.className = tag.type

        const name = document.createElement('span')
        const count = document.createElement('span')

        name.className = 'name'
        count.className = 'count'

        name.innerHTML = tag.name.replace(
            new RegExp(tags_input.value),
            match => `<mark>${match}</mark>`
        )
        count.innerText = tag.count.toLocaleString()

        item.appendChild(name)
        item.appendChild(count)

        autocomplete.appendChild(item)
    })
}

async function search() {
    if (!CRT.server) return

    let L_POSTS = await CRT.server.search(CRT.tags, CRT.page)

    if (L_POSTS.length === 0 && CRT.page > 0) {
        CRT.page--
        CRT.posts = await CRT.server.search(CRT.tags, CRT.page)
        CRT.index = CRT.posts.length - 1
    } else {
        CRT.posts = L_POSTS
        CRT.index = 0
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

function render_tags(tags: string[]) {
    // remove all the current tags
    tags_container.innerHTML = ''

    tags.forEach(tag => {
        let el = document.createElement('span')
        el.className = 'tag'
        el.innerText = tag
        tags_container.appendChild(el)
    })
}

function render_content() {
    if (CRT.posts.length === 0) return

    CRT.post = CRT.posts[CRT.index]!
    update_overlay_info()

    if (CRT.post.type === 'video') {
        plate_image.style.display = 'none'
        plate_video.style.display = ''
        volume_bar.style.display = ''
        timeline_bar.style.display = ''

        plate_video.src = CRT.post.file
        return
    }

    plate_video.style.display = 'none'
    plate_video.src = ''
    volume_bar.style.display = 'none'
    timeline_bar.style.display = 'none'
    plate_image.style.display = ''

    plate_image.src = CRT.post.sample

    if (!plate_image.complete) CRT.slideshow.running = false

    if (CACHE_CTRL) {
        CACHE_CTRL.abort()
    }

    CACHE_CTRL = new AbortController()
    if (CACHE_CTRL) cache_content(CACHE_CTRL.signal)
}

function update_overlay_info() {
    if (!CRT.post) return

    overlay_info.index.innerText = `${CRT.index + 1}/${CRT.posts.length} | ${
        CRT.page
    }`

    overlay_info.id.innerText = CRT.post.id.toString()
    overlay_info.id.onclick = () =>
        CRT.post && navigator.clipboard.writeText(CRT.post.id.toString())

    overlay_info.score.innerText = CRT.post.score.toString()

    if (CRT.post.parent_id) {
        overlay_info.parent.style.display = ''
        overlay_info.parent.innerText = `parent: ${CRT.post.parent_id}`
        overlay_info.parent.onclick = () => {
            CRT.post &&
                navigator.clipboard.writeText(`parent:${CRT.post.parent_id}`)
        }
    } else {
        overlay_info.parent.innerText = ''
        overlay_info.parent.style.display = 'none'
        overlay_info.parent.onclick = null
    }

    overlay_info.rating.innerText = capitalize(CRT.post.rating)
    overlay_info.rating.className = 'rating ' + CRT.post.rating

    overlay_info.tags.innerHTML = ''

    CRT.post.tags.forEach(tag => {
        let el = document.createElement('span')
        el.innerText = tag
        el.onclick = () => navigator.clipboard.writeText(tag)
        overlay_info.tags.appendChild(el)
    })
}

async function change_content(movement: number) {
    if (!CRT.server) return
    if (CRT.posts.length === 0) {
        CRT.index = 0
        return
    }

    let bf_idx = CRT.index

    CRT.index += movement

    if (CRT.index >= CRT.posts.length) {
        CRT.page++
        CRT.index = 0
        search()
        return
    } else if (CRT.index < 0) {
        if (CRT.page > 0) {
            CRT.page--
            CRT.posts = await CRT.server.search(CRT.tags, CRT.page)
            CRT.index = CRT.posts.length - 1
            render_content()
            return
        }
        CRT.index = 0
        search()
        return
    }

    if (bf_idx !== CRT.index) {
        CRT.slideshow.pos = 0
        slideshow_bar.style.width = '0%'

        if (CRT.slideshow.running) {
            CRT.slideshow.running = false
            setTimeout(() => {
                slideshow()
            }, 500)
        }

        render_content()
    }
}

function add_tag_2_tags() {
    if (!tags_input.value || CRT.tags.includes(tags_input.value)) return

    CRT.tags.push(tags_input.value)
    tags_input.value = ''
    render_tags(CRT.tags)
    update_autocomplete([])
}

async function cache_content(signal: AbortSignal) {
    if (!CRT.server) return

    cache_posts.innerHTML = ''

    for (let i = 1; i <= 3; i++) {
        if (signal.aborted) break

        let c_id = CRT.index + i
        if (c_id >= CRT.posts.length) {
            CRT.page++
            let L_POSTS = await CRT.server.search(CRT.tags, CRT.page)

            if (L_POSTS.length === 0) {
                CRT.page--
                break
            }

            CRT.posts = CRT.posts.concat(L_POSTS)
            update_overlay_info()
        }

        let item = CRT.posts[c_id]
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
    CRT.slideshow.running = true
    let _speed = CRT.slideshow.speed
    let total = CRT.slideshow.speed * 1000
    let start = performance.now()
    let progress = 0

    if (CRT.slideshow.pos) {
        start = start - (total / 100) * CRT.slideshow.pos
    }

    overlay_info.slideshow.textContent = `${CRT.slideshow.speed}s 🍏`

    function anime() {
        if (!CRT.slideshow.running) {
            overlay_info.slideshow.textContent = `${CRT.slideshow.speed}s 🍎`
            return
        }

        if (_speed !== CRT.slideshow.speed) {
            total = CRT.slideshow.speed * 1000
            _speed = CRT.slideshow.speed
            overlay_info.slideshow.textContent = `${CRT.slideshow.speed}s 🍏`
        }

        progress = performance.now() - start

        CRT.slideshow.pos = (100 / total) * progress
        slideshow_bar.style.width = CRT.slideshow.pos + '%'

        // restart
        if (progress > total) {
            start = performance.now()
            change_content(+1)
        }

        requestAnimationFrame(anime)
    }

    requestAnimationFrame(anime)
}

export { update_autocomplete, search, toggle_fullscreen, render_tags }
export { render_content, update_overlay_info, change_content }
export { add_tag_2_tags, cache_content, slideshow }
