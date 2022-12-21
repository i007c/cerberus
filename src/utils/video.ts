import { plate_video, timeline_bar } from 'elements'

function update_video_time(duration: number) {
    if (plate_video.readyState === 0) return
    let new_time = Math.max(plate_video.currentTime + duration, 0)
    new_time = Math.min(new_time, plate_video.duration)

    plate_video.currentTime = new_time
    let pr = (100 / plate_video.duration) * new_time
    timeline_bar.style.width = pr + '%'
}

export { update_video_time }
