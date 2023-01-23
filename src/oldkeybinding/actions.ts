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

import { toggle_favorite_post } from 'utils'

import { get_movement } from './utils'

const v_space: BActionFunc = () => {
    if (SlideshowState.running) {
        setSlideshowState({ running: false })
    }
    // else slideshow()
}

const copy = (text: string | number) => {
    navigator.clipboard.writeText(`${text}`)
    setGlobalState({ mode: 'V' })
}

// all of the actions
const Actions: { [k: string]: BActionModel } = {

    v_space: {
        title: 'toggle slide show or video playing',
        func: v_space,
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
    ab?: BActionBind
): [BActionModel, BActionArg[]] | [null, null] {
    let a: BActionModel | undefined

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
 */
