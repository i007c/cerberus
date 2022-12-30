import { State } from 'globals'
import { ActionBind } from 'types'
import { get_action, key_to_idx } from './utils'

type KBT = { [k: string]: ActionBind }
var KeyBinds: KBT = {
    // MODE-KEY-ALT-CTRL-META-SHIFT

    // global actions
    '*-Escape-0-0-0-0': 'set_mode_v',

    // view mode
    'V-KeyI-0-0-0-0': 'set_mode_i',
    'V-KeyC-0-0-0-0': 'set_mode_c',
    'V-KeyZ-0-0-0-0': 'set_mode_z',
    'V-KeyO-0-0-0-0': 'set_mode_o',
    'V-Space-0-0-0-0': 'v_space',
    'V-KeyF-0-0-0-0': 'toggle_fullscreen',
    'V-Minus-0-0-0-0': ['slideshow_speed', -1],
    'V-Digit1-0-0-0-0': ['slideshow_speed', -1],
    'V-Equal-0-0-0-0': ['slideshow_speed', 1],
    'V-Digit3-0-0-0-0': ['slideshow_speed', 1],
    'V-KeyD-0-0-0-0': ['content_movement', +1],
    'V-KeyA-0-0-0-0': ['content_movement', -1],
    'V-KeyW-0-0-0-0': ['content_movement', +10],
    'V-KeyS-0-0-0-0': ['content_movement', -10],
    'V-KeyT-0-0-0-0': 'toggle_overlay_info',
    'V-KeyH-0-0-0-0': 'toggle_overlay_info_tags',
    'V-KeyR-0-0-0-0': 'toggle_favorite_post',
    'V-KeyU-0-0-0-0': 'open_current_post',
    'V-KeyY-0-0-0-0': 'toggle_load_original',
    // with shift
    'V-KeyF-0-0-0-1': 'load_original',
    'V-KeyN-0-0-0-1': 'open_original',
    'V-KeyB-0-0-0-1': 'download_original',
    'V-KeyR-0-0-0-1': 'download_original',
    // video controls
    'V-ArrowRight-0-0-0-0': ['change_video_time', +1],
    'V-ArrowLeft-0-0-0-0': ['change_video_time', -1],
    'V-KeyD-0-0-0-1': ['change_video_time', +10],
    'V-KeyA-0-0-0-1': ['change_video_time', -10],
    'V-ArrowUp-0-0-0-0': ['change_video_volume', +0.05],
    'V-ArrowDown-0-0-0-0': ['change_video_volume', -0.05],
    'V-KeyL-0-0-0-0': 'toggle_video_loop',
    'V-KeyM-0-0-0-0': 'toggle_video_mute',

    // options mode
    'O-Enter-0-0-0-0': 'search',
    'O-KeyI-0-0-0-0': 'set_mode_i',
    'O-KeyF-0-0-0-0': 'select_localfile',
    'O-KeyS-0-0-0-0': 'toggle_sort_score',
    'O-KeyD-0-0-0-0': ['change_server', +1],
    'O-KeyA-0-0-0-0': ['change_server', -1],

    // insert mode
    'I-Enter-0-0-0-0': 'search',
    'I-Tab-0-0-0-0': 'tag_autocomplete',

    // copy mode
    'C-KeyI-0-0-0-0': 'copy_post_id',
    'C-KeyP-0-0-0-0': 'copy_parent_id',
    'C-KeyT-0-0-0-0': 'copy_tags',

    // zoom mode
    'Z-KeyD-0-0-0-0': ['change_zoom_pos', ['x', +1]],
    'Z-KeyA-0-0-0-0': ['change_zoom_pos', ['x', -1]],
    'Z-KeyW-0-0-0-0': ['change_zoom_pos', ['y', -1]],
    'Z-KeyS-0-0-0-0': ['change_zoom_pos', ['y', +1]],
    'Z-KeyG-0-0-0-0': ['change_zoom_speed', -5],
    'Z-KeyH-0-0-0-0': ['change_zoom_speed', +5],
    'Z-KeyJ-0-0-0-0': ['change_zoom_speed', [10, true]],
    'Z-KeyT-0-0-0-0': 'toggle_overlay_info',
    'Z-KeyV-0-0-0-0': 'toggle_overlay_info_tags',
    'Z-KeyY-0-0-0-0': 'toggle_load_original',
    'Z-KeyF-0-0-0-0': 'toggle_fullscreen',
    'Z-KeyQ-0-0-0-0': 'set_mode_v',

    'Z-Minus-0-0-0-0': ['change_zoom_level', -0.5],
    'Z-Digit1-0-0-0-0': ['change_zoom_level', -0.5],
    'Z-Equal-0-0-0-0': ['change_zoom_level', +0.5],
    'Z-Digit3-0-0-0-0': ['change_zoom_level', +0.5],
    'Z-KeyZ-0-0-0-0': ['change_zoom_level', [1, true]],
    'Z-Digit0-0-0-0-0': ['change_zoom_level', [1, true]],
    'Z-Digit2-0-0-0-0': ['change_zoom_level', [1, true]],

    'Z-KeyD-0-0-0-1': ['content_movement', +1],
    'Z-KeyA-0-0-0-1': ['content_movement', -1],
    'Z-KeyF-0-0-0-1': 'load_original',
}

function setup_keybinds() {
    document.addEventListener('keydown', e => {
        State.ActiveKeys[e.code] = key_to_idx(e)

        Object.values(State.ActiveKeys).forEach(key => {
            const [amode, margs] = get_action(KeyBinds[`${State.mode}-${key}`])
            if (amode) amode.func(e, margs)

            const [action_glob, gargs] = get_action(KeyBinds[`*-${key}`])
            if (action_glob) action_glob.func(e, gargs)

            if (action_glob || amode) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
            }
        })
    })

    document.addEventListener('keyup', e => {
        delete State.ActiveKeys[e.code]
    })
}

export { setup_keybinds }
