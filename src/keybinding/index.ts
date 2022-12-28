import { State } from 'globals'
import { key_to_idx, update_mode } from './utils'

interface ActionModel {
    title: string
    description?: string
    func: (e: KeyboardEvent) => void
    // prevent_default?: false
    // stop_propagation?: false
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
}

var ActiveKeys: { [k: string]: string } = {}
var KeyBinds: { [k: string]: string } = {
    // global actions
    '*-Escape-0-0-0-0': 'set_mode_v',

    // view mode
    'V-KeyI-0-0-0-0': 'set_mode_i',
    'V-KeyC-0-0-0-0': 'set_mode_c',
    'V-KeyZ-0-0-0-0': 'set_mode_z',
    'V-KeyO-0-0-0-0': 'set_mode_o',
}

function setup_keybinds() {
    document.addEventListener('keydown', e => {
        ActiveKeys[e.code] = key_to_idx(e)
        console.log(State.mode, ActiveKeys[e.code])

        Object.values(ActiveKeys).forEach(key => {
            let action_mode_id = KeyBinds[`${State.mode}-${key}`]
            let action_glob_id = KeyBinds[`*-${key}`]

            let action_mode = action_mode_id ? Actions[action_mode_id] : null
            let action_glob = action_glob_id ? Actions[action_glob_id] : null

            if (action_mode) action_mode.func(e)
            if (action_glob) action_glob.func(e)

            if (action_glob || action_mode) {
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
            }
        })
    })

    document.addEventListener('keyup', e => {
        delete ActiveKeys[e.code]
    })
}

export { setup_keybinds }
