import {
    inp_sort_score,
    local_file,
    overlay_info,
    plate,
    plate_video,
    tags_input,
} from 'elements'
import { State } from 'globals'
import { ActionFunc as AF, ActionModel } from 'types'
import {
    change_content,
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
import { update_plate_image } from 'utils/loader'
import { get_movement, update_mode } from './utils'

const v_space: AF = () => {
    if (!State.post) return

    if (State.post.type === 'video') {
        State.slideshow.running = false
        State.slideshow.pos = 0

        if (plate_video.paused) plate_video.play()
        else plate_video.pause()

        return
    }

    if (State.slideshow.running) State.slideshow.running = false
    else slideshow()
}

const slideshow_speed: AF = (_, args) => {
    let update = get_movement(args)

    if (State.slideshow.speed + update < 1) {
        State.slideshow.speed = 0.3
    } else {
        State.slideshow.speed = Math.floor(State.slideshow.speed + update)
    }

    update_overlay_info()
}

const copy = (text: string | number) => {
    navigator.clipboard.writeText(`${text}`)
    update_mode('V')
}

// all of the actions
const Actions: { [k: string]: ActionModel } = {
    set_mode_i: {
        title: 'set mode to insert',
        func: () => update_mode('I'),
    },
    set_mode_v: {
        title: 'set mode to view',
        func: () => update_mode('V'),
    },
    set_mode_c: {
        title: 'set mode to copy',
        func: () => update_mode('C'),
    },
    set_mode_z: {
        title: 'set mode to zoom',
        func: () => update_mode('Z'),
    },
    set_mode_o: {
        title: 'set mode to options',
        func: () => update_mode('O'),
    },
    v_space: {
        title: 'toggle slide show or video playing',
        func: v_space,
    },
    toggle_fullscreen: {
        title: 'toggle plate fullscreen',
        func: () => toggle_fullscreen(plate),
    },
    slideshow_speed: {
        title: 'update slieshow speed',
        func: slideshow_speed,
    },
    content_movement: {
        title: 'go to the next or previous post',
        func: (_, args) => {
            let update = get_movement(args)
            change_content(update)
        },
    },
    toggle_overlay_info: {
        title: 'toggle overlay info',
        func: () => {
            if (overlay_info.self.style.display)
                overlay_info.self.style.display = ''
            else overlay_info.self.style.display = 'none'
        },
    },
    toggle_overlay_info_tags: {
        title: 'toggle overlay info tags',
        func: () => {
            if (overlay_info.tags.style.display) {
                overlay_info.tags.style.display = ''
                overlay_info.isr.style.flexDirection = 'row'
            } else {
                overlay_info.tags.style.display = 'none'
                overlay_info.isr.style.flexDirection = 'column'
            }
        },
    },
    toggle_favorite_post: {
        title: 'toggle favorite post',
        func: () => {
            if (State.post)
                toggle_favorite_post(State.server.name, State.post.id)
        },
    },
    open_current_post: {
        title: 'open current post',
        func: () => {
            if (!State.post || State.isLocal) return
            State.ActiveKeys = {}
            State.server.open_post(State.post.id)
        },
    },
    toggle_load_original: {
        title: 'toggle load original',
        description: 'the next content loads will load the original file',
        func: () => {
            State.original = !State.original
            update_overlay_info()
        },
    },
    load_original: {
        title: 'load original file',
        func: () => {
            if (!State.post || State.post.type !== 'image') return
            update_plate_image(State.post.file)
        },
    },
    open_original: {
        title: 'open original',
        func: () => {
            State.ActiveKeys = {}
            if (State.post) open(State.post.file)
        },
    },
    download_original: {
        title: 'download original',
        func: () => {
            if (!State.post) return
            State.ActiveKeys = {}
            chrome.downloads.download({
                url: State.post.file,
                conflictAction: 'uniquify',
            })
        },
    },
    change_video_time: {
        title: 'change video time',
        func: (_, args) => {
            if (!State.post || State.post.type !== 'video') return
            let update = get_movement(args)
            update_video_time(update)
        },
    },
    change_video_volume: {
        title: 'change video volume',
        func: (_, args) => {
            if (!State.post || State.post.type !== 'video') return
            let update = get_movement(args)
            if (update > 0) {
                plate_video.volume = Math.min(1, plate_video.volume + update)
            } else {
                plate_video.volume = Math.max(0, plate_video.volume + update)
            }
        },
    },
    toggle_video_loop: {
        title: 'toggle video loop',
        func: () => {
            if (!State.post || State.post.type !== 'video') return
            plate_video.loop = !plate_video.loop
        },
    },
    toggle_video_mute: {
        title: 'toggle video mute',
        func: () => {
            if (!State.post || State.post.type !== 'video') return
            plate_video.muted = !plate_video.muted
        },
    },
    search: {
        title: 'search the tags',
        func: () => {
            State.end_page = false
            update_autocomplete([])
            search(true)
            update_mode('V')
        },
    },
    tag_autocomplete: {
        title: 'tag autocomplete',
        func: () => {
            tags_input.focus()
            if (State.autocomplete) {
                let tags = tags_input.value.split(' ').slice(0, -1)
                tags.push(State.autocomplete)
                tags_input.value = tags.join(' ')
                tags_input.value += ' '
                update_autocomplete([])
            }
        },
    },
    select_localfile: {
        title: 'select a local json file',
        func: () => {
            State.ActiveKeys = {}
            local_file.click()
            update_mode('V')
        },
    },
    toggle_sort_score: {
        title: 'toggle sort score',
        func: () => {
            inp_sort_score.checked = !inp_sort_score.checked
        },
    },
    change_server: {
        title: 'change server',
        func: (_, args) => {
            let update = get_movement(args)
            update_server(update)
        },
    },
    copy_post_id: {
        title: 'copy post id',
        func: () => {
            if (!State.post) return update_mode('V')
            copy(State.post.id)
        },
    },
    copy_parent_id: {
        title: 'copy parent id',
        func: () => {
            if (!State.post) return update_mode('V')

            if (State.post.has_children) return copy(`parent:${State.post.id}`)
            if (State.post.parent_id)
                return copy(`parent:${State.post.parent_id}`)
        },
    },
    copy_tags: {
        title: 'copy tags',
        func: () => {
            if (!State.post) return update_mode('V')
            copy(State.post.tags.join(' '))
        },
    },
    change_zoom_pos: {
        title: 'change zoom position',
        func: (_, args) => {
            if (!State.post || State.post.type !== 'image') return

            const axis = args[0]
            const dir = args[1]

            if ((axis !== 'x' && axis !== 'y') || typeof dir !== 'number')
                return

            if (args[2]) {
                State.zoom[axis] = dir
                update_zoom_pos(axis, 0)
                return
            }

            update_zoom_pos(axis, dir * State.zoom.speed)
        },
    },
    change_zoom_speed: {
        title: 'change zoom speed',
        func: (_, args) => {
            if (!State.post || State.post.type !== 'image') return

            const speed = args[0]

            if (typeof speed !== 'number') return

            if (args[1]) {
                State.zoom.speed = speed
                return
            }

            State.zoom.speed += speed
            if (State.zoom.speed < 1) State.zoom.speed = 1
        },
    },
    set_zoom_comic: {
        title: 'set zoom to comic view',
        func: () => {
            if (!State.post || State.post.type !== 'image') return

            State.zoom.level = 10
            State.zoom.x = 0

            update_zoom_level(0)
        },
    },
    change_zoom_level: {
        title: 'change zoom level',
        func: (_, args) => {
            if (!State.post || State.post.type !== 'image') return

            const level = args[0]

            if (typeof level !== 'number') return

            if (args[1]) {
                State.zoom.level = level
                update_zoom_level(0)
            } else {
                update_zoom_level(level)
            }
        },
    },
}

export { Actions }
