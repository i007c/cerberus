import {
    info_tab,
    inp_sort_score,
    local_file,
    overlay_info,
    plate,
    plate_image,
    plate_video,
    plate_zoomed,
    server_opt,
    tags_input,
    timeline_bar,
    volume_bar,
} from 'elements'
import { SERVERS, State } from 'globals'
import { Mode, ModeDataModel } from 'types'
import {
    change_content,
    load_favorite_list,
    load_from_local,
    search,
    slideshow,
    toggle_favorite_post,
    toggle_fullscreen,
    update_autocomplete,
    update_overlay_info,
    update_server,
    update_video_time,
    update_zoom_level,
    update_zoom_pos,
} from 'utils'

var volume_timeout: NodeJS.Timeout | null = null

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
        setup: zoom_setup,
        clean: () => (plate_zoomed.parentElement!.style.display = 'none'),
    },
    V: {
        event: mode_view,
    },
    O: {
        event: mode_options,
        setup: () => (info_tab.className = 'info active'),
        clean: () => (info_tab.className = 'info'),
    },
    C: {
        event: mode_copy,
        setup: () => !State.post && update_mode('V'),
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

function mode_copy(e: KeyboardEvent) {
    if (!State.post) return update_mode('V')

    const copy = (text: string | number) => {
        e.preventDefault()
        navigator.clipboard.writeText(`${text}`)
        update_mode('V')
    }

    switch (e.code) {
        case 'KeyI':
            return copy(State.post.id)

        case 'KeyP':
            if (State.post.has_children) return copy(`parent:${State.post.id}`)

            if (State.post.parent_id)
                return copy(`parent:${State.post.parent_id}`)

            return

        case 'KeyT':
            return copy(State.post.tags.join(' '))
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

        case 'KeyC':
            return update_mode('C')
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
            toggle_favorite_post(State.server.name, State.post.id)
            return

        case 'KeyU':
            e.preventDefault()
            if (!State.post || State.isLocal) return
            State.server.open_post(State.post.id)
            return

        case 'KeyY':
            e.preventDefault()
            State.original = !State.original
            update_overlay_info()
            return
    }

    const get_favs = async () =>
        (await chrome.storage.local.get('favorite_lists')).favorite_lists

    switch (e.shiftKey && e.code) {
        case 'KeyF':
            e.preventDefault()
            if (State.post.type === 'image') {
                plate_image.src = ''
                plate_image.src = State.post.file
            }
            return

        case 'KeyN':
            e.preventDefault()
            open(State.post.file)
            return

        case 'KeyB':
            e.preventDefault()
            chrome.downloads.download({
                url: State.post.file,
                conflictAction: 'uniquify',
            })
            return

        case 'KeyR':
            e.preventDefault()
            get_favs().then(list => {
                console.log(list)
                navigator.clipboard.writeText(JSON.stringify(list))
            })
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
            return update_server(+1)

        case 'KeyA':
            e.preventDefault()
            return update_server(-1)

        case 'KeyI':
            e.preventDefault()
            return update_mode('I')

        case 'KeyF':
            e.preventDefault()
            local_file.click()
            return update_mode('V')
    }
}

function mode_zoom(e: KeyboardEvent) {
    if (!State.post || State.post.type !== 'image') return

    switch (!e.shiftKey && e.code) {
        case 'KeyD':
            return update_zoom_pos('x', +State.zoom.speed)

        case 'KeyA':
            return update_zoom_pos('x', -State.zoom.speed)

        case 'KeyW':
            return update_zoom_pos('y', -State.zoom.speed)

        case 'KeyS':
            return update_zoom_pos('y', +State.zoom.speed)

        case 'KeyG':
            State.zoom.speed -= 5
            if (State.zoom.speed < 1) State.zoom.speed = 1
            return

        case 'KeyH':
            State.zoom.speed += 5
            return

        case 'KeyJ':
            State.zoom.speed = 10
            return

        case 'KeyT':
            e.preventDefault()
            if (overlay_info.self.style.display)
                overlay_info.self.style.display = ''
            else overlay_info.self.style.display = 'none'
            return

        case 'KeyY':
            e.preventDefault()
            State.original = !State.original
            update_overlay_info()
            return

        case 'KeyF':
            e.preventDefault()
            if (e.shiftKey) {
            } else {
                toggle_fullscreen(plate)
            }
            return

        case 'KeyQ':
            update_mode('V')
            return

        case 'Minus':
        case 'Digit1':
            return update_zoom_level(-0.5)

        case 'Equal':
        case 'Digit3':
            return update_zoom_level(+0.5)

        case 'KeyZ':
        case 'Digit0':
            return update_zoom_level(1, true)
    }

    switch ((e.shiftKey, e.code)) {
        // content movement
        case 'KeyD':
            e.preventDefault()
            change_content(+1)
            zoom_redraw()
            return

        case 'KeyA':
            e.preventDefault()
            change_content(-1)
            zoom_redraw()
            return

        case 'KeyW':
            e.preventDefault()
            change_content(+10)
            zoom_redraw()
            return

        case 'KeyS':
            e.preventDefault()
            change_content(-10)
            zoom_redraw()
            return

        case 'KeyF':
            e.preventDefault()
            plate_image.src = ''
            plate_image.src = State.post.file
            zoom_redraw()
            return
    }
}

function zoom_update_size() {
    if (plate_image.naturalWidth > plate_image.naturalHeight) {
        plate_zoomed.width = (plate_image.naturalHeight * 16) / 9
        plate_zoomed.height = plate_image.naturalHeight
    } else {
        plate_zoomed.width = plate_image.naturalWidth
        plate_zoomed.height = (plate_image.naturalWidth * 9) / 16
    }

    State.zoom.speed = Math.round(
        (plate_image.naturalWidth + plate_image.naturalHeight) / 200
    )

    update_zoom_level(0)
}

function zoom_redraw() {
    if (!State.post || State.post.type === 'video') return update_mode('V')

    if (!plate_image.complete) plate_image.onload = zoom_update_size
    else zoom_update_size()
}

function zoom_setup() {
    if (!State.post || State.post.type === 'video') return update_mode('V')

    plate_zoomed.parentElement!.style.display = ''
    zoom_redraw()
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
        load_favorite_list(State.server.name)
    })

    plate_video.addEventListener('volumechange', () => {
        if (volume_timeout) clearTimeout(volume_timeout)
        volume_bar.parentElement!.style.display = ''

        volume_bar.style.height = plate_video.volume * 100 + '%'
        if (plate_video.muted) volume_bar.style.backgroundColor = '#fd5e00'
        else volume_bar.style.backgroundColor = '#fd0079'

        volume_timeout = setTimeout(
            () => (volume_bar.parentElement!.style.display = 'none'),
            1000
        )
    })

    plate_video.addEventListener('timeupdate', () => {
        let pr = (100 / plate_video.duration) * plate_video.currentTime
        timeline_bar.style.width = pr + '%'
    })

    plate_video.addEventListener('pause', () => {
        timeline_bar.style.backgroundColor = '#1db545'
        timeline_bar.style.width = '100%'
    })

    plate_video.addEventListener('play', () => {
        timeline_bar.style.backgroundColor = '#0351c1'
        let pr = (100 / plate_video.duration) * plate_video.currentTime
        timeline_bar.style.width = pr + '%'
    })

    local_file.addEventListener('change', async () => {
        const file = local_file.files && local_file.files[0]
        if (!file || file.type !== 'application/json') return
        load_from_local(JSON.parse(await file.text()))
    })
}

function init() {
    // @ts-ignore
    State.server = SERVERS[server_opt.value]
    load_favorite_list(State.server.name)

    overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍎`
    plate_video.volume = 0.3
    volume_bar.style.height = plate_video.volume * 100 + '%'
    volume_bar.parentElement!.style.display = 'none'
    timeline_bar.style.display = 'none'
    plate_zoomed.parentElement!.style.display = 'none'
}

export { ModeData }
export { setup_events }
