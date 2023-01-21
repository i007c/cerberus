import { info_tab, plate_image, plate_zoomed, tags_input } from 'elements'
import { State } from 'globals'
import { ActionBind, ActionModel, Mode, ModeDataModel } from 'types'
import { update_autocomplete } from 'utils'
import { update_zoom_level } from 'utils/zoom'
import { Actions } from './actions'

const ModeData: ModeDataModel = {
    I: {
        setup: () => {
            tags_input.focus()
        },
        clean: () => {
            tags_input.blur()
            update_autocomplete([])
        },
    },
    Z: {
        setup: zoom_redraw,
        clean: () => (plate_zoomed.parentElement!.style.display = 'none'),
    },
    V: {},
    O: {
        setup: () => (info_tab.className = 'info active'),
        clean: () => (info_tab.className = 'info'),
    },
    C: {
        setup: () => !State.post && update_mode('V'),
    },
}

const B2B = (bool: boolean) => (bool ? '1' : '0')

function key_to_idx(e: KeyboardEvent) {
    return (
        `${e.code}-${B2B(e.altKey)}-` +
        `${B2B(e.ctrlKey)}-${B2B(e.metaKey)}-${B2B(e.shiftKey)}`
    )
}

function get_action(ab?: ActionBind): [ActionModel, unknown[]] | [null, null] {
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

const get_movement = (args: unknown[]): number =>
    typeof args[0] === 'number' ? args[0] : 1

function zoom_update_size() {
    if (plate_image.naturalWidth > plate_image.naturalHeight) {
        plate_zoomed.width = (plate_image.naturalHeight * 16) / 9
        plate_zoomed.height = plate_image.naturalHeight
    } else {
        plate_zoomed.width = plate_image.naturalWidth
        plate_zoomed.height = (plate_image.naturalWidth * 9) / 16
    }

    // State.zoom.speed = Math.round(
    //     (plate_image.naturalWidth + plate_image.naturalHeight) / 100
    // )

    update_zoom_level(0)
}

function zoom_redraw() {
    if (State.mode != 'Z') return
    if (!State.post || State.post.type === 'video') return update_mode('V')

    plate_zoomed.parentElement!.style.display = ''
    if (!plate_image.complete) plate_image.onload = zoom_update_size
    else zoom_update_size()
}

function update_mode(mode: Mode) {
    let mode_data = ModeData[State.mode]
    mode_data.clean && mode_data.clean()

    State.mode = mode

    mode_data = ModeData[State.mode]
    mode_data.setup && mode_data.setup()
}

export { key_to_idx, update_mode, get_action, get_movement, zoom_redraw }