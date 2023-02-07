/* import { info_tab, plate_image, plate_zoomed, tags_input } from 'elements'
import { State } from 'globals'
import { ActionBind, ActionModel, Mode, ModeDataModel } from 'types'
import { update_autocomplete } from 'utils'
import { update_zoom_level } from 'utils/zoom'
import { Actions } from './actions'







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



export { key_to_idx, update_mode, get_action, get_movement, zoom_redraw }
 */
