import {
    loading_bar,
    local_file,
    overlay_info,
    plate,
    plate_video,
    plate_zoomed,
    server_opt,
    tags_input,
    timeline_bar,
    volume_bar,
} from 'elements'
import { SERVERS, State } from 'globals'
import { load_favorite_list, load_from_local, update_autocomplete } from 'utils'

var volume_timeout: NodeJS.Timeout | null = null

// const get_favs = async () =>
//     (await chrome.storage.local.get('favorite_lists')).favorite_lists
// switch (e.shiftKey && e.code) {
//     case 'KeyR':
//         e.preventDefault()
//         get_favs().then(list => {
//             console.log(list)
//             navigator.clipboard.writeText(JSON.stringify(list))
//         })
//         return
// }

function setup_events() {
    init()

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
        if (plate_video.src) volume_bar.parentElement!.style.display = ''

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
        timeline_bar.style.backgroundColor = '#6E36CA'
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
    loading_bar.style.display = 'none'
    plate_zoomed.parentElement!.style.display = 'none'
}

export { setup_events }
