import React, {
    CSSProperties,
    FC,
    RefObject,
    useEffect,
    useRef,
    useState,
} from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import {
    ActionsAtom,
    GeneralAtom,
    get_movement,
    PostAtom,
    PostModel,
} from 'state'

import { Zoom } from 'components'

var volume_timeout: NodeJS.Timeout | null = null
var loader_http: XMLHttpRequest | null = null

const Content: FC = () => {
    const PostState = useAtomValue(PostAtom)
    // const GeneralState = useAtomValue(GeneralAtom)
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
        overlay_info: false,
        overlay_info_tags: false,
        image: '',
        loading: 0,
    })

    const setState = (args: Partial<typeof state>) =>
        updateState(s => ({ ...s, ...args }))

    useEffect(() => {
        register({
            toggle_video_playing: {
                title: 'toggle playing video',
                func: () => {
                    if (!video.current || !Post || Post.type !== 'video') return

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
                        !Post ||
                        Post.type !== 'video'
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
                    if (!video.current || !Post || Post.type !== 'video') return
                    video.current.volume = Math.min(
                        1,
                        Math.max(0, video.current.volume + get_movement(args))
                    )
                },
            },
            toggle_video_loop: {
                title: 'toggle video loop',
                func: () => {
                    if (!video.current || !Post || Post.type !== 'video') return
                    video.current.loop = !video.current.loop
                },
            },
            toggle_video_mute: {
                title: 'toggle video mute',
                func: () => {
                    if (!video.current || !Post || Post.type !== 'video') return
                    video.current.muted = !video.current.muted
                },
            },
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
        })
    }, [register])

    useEffect(() => {
        if (loader_http) loader_http.abort()
        if (!PostState || PostState.type === 'video') {
            setState({
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+Q8AAQ0BBYgRfXMAAAAASUVORK5CYII=',
                loading: 0,
            })
            return
        }

        let url =
            general.original || !!PostState.force_original
                ? PostState.file
                : PostState.sample

        loader_http = new XMLHttpRequest()

        loader_http.open('GET', url, true)
        loader_http.responseType = 'arraybuffer'

        loader_http.onload = function () {
            var blob = new Blob([this.response])
            setState({ loading: 0, image: URL.createObjectURL(blob) })
        }

        loader_http.onprogress = function (e) {
            setState({ loading: (e.loaded / e.total) * 100 })
        }

        loader_http.onloadstart = () => setState({ loading: 0 })

        loader_http.send()
    }, [PostState])

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
                {PostState && PostState.type === 'video' ? (
                    <VideoPlate
                        file={PostState.file}
                        videoRef={video}
                        setState={setState}
                    />
                ) : PostState ? (
                    <img ref={image} className='main' src={state.image} />
                ) : (
                    // <ImagePlate
                    //     file={PostState.file}
                    //     sample={PostState.sample}
                    //     imageRef={image}
                    //     original={
                    //
                    //     }
                    // />
                    <>None</>
                )}

                {state.show_volume && (
                    <div className='volume'>
                        <div
                            style={{
                                width: state.video_volume + '%',
                                backgroundColor: state.video_muted
                                    ? '#fd5e00'
                                    : '#fd0079',
                            }}
                        ></div>
                    </div>
                )}

                {PostState && PostState.type === 'video' && (
                    <div className='timeline'>
                        <div
                            style={{
                                width: state.video_timeline + '%',
                                backgroundColor: state.video_paused
                                    ? '#6E36CA'
                                    : '#0351c1',
                            }}
                        ></div>
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
                    post={PostState}
                />

                <div className='slideshow_bar' style={{ display: 'none' }}>
                    <div></div>
                </div>

                <Zoom />
            </div>
        </div>
    )
}

type VideoPlateProps = {
    file: string
    videoRef: RefObject<HTMLVideoElement>
    setState(args: {}): void
}

const VideoPlate: FC<VideoPlateProps> = ({ file, videoRef, setState }) => {
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

// type ImagePlateProps = {
//     file: string
//     sample: string
//     imageRef: RefObject<HTMLImageElement>
//     original: boolean
// }

// const ImagePlate: FC<ImagePlateProps> = ({
//     file,
//     sample,
//     imageRef,
//     original,
// }) => {
//     // const GeneralState = useAtomValue(GeneralAtom)
//     console.log(original)

//     return (
//     )
// }

type OverlayInfoProps = {
    show: boolean
    show_tags: boolean
    post: PostModel | null
}

const OverlayInfo: FC<OverlayInfoProps> = ({ show, show_tags, post }) => {
    const GeneralState = useAtomValue(GeneralAtom)
    const main_style: CSSProperties = {
        display: show ? '' : 'none',
        borderColor:
            GeneralState.original || (post && post.force_original)
                ? '#143fb4'
                : '#b40a1b',
    }

    return (
        <div className='overlay_info' style={main_style}>
            <div
                className='isr'
                style={{
                    flexDirection: show_tags ? 'column' : 'row',
                }}
            >
                {post ? (
                    <>
                        <span className='id'>
                            {post.id}
                            {post.is_favorite ? ' 🩷' : ''}
                        </span>
                        {post.score !== -1 && (
                            <span className='score'>{post.score}</span>
                        )}
                        <span className={'rating ' + post.rating}>
                            {post.rating}
                        </span>
                        <span className='index'>
                            {GeneralState.index + 1}/{GeneralState.posts.length}{' '}
                            | {GeneralState.page}
                        </span>
                        <span className='slideshow'>N/A</span>
                    </>
                ) : (
                    <>
                        <span className='id'>N/A</span>
                        <span className='score'>N/A</span>
                        <span className='rating'>N/A</span>
                        <span className='index'>N/A</span>
                        <span className='slideshow'>N/A</span>
                    </>
                )}
            </div>
            {post && post.parent && post.parent > 0 && (
                <span className='parent'>parent: {post.parent}</span>
            )}

            {show_tags && post && (
                <div className='tags'>
                    {post.tags.map(tag => (
                        <span
                            onClick={() => navigator.clipboard.writeText(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Content
