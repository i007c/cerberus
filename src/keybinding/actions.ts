/* import {
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
 */
import { toggle_favorite_post } from 'utils'

import { get_movement } from './utils'

const v_space: ActionFunc = () => {
    const post = PostState.post

    if (post.type === 'video') {
        setSlideshowState({ running: false, pos: 0 })

        // if (plate_video.paused) plate_video.play()
        // else plate_video.pause()

        return
    }

    if (SlideshowState.running) {
        setSlideshowState({ running: false })
    }
    // else slideshow()
}

const slideshow_speed: ActionFunc = (_, args) => {
    const update = get_movement(args)

    if (SlideshowState.speed + update < 1) {
        setSlideshowState({ speed: 0.3 })
    } else {
        setSlideshowState({ speed: Math.floor(SlideshowState.speed + update) })
    }

    // update_overlay_info()
}

const copy = (text: string | number) => {
    navigator.clipboard.writeText(`${text}`)
    setGlobalState({ mode: 'V' })
}

// all of the actions
const Actions: { [k: string]: ActionModel } = {
    set_mode_i: {
        title: 'set mode to insert',
        func: () => setGlobalState({ mode: 'I' }),
    },
    set_mode_v: {
        title: 'set mode to view',
        func: () => setGlobalState({ mode: 'V' }),
    },
    set_mode_c: {
        title: 'set mode to copy',
        func: () => setGlobalState({ mode: 'C' }),
    },
    set_mode_z: {
        title: 'set mode to zoom',
        func: () => setGlobalState({ mode: 'Z' }),
    },
    set_mode_o: {
        title: 'set mode to options',
        func: () => setGlobalState({ mode: 'O' }),
    },
    v_space: {
        title: 'toggle slide show or video playing',
        func: v_space,
    },
    toggle_fullscreen: {
        title: 'toggle plate fullscreen',
        func: () => setGlobalState({ isFullScreen: !GlobalState.isFullScreen }),
    },
    slideshow_speed: {
        title: 'update slieshow speed',
        func: slideshow_speed,
    },
    content_movement: {
        title: 'go to the next or previous post',
        func: (_, args) => {
            let update = get_movement(args)
            update
            // change_content(update)
        },
    },
    toggle_overlay_info: {
        title: 'toggle overlay info',
        func: () => {
            setGlobalState({ showOverlayInfo: !GlobalState.showOverlayInfo })
        },
    },
    toggle_overlay_info_tags: {
        title: 'toggle overlay info tags',
        func: () =>
            setGlobalState({
                showOverlayInfoTags: !GlobalState.showOverlayInfoTags,
            }),
    },
    toggle_favorite_post: {
        title: 'toggle favorite post',
        func: () => {
            if (PostState.post)
                toggle_favorite_post(PostState.server.name, PostState.post.id)
        },
    },
    open_current_post: {
        title: 'open current post',
        func: () => {
            if (!PostState.post || GlobalState.isLocal) return
            ActiveKeys = {}
            PostState.server.open_post(PostState.post.id)
        },
    },
    toggle_load_original: {
        title: 'toggle load original',
        description: 'the next content loads will load the original file',
        func: () => setGlobalState({ original: !GlobalState.original }),
    },
    load_original: {
        title: 'load original file',
        func: () => {
            // if (!PostState.post || PostState.post.type !== 'image') return
            // update_plate_image(PostState.post.file)
        },
    },
    open_original: {
        title: 'open original',
        func: () => {
            ActiveKeys = {}
            if (PostState.post) open(PostState.post.file)
        },
    },
    download_original: {
        title: 'download original',
        func: () => {
            if (!PostState.post) return
            ActiveKeys = {}
            chrome.downloads.download({
                url: PostState.post.file,
                conflictAction: 'uniquify',
            })
        },
    },
    change_video_time: {
        title: 'change video time',
        func: (_, args) => {
            if (!PostState.post || PostState.post.type !== 'video') return
            let update = get_movement(args)
            update
            // update_video_time(update)
        },
    },
    change_video_volume: {
        title: 'change video volume',
        func: (_, args) => {
            if (!PostState.post || PostState.post.type !== 'video') return
            let update = get_movement(args)
            update
            // if (update > 0) {
            //     plate_video.volume = Math.min(1, plate_video.volume + update)
            // } else {
            //     plate_video.volume = Math.max(0, plate_video.volume + update)
            // }
        },
    },
    toggle_video_loop: {
        title: 'toggle video loop',
        func: () => {
            if (!PostState.post || PostState.post.type !== 'video') return
            // plate_video.loop = !plate_video.loop
        },
    },
    toggle_video_mute: {
        title: 'toggle video mute',
        func: () => {
            if (!PostState.post || PostState.post.type !== 'video') return
            // plate_video.muted = !plate_video.muted
        },
    },
    search: {
        title: 'search the tags',
        func: () => {
            GlobalState.end_page = false
            // update_autocomplete([])
            // search(true)
            setGlobalState({ mode: 'V' })
        },
    },
    tag_autocomplete: {
        title: 'tag autocomplete',
        func: () => {
            // tags_input.focus()
            // if (State.autocomplete) {
            //     let tags = tags_input.value.split(' ').slice(0, -1)
            //     tags.push(State.autocomplete)
            //     tags_input.value = tags.join(' ')
            //     tags_input.value += ' '
            //     update_autocomplete([])
            // }
        },
    },
    select_localfile: {
        title: 'select a local json file',
        func: () => {
            ActiveKeys = {}
            // local_file.click()
            setGlobalState({ mode: 'V' })
        },
    },
    toggle_sort_score: {
        title: 'toggle sort score',
        func: () => {
            // inp_sort_score.checked = !inp_sort_score.checked
        },
    },
    change_server: {
        title: 'change server',
        func: (_, args) => {
            let update = get_movement(args)
            update
            // update_server(update)
        },
    },
    copy_post_id: {
        title: 'copy post id',
        func: () => {
            if (!PostState.post) return setGlobalState({ mode: 'V' })
            copy(PostState.post.id)
        },
    },
    copy_parent_id: {
        title: 'copy parent id',
        func: () => {
            if (!PostState.post) return setGlobalState({ mode: 'V' })

            if (PostState.post.has_children)
                return copy(`parent:${PostState.post.id}`)
            if (PostState.post.parent)
                return copy(`parent:${PostState.post.parent}`)
        },
    },
    copy_tags: {
        title: 'copy tags',
        func: () => {
            if (!PostState.post) return setGlobalState({ mode: 'V' })
            copy(PostState.post.tags.join(' '))
        },
    },
    change_zoom_pos: {
        title: 'change zoom position',
        func: (_, args) => {
            const axis = args[0]
            const dir = args[1]

            if ((axis !== 'x' && axis !== 'y') || typeof dir !== 'number')
                return

            if (args[2]) {
                setZoomState({
                    [axis]: ZoomState[axis] + (dir * 10) / ZoomState.level,
                })
            } else {
                setZoomState({ [axis]: dir })
            }

            // update_zoom_pos(axis, dir * State.zoom.speed)
        },
    },
    change_zoom_speed: {
        title: 'change zoom speed',
        func: (_, args) => {
            let speed = args[0]

            if (typeof speed !== 'number') return

            if (!args[1]) {
                speed = ZoomState.speed + speed
            }

            if (speed < 1) speed = 1

            setZoomState({ speed: speed })
        },
    },
    set_zoom_comic: {
        title: 'set zoom to comic view',
        func: () => {
            setZoomState({ level: 10, x: 0 })
        },
    },
    change_zoom_level: {
        title: 'change zoom level',
        func: (_, args) => {
            let level = args[0]

            if (typeof level !== 'number') return

            if (!args[1]) {
                level = ZoomState.level + level
            }

            setZoomState({ level: level })
        },
    },
}

function get_action(
    ab?: ActionBind
): [ActionModel, ActionArg[]] | [null, null] {
    let a: ActionModel | undefined

    if (typeof ab === 'string') {
        a = Actions[ab]
        if (a) return [a, []]
    } else if (Array.isArray(ab)) {
        a = Actions[ab[0]]
        if (!a) return [null, null]

        if (Array.isArray(ab[1])) return [a, ab[1]]

        return [a, [ab[1]]]
    }

    return [null, null]
}

export { Actions, get_action }
