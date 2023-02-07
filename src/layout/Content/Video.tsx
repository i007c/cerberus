import React, { FC, RefObject } from 'react'

var volume_timeout: NodeJS.Timeout | null = null

type Props = {
    file: string
    videoRef: RefObject<HTMLVideoElement>
    setState(args: {}): void
}

const Video: FC<Props> = ({ file, videoRef, setState }) => {
    return (
        <video
            ref={videoRef}
            className='main'
            // autoPlay
            src={file}
            onVolumeChange={e => {
                if (volume_timeout) clearTimeout(volume_timeout)

                setState({
                    show_volume: true,
                    video_volume: e.currentTarget.volume * 100,
                    video_muted: e.currentTarget.muted,
                })

                volume_timeout = setTimeout(() => {
                    setState({ show_volume: false })
                }, 1000)
            }}
            onTimeUpdate={e => {
                setState({
                    video_timeline:
                        (100 / e.currentTarget.duration) *
                        e.currentTarget.currentTime,
                })
            }}
            onPlay={e => {
                setState({
                    video_paused: false,
                    video_timeline:
                        (100 / e.currentTarget.duration) *
                        e.currentTarget.currentTime,
                })
            }}
            onPause={e => {
                setState({
                    video_paused: true,
                    video_timeline:
                        (100 / e.currentTarget.duration) *
                        e.currentTarget.currentTime,
                })
            }}
        ></video>
    )
}

export default Video
