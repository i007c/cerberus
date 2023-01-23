import {
    loading_bar, overlay_info,
    plate_video,
    plate_zoomed,
    server_opt, timeline_bar,
    volume_bar
} from 'elements'
import { SERVERS, State } from 'globals'
import { load_favorite_list } from 'utils'



function init() {
    // @ts-ignore
    State.server = SERVERS[server_opt.value]
    load_favorite_list(State.server.name)

    overlay_info.slideshow.textContent = `${State.slideshow.speed}s 🍎`
    plate_video.volume = 0.3
    volume_bar.style.height = plate_video.volume * 100 + '%'
    volume_bar.parentElement!.style.display = 'none'
    timeline_bar.style.display = 'none'
    loading_bar.style.display = 'none'
    plate_zoomed.parentElement!.style.display = 'none'
}

export { setup_events }
