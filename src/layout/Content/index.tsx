import React, { FC, useEffect, useRef, useState } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { ActionsAtom, GeneralAtom, get_movement, PostAtom } from 'state'

import { Zoom } from 'components'

import { OverlayInfo } from './OverlayInfo'
import VideoPlate from './Video'

var loader_http: XMLHttpRequest | null = null

type BufferType = {
    left: string
    right: string
}

const Content: FC = () => {
    const post = useAtomValue(PostAtom)
    const general = useAtomValue(GeneralAtom)
    const register = useSetAtom(ActionsAtom)

    const video = useRef<HTMLVideoElement>(null)
    const image = useRef<HTMLImageElement>(null)
    const plate = useRef<HTMLDivElement>(null)

    const [state, updateState] = useState({
        video_timeline: 0,
        video_volume: 0,
        video_muted: false,
        video_paused: false,
        show_volume: false,
        show_timeline: true,
        overlay_info: false,
        overlay_info_tags: false,
        image: '',
        loading: 0,
        buffers: [] as BufferType[],
    })

    const setState = (args: Partial<typeof state>) =>
        updateState(s => ({ ...s, ...args }))

    const updateBuffers = (V: HTMLVideoElement) => {
        if (V.readyState < 3) return

        const inc = 100 / V.duration

        let bb: BufferType[] = []

        for (let i = 0; i < V.buffered.length; i++) {
            const StartX = V.buffered.start(i) * inc
            const EndX = 100 - V.buffered.end(i) * inc

            bb.push({ left: `${StartX}%`, right: `${EndX}%` })
        }

        setState({ buffers: bb })
    }

    useEffect(() => {
        if (!video.current) return

        let upt = setInterval(() => {
            updateBuffers(video.current!)
        }, 1000)

        return () => {
            clearInterval(upt)
        }
    }, [video])

    useEffect(() => {
        register({
            toggle_fullscreen: {
                title: 'toggle plate fullscreen',
                func: () => {
                    if (!plate.current) return
                    if (document.fullscreenElement === plate.current) {
                        document.exitFullscreen()
                    } else {
                        plate.current.requestFullscreen()
                    }
                },
            },
            toggle_overlay_info: {
                title: 'toggle overlay info',
                func: () => {
                    updateState(s => ({ ...s, overlay_info: !s.overlay_info }))
                },
            },
            toggle_overlay_info_tags: {
                title: 'toggle overlay info tags',
                func: () => {
                    updateState(s => ({
                        ...s,
                        overlay_info_tags: !s.overlay_info_tags,
                    }))
                },
            },
            toggle_timeline: {
                title: 'toggle timeline',
                func: () => {
                    updateState(s => ({
                        ...s,
                        show_timeline: !s.show_timeline,
                    }))
                },
            },
        })
    }, [])

    useEffect(() => {
        register({
            toggle_video_playing: {
                title: 'toggle playing video',
                func: () => {
                    if (!video.current || post.type !== 'video') return

                    if (video.current.paused) video.current.play()
                    else video.current.pause()
                },
            },
            update_video_time: {
                title: 'update video time',
                func: (_, args) => {
                    if (
                        !video.current ||
                        video.current.readyState === 0 ||
                        post.type !== 'video'
                    )
                        return

                    const update = get_movement(args)
                    const duration = video.current.duration
                    const new_time = Math.min(
                        Math.max(0, video.current.currentTime + update),
                        duration
                    )

                    video.current.currentTime = new_time

                    setState({
                        video_timeline: (100 / duration) * new_time,
                    })
                },
            },
            change_video_volume: {
                title: 'change video volume',
                func: (_, args) => {
                    if (!video.current || post.type !== 'video') return
                    video.current.volume = Math.min(
                        1,
                        Math.max(0, video.current.volume + get_movement(args))
                    )
                },
            },
            toggle_video_loop: {
                title: 'toggle video loop',
                func: () => {
                    if (!video.current || post.type !== 'video') return
                    video.current.loop = !video.current.loop
                },
            },
            toggle_video_mute: {
                title: 'toggle video mute',
                func: () => {
                    if (!video.current || post.type !== 'video') return
                    video.current.muted = !video.current.muted
                },
            },
        })

        if (loader_http) loader_http.abort()
        if (post.type === 'video') {
            setState({
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+Q8AAQ0BBYgRfXMAAAAASUVORK5CYII=',
                loading: 0,
            })
            return
        }

        let url =
            general.original || !!post.force_original ? post.file : post.sample

        loader_http = new XMLHttpRequest()

        loader_http.open('GET', url, true)
        loader_http.responseType = 'arraybuffer'

        loader_http.onload = function () {
            //            let frames = [] as ParsedFrame[]
            //
            //            if (post.ext === 'gif') {
            //                frames = decompressFrames(parseGIF(this.response), true)
            //            }

            var blob = new Blob([this.response])
            setState({
                loading: 0,
                image: URL.createObjectURL(blob),
            })
        }

        loader_http.onprogress = function (e) {
            setState({ loading: (e.loaded / e.total) * 100 })
        }

        loader_http.onloadstart = () => setState({ loading: 0 })

        loader_http.send()
    }, [post])

    return (
        <div className='content' tabIndex={0}>
            <div
                ref={plate}
                className='plate'
                tabIndex={0}
                onBlur={e => {
                    if (document.fullscreenElement === e.currentTarget) {
                        e.currentTarget.focus()
                    }
                }}
            >
                <VideoPlate
                    show={post.type === 'video'}
                    file={post.file}
                    videoRef={video}
                    setState={setState}
                />

                {post.type === 'image' && state.image && (
                    <img ref={image} className='main' src={state.image} />
                )}

                {state.show_volume && (
                    <div className='volume'>
                        <div
                            style={{
                                height: state.video_volume + '%',
                                backgroundColor: state.video_muted
                                    ? '#fd5e00'
                                    : '#fd0079',
                            }}
                        ></div>
                    </div>
                )}

                {post.type === 'video' && state.show_timeline && (
                    <div className='timeline'>
                        <div
                            style={{
                                width: state.video_timeline + '%',
                                backgroundColor: state.video_paused
                                    ? '#6E36CA'
                                    : '#0351c1',
                            }}
                        ></div>

                        <div className='buffer-container'>
                            {state.buffers.map(({ left, right }, index) => (
                                <div
                                    className='buffer'
                                    key={index}
                                    style={{ left: left, right: right }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}

                {state.loading !== 0 && (
                    <div className='loading'>
                        <div
                            style={{
                                width: state.loading + '%',
                            }}
                        ></div>
                    </div>
                )}

                <OverlayInfo
                    show={state.overlay_info}
                    show_tags={state.overlay_info_tags}
                    video={video.current}
                />

                <Zoom
                    source={post.type === 'video' ? video : image}
                    gif_frames={[]}
                />
            </div>
        </div>
    )
}

export default Content
