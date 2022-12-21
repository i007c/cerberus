import {
    content_tab,
    info_tab,
    inp_sort_score,
    overlay_info,
    plate,
    plate_video,
    server_opt,
    tags_input,
    timeline_bar,
    volume_bar,
} from 'elements'
import { SERVERS, State } from 'globals'
import { ModeDataModel } from 'types'
import {
    add_tag_2_tags,
    change_content,
    render_tags,
    search,
    slideshow,
    toggle_fullscreen,
    update_autocomplete,
} from 'utils'

const ModeData: ModeDataModel = {
    I: {
        event: mode_insert,
    },
    Z: {
        event: mode_zoom,
    },
    V: {
        event: mode_view,
    },
    O: {
        event: mode_options,
    },
}

function mode_insert(e: KeyboardEvent) {
    console.log('insert', e)
}
function mode_view(e: KeyboardEvent) {
    console.log('insert', e)
}
function mode_options(e: KeyboardEvent) {
    console.log('insert', e)
}
function mode_zoom(e: KeyboardEvent) {
    console.log('insert', e)
}

ModeData

function update_tab(toggle = true) {
    if (document.fullscreenElement) return

    if (toggle) {
        State.tab = State.tab === 'content' ? 'info' : 'content'
        // update_autocomplete([])
    }

    if (State.tab === 'content') {
        content_tab.focus()
        content_tab.className = 'content active'
        info_tab.className = 'info'
    } else {
        info_tab.focus()
        info_tab.className = 'info active'
        content_tab.className = 'content'
    }
}

function setup_events() {
    init()

    document.addEventListener('keydown', e => {
        if (e.altKey) return

        if (e.code === 'Tab') return update_tab()

        if (State.tab === 'info') return info_tag_input(e)

        if (State.tab === 'content') return content_keybinds(e)
    })

    tags_input.addEventListener('input', async () => {
        if (!tags_input.value) {
            update_autocomplete([])
            return
        }
        if (State.server.autocomplete) {
            const data = await State.server.autocomplete(tags_input.value)
            update_autocomplete(data)
        }
    })

    plate.addEventListener('focusout', () => {
        if (document.fullscreenElement === plate) {
            plate.focus()
        }
    })

    server_opt.addEventListener('change', () => {
        // @ts-ignore
        State.server = SERVERS[server_opt.value]
        console.log(State.server)
    })

    plate_video.addEventListener('volumechange', () => {
        volume_bar.style.height = plate_video.volume * 100 + '%'
    })

    plate_video.addEventListener('timeupdate', () => {
        let pr = (100 / plate_video.duration) * plate_video.currentTime
        timeline_bar.style.width = pr + '%'
    })
}

function info_tag_input(e: KeyboardEvent) {
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
            if (!tags_input.value && State.tags.length) {
                e.preventDefault()

                tags_input.value = State.tags.pop() || ''
                render_tags(State.tags)
                return
            }
    }

    if (e.shiftKey && e.code === 'Delete') {
        e.preventDefault()
        State.tags = []
        render_tags([])
        return
    }

    switch (e.ctrlKey && e.code) {
        case 'KeyS':
            e.preventDefault()
            inp_sort_score.checked = !inp_sort_score.checked
            return

        case 'KeyB':
            e.preventDefault()
            add_tag_2_tags()
            return

        case 'KeyG':
            e.preventDefault()
            search()
            return

        case 'KeyF':
            e.preventDefault()
            let options = server_opt.querySelectorAll('option')
            let newopt = options[server_opt.selectedIndex + 1]
            if (newopt) server_opt.value = newopt.value
            else server_opt.value = options[0]!.value

            // @ts-ignore
            State.server = SERVERS[server_opt.value]

            return
    }
}

function content_keybinds(e: KeyboardEvent) {
    if (!State.post) return

    switch (!e.ctrlKey && !e.shiftKey && e.code) {
        case 'Space':
            if (State.post.type === 'video') {
                State.slideshow.running = false
                State.slideshow.pos = 0

                if (plate_video.paused) plate_video.play()
                else plate_video.pause()

                return
            }

            if (State.slideshow.running) State.slideshow.running = false
            else slideshow()

            return

        case 'KeyF':
            e.preventDefault()
            toggle_fullscreen(plate)
            return

        case 'Minus':
        case 'Digit1':
            if (State.slideshow.speed === 1) return
            State.slideshow.speed--
            return

        case 'Equal':
        case 'Digit3':
            State.slideshow.speed++
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
            if (overlay_info.self.style.display)
                overlay_info.self.style.display = ''
            else overlay_info.self.style.display = 'none'
            return

        case 'KeyH':
            e.preventDefault()
            if (overlay_info.tags.style.display) {
                overlay_info.tags.style.display = ''
                overlay_info.isr.style.flexDirection = 'row'
            } else {
                overlay_info.tags.style.display = 'none'
                overlay_info.isr.style.flexDirection = 'column'
            }
            return

        case 'KeyR':
            e.preventDefault()
            console.log('add to favs')
            return

        case 'KeyO':
            e.preventDefault()
            if (!State.post) return
            State.server.open_post(State.post.id)
            return
    }

    if (State.post.type !== 'video') return

    switch (!e.ctrlKey && !e.shiftKey && e.code) {
        case 'ArrowRight':
            e.preventDefault()
            plate_video.currentTime += 1
            return

        case 'ArrowLeft':
            e.preventDefault()
            plate_video.currentTime -= 1
            return

        case 'ArrowUp':
            e.preventDefault()
            if (plate_video.volume > 0.9) return
            plate_video.volume += 0.1
            return

        case 'ArrowDown':
            e.preventDefault()
            if (plate_video.volume < 0.1) return
            plate_video.volume -= 0.1
            return

        case 'KeyL':
            e.preventDefault()
            plate_video.loop = !plate_video.loop
            return

        case 'KeyM':
            e.preventDefault()
            plate_video.muted = !plate_video.muted
            return
    }
}

function init() {
    // render_tags(State_TAGS)
    update_tab(false)
    if (State.tab === 'info') tags_input.focus()
    // @ts-ignore
    State.server = SERVERS[server_opt.value]
    overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍎`
    plate_video.volume = 0.3
    volume_bar.style.height = plate_video.volume * 100 + '%'
    volume_bar.style.display = 'none'
    timeline_bar.style.display = 'none'
}

export { setup_events }
