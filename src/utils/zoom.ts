import { plate_context, plate_image, plate_zoomed } from 'elements'
import { State } from 'globals'

function draw() {
    plate_context.clearRect(0, 0, plate_zoomed.width, plate_zoomed.height)

    plate_context.drawImage(
        plate_image,
        State.zoom.x,
        State.zoom.y,
        plate_zoomed.width / State.zoom.level,
        plate_zoomed.height / State.zoom.level,
        0,
        0,
        plate_zoomed.width,
        plate_zoomed.height
    )
}

function update_zoom_pos(dir: 'x' | 'y', movement: number, dddd = true) {
    if (dir === 'x') {
        State.zoom.x += movement / State.zoom.level
        let max_x =
            plate_image.naturalWidth - plate_zoomed.width / State.zoom.level

        if (State.zoom.x < 0) State.zoom.x = 0

        if (State.zoom.x > max_x) State.zoom.x = max_x
    } else if (dir === 'y') {
        State.zoom.y += movement / State.zoom.level
        let max_y =
            plate_image.naturalHeight - plate_zoomed.height / State.zoom.level

        if (State.zoom.y < 0) State.zoom.y = 0

        if (State.zoom.y > max_y) State.zoom.y = max_y
    }

    if (dddd) draw()
}

function update_zoom_level(movement: number, set = false) {
    if (set) State.zoom.level = movement
    else State.zoom.level += movement

    if (State.zoom.level < 1) State.zoom.level = 1

    update_zoom_pos('x', 0, false)
    update_zoom_pos('y', 0)
}

export { update_zoom_pos, update_zoom_level }
