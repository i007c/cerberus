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



// all of the actions
const Actions: { [k: string]: BActionModel } = {

    v_space: {
        title: 'toggle slide show or video playing',
        func: v_space,
    },
}


 */
