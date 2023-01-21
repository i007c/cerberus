import { loading_bar, plate_image } from 'elements'
import { zoom_redraw } from 'keybinding/utils'

var loader_http: XMLHttpRequest | null = null

type IL = (
    url: string,
    set: (link: string) => void,
    progress: (percentage: number) => void
) => XMLHttpRequest

const image_loader: IL = (url, set, progress) => {
    let http = new XMLHttpRequest()

    http.open('GET', url, true)
    http.responseType = 'arraybuffer'

    http.onload = function () {
        var blob = new Blob([this.response])
        set(URL.createObjectURL(blob))
    }

    http.onprogress = function (e) {
        progress((e.loaded / e.total) * 100)
    }

    http.onloadstart = function () {
        progress(0)
    }

    http.send()

    return http
}

function update_plate_image(url: string) {
    if (loader_http) loader_http.abort()

    // plate_image.src = EMPTY_IMAGE

    loader_http = image_loader(
        url,
        link => {
            loading_bar.style.display = 'none'
            loading_bar.style.width = '0%'
            plate_image.src = link
            zoom_redraw()
        },
        p => {
            loading_bar.style.display = ''
            loading_bar.style.width = `${p}%`
        }
    )
}

export { image_loader, update_plate_image }
