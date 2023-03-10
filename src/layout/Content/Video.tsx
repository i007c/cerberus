import React, { FC, RefObject, useEffect } from 'react'

import { useAtomValue } from 'jotai'
import { ActionsAtom } from 'state'

var volume_timeout: NodeJS.Timeout | null = null

type Props = {
    show: boolean
    file: string
    videoRef: RefObject<HTMLVideoElement>
    setState(args: {}): void
}

const Video: FC<Props> = ({ show, file, videoRef, setState }) => {
    useEffect(() => {
        if (!videoRef.current) return

        videoRef.current.volume = 0.2
    }, [videoRef])

    const Actions = useAtomValue(ActionsAtom)

    return (
        <video
            ref={videoRef}
            className='main'
            autoPlay
            src={show ? file : ''}
            style={{ display: show ? '' : 'none' }}
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
            onEnded={e => {
                if (!e.currentTarget.loop && Actions.content_movement) {
                    Actions.content_movement.func({} as KeyboardEvent, [+1])
                }
            }}
        ></video>
    )
}

export default Video
