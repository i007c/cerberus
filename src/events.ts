import {
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
import { Mode, ModeDataModel } from 'types'
import {
    change_content,
    search,
    slideshow,
    toggle_fullscreen,
    update_autocomplete,
    update_video_time,
} from 'utils'

const ModeData: ModeDataModel = {
    I: {
        event: mode_insert,
        setup: () => {
            setTimeout(() => {
                tags_input.disabled = false
                tags_input.focus()
            }, 100)
        },
        clean: () => {
            tags_input.blur()
            tags_input.disabled = true
            update_autocomplete([])
        },
    },
    Z: {
        event: mode_zoom,
    },
    V: {
        event: mode_view,
    },
    O: {
        event: mode_options,
        setup: () => (info_tab.className = 'info active'),
        clean: () => (info_tab.className = 'info'),
    },
}

function update_mode(mode: Mode) {
    let mode_data = ModeData[State.mode]
    mode_data.clean && mode_data.clean()

    State.mode = mode

    mode_data = ModeData[State.mode]
    mode_data.setup && mode_data.setup()
}

function mode_insert(e: KeyboardEvent) {
    switch (e.code) {
        case 'Tab':
            e.preventDefault()
            e.stopPropagation()
            tags_input.focus()
            if (State.autocomplete) {
                let tags = tags_input.value.split(' ').slice(0, -1)
                tags.push(State.autocomplete)
                tags_input.value = tags.join(' ')
                tags_input.value += ' '
                update_autocomplete([])
            }
            return

        case 'Enter':
            e.preventDefault()
            search()
            update_mode('V')
            update_autocomplete([])
            return
    }
}

function mode_view(e: KeyboardEvent) {
    switch (e.code) {
        case 'KeyI':
            return update_mode('I')

        case 'KeyZ':
            return update_mode('Z')

        case 'KeyO':
            return update_mode('O')
    }

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
            update_video_time(+1)
            return

        case 'ArrowLeft':
            e.preventDefault()
            update_video_time(-1)
            return

        case 'ArrowUp':
            e.preventDefault()
            plate_video.volume = Math.min(1, plate_video.volume + 0.05)
            return

        case 'ArrowDown':
            e.preventDefault()
            plate_video.volume = Math.max(0, plate_video.volume - 0.05)
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

    switch (e.shiftKey && e.code) {
        case 'KeyD':
            e.preventDefault()
            update_video_time(+10)
            return

        case 'KeyA':
            e.preventDefault()
            update_video_time(-10)
            return
    }
}

function mode_options(e: KeyboardEvent) {
    switch (e.code) {
        case 'Enter':
            e.preventDefault()
            search()
            update_mode('V')
            return

        case 'KeyS':
            e.preventDefault()
            inp_sort_score.checked = !inp_sort_score.checked
            return

        case 'KeyD':
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

function mode_zoom(e: KeyboardEvent) {
    console.log('zoom', e)
}

function setup_events() {
    init()

    document.addEventListener('keydown', e => {
        if (e.altKey) return

        if (e.code === 'Escape' && State.mode !== 'V') return update_mode('V')

        return ModeData[State.mode].event(e)
    })

    tags_input.addEventListener('input', async () => {
        let last_tag = tags_input.value.split(' ').at(-1)
        tags_input.value = tags_input.value.replaceAll('\n', '')

        if (!last_tag || last_tag === '\n') return update_autocomplete([])

        if (State.server.autocomplete) {
            const data = await State.server.autocomplete(last_tag)
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
        if (plate_video.muted) volume_bar.style.backgroundColor = '#fd5e00'
        else volume_bar.style.backgroundColor = '#fd0079'
    })

    plate_video.addEventListener('timeupdate', () => {
        let pr = (100 / plate_video.duration) * plate_video.currentTime
        timeline_bar.style.width = pr + '%'
    })
}

function init() {
    // render_tags(State_TAGS)
    // update_tab(false)
    // if (State.tab === 'info') tags_input.focus()
    // @ts-ignore
    State.server = SERVERS[server_opt.value]
    overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍎`
    plate_video.volume = 0.3
    volume_bar.style.height = plate_video.volume * 100 + '%'
    volume_bar.style.display = 'none'
    timeline_bar.style.display = 'none'
}

export { ModeData }
export { setup_events }
