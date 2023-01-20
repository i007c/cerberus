import { plate_context, plate_image, plate_zoomed } from 'elements'
import { State } from 'globals'

function draw() {
    plate_context.clearRect(0, 0, plate_zoomed.width, plate_zoomed.height)

    plate_context.drawImage(
        plate_image,
        State.zoom.x,
        State.zoom.y,
        (plate_zoomed.width * 10) / State.zoom.level,
        (plate_zoomed.height * 10) / State.zoom.level,
        0,
        0,
        plate_zoomed.width,
        plate_zoomed.height
    )
}

function update_zoom_pos(dir: 'x' | 'y', movement: number, dddd = true) {
    // if (State.zoom.level < 10) movement = movement * -1

    if (dir === 'x') {
        State.zoom.x += (movement * 10) / State.zoom.level

        const max_x = plate_image.naturalWidth - 20
        const min_x = (plate_zoomed.width * -10) / State.zoom.level + 20

        if (State.zoom.x < min_x) State.zoom.x = min_x
        if (State.zoom.x > max_x) State.zoom.x = max_x
    } else if (dir === 'y') {
        State.zoom.y += (movement * 10) / State.zoom.level

        const max_y = plate_image.naturalHeight - 20
        const min_y = (plate_zoomed.height * -10) / State.zoom.level + 20

        if (State.zoom.y < min_y) State.zoom.y = min_y
        if (State.zoom.y > max_y) State.zoom.y = max_y
    }

    if (dddd) draw()
}

function update_zoom_level(movement: number) {
    State.zoom.level += movement

    if (State.zoom.level < 1) State.zoom.level = 1

    update_zoom_pos('x', 0, false)
    update_zoom_pos('y', 0)
}

export { update_zoom_pos, update_zoom_level }
