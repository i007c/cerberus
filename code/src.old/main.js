var CRT_SIDE = 'info' // content or info
var CRT_TAGS = []
var CRT_SLIDESHOW_SPEED = 7 // seconds
var CRT_PAGE = 0
var CRT_INDEX = 0
var CRT_ITEM = null
var CRT_SITE = yandere
var CONTENT_LIST = []
var SLIDESHOW_RUNNING = false
var SLIDESHOW_POS = 0

var tags_container = info.querySelector('div.tags')

var SERVERS = {
    rule34: rule34,
    yandere: yandere,
    danbooru: rule34,
    gelbooru: rule34,
}

function info_tag_input(e) {
    switch (e.code) {
        case 'Enter':
            e.preventDefault()

            if (e.shiftKey) {
                search()
                return
            }

            add_tag_2_tags()
            return

        case 'Backspace':
            if (!writeable_tag.value && CRT_TAGS.length) {
                e.preventDefault()

                writeable_tag.value = CRT_TAGS.pop()
                render_tags(CRT_TAGS)
                return
            }
    }

    if (e.shiftKey && e.code === 'Delete') {
        e.preventDefault()
        CRT_TAGS = []
        render_tags([])
        return
    }

    switch (e.ctrlKey && e.code) {
        case 'KeyS':
            e.preventDefault()
            sort_score.checked = !sort_score.checked
            return

        case 'KeyB':
            e.preventDefault()
            add_tag_2_tags()
            return

        case 'KeyG':
            e.preventDefault()
            search()
            return
    }
}

function content_keybinds(e) {
    if (!CRT_ITEM) return

    switch (!e.ctrlKey && !e.shiftKey && e.code) {
        case 'Space':
            if (CRT_ITEM.type === 'video') {
                SLIDESHOW_RUNNING = false
                SLIDESHOW_POS = 0

                if (content_wrapper_video.paused) content_wrapper_video.play()
                else content_wrapper_video.pause()

                return
            }

            if (SLIDESHOW_RUNNING) SLIDESHOW_RUNNING = false
            else slideshow()

            return

        case 'KeyF':
            e.preventDefault()
            toggle_fullscreen(content_wrapper)
            return

        case 'Minus':
        case 'Digit1':
            if (CRT_SLIDESHOW_SPEED === 1) return
            CRT_SLIDESHOW_SPEED--
            return

        case 'Equal':
        case 'Digit3':
            CRT_SLIDESHOW_SPEED++
            return

        // content movement
        case 'KeyD':
            e.preventDefault()
            change_content(+1)
            return

        case 'KeyA':
            e.preventDefault()
            change_content(-1)
            return

        case 'KeyW':
            e.preventDefault()
            change_content(+10)
            return

        case 'KeyS':
            e.preventDefault()
            change_content(-10)
            return

        case 'KeyT':
            e.preventDefault()
            if (overlay_info.style.display) overlay_info.style.display = ''
            else overlay_info.style.display = 'none'
            return

        case 'KeyH':
            e.preventDefault()
            if (overlay_info_tags.style.display) {
                overlay_info_tags.style.display = ''
                overlay_info_ISR.style.flexDirection = 'row'
            } else {
                overlay_info_tags.style.display = 'none'
                overlay_info_ISR.style.flexDirection = 'column'
            }
            return

        case 'KeyR':
            e.preventDefault()
            console.log('add to favs')
            return

        case 'KeyO':
            e.preventDefault()
            if (!CRT_ITEM) return
            CRT_SITE.open_post(CRT_ITEM.id)
            return
    }

    if (CRT_ITEM.type !== 'video') return

    switch (!e.ctrlKey && !e.shiftKey && e.code) {
        case 'ArrowRight':
            e.preventDefault()
            content_wrapper_video.currentTime += 1
            return

        case 'ArrowLeft':
            e.preventDefault()
            content_wrapper_video.currentTime -= 1
            return

        case 'ArrowUp':
            e.preventDefault()
            if (content_wrapper_video.volume > 0.9) return
            content_wrapper_video.volume += 0.1
            return

        case 'ArrowDown':
            e.preventDefault()
            if (content_wrapper_video.volume < 0.1) return
            content_wrapper_video.volume -= 0.1
            return

        case 'KeyL':
            e.preventDefault()
            content_wrapper_video.loop = !content_wrapper_video.loop
            return

        case 'KeyM':
            e.preventDefault()
            content_wrapper_video.muted = !content_wrapper_video.muted
            return
    }
}

function keybinds(e) {
    switch (e.code) {
        case 'KeyZ':
            // zoom in
            // zoom mode
            // zoom mode is a mode that you can naviage the zoomed picture
            // via W S A and D keys
            return

        case 'KeyX':
            // zoom out
            return

        case 'Digit0':
            // zoom reset
            return
    }
}

document.addEventListener('keydown', e => {
    if (e.altKey) return

    if (e.code === 'Tab') return update_side()

    if (CRT_SIDE === 'info') return info_tag_input(e)

    if (CRT_SIDE === 'content') return content_keybinds(e)
})

writeable_tag.addEventListener('input', async () => {
    if (!writeable_tag.value) {
        update_autocomplete([])
        return
    }
    const data = await CRT_SITE.autocomplete(writeable_tag.value)
    update_autocomplete(data)
})

content_wrapper.addEventListener('focusout', () => {
    if (document.fullscreenElement === content_wrapper) {
        content_wrapper.focus()
    }
})

server.addEventListener('change', () => {
    CRT_SITE = SERVERS[server.value]
})

content_wrapper_video.addEventListener('volumechange', () => {
    volume_fillbar.style.height = content_wrapper_video.volume * 100 + '%'
})

content_wrapper_video.addEventListener('timeupdate', () => {
    let pr =
        (100 / content_wrapper_video.duration) *
        content_wrapper_video.currentTime
    timeline_fillbar.style.width = pr + '%'
})

{
    // init
    render_tags(CRT_TAGS)
    update_side(false)
    if (CRT_SIDE === 'info') writeable_tag.focus()
    CRT_SITE = SERVERS[server.value]
    overlay_info_slideshow.textContent = `${CRT_SLIDESHOW_SPEED}s 🍎`
    content_wrapper_video.volume = 0.3
    volume_fillbar.style.height = content_wrapper_video.volume * 100 + '%'
    volume_fillbar.style.display = 'none'
    timeline_fillbar.style.display = 'none'
}
