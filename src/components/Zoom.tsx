import React, { FC, RefObject, useEffect, useRef } from 'react'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ActionsAtom, GeneralAtom, PostAtom, ZoomAtom, ZoomModel } from 'state'

import './style/zoom.scss'

type Props = {
    source: RefObject<HTMLVideoElement | HTMLImageElement>
}

var AbortVideoRender: NodeJS.Timeout | null = null
var draw: DrawFunc = _ => console.log('not set')

const Zoom: FC<Props> = ({ source: src }) => {
    const [zoom, setZoom] = useAtom(ZoomAtom)
    const register = useSetAtom(ActionsAtom)
    const post = useAtomValue(PostAtom)
    const general = useAtomValue(GeneralAtom)
    const ref = useRef<HTMLCanvasElement>(null)
    const source = src.current
    let width = 0,
        height = 0

    if (source instanceof HTMLVideoElement) {
        width = source.videoWidth
        height = source.videoHeight
    } else if (source instanceof HTMLImageElement) {
        width = source.naturalWidth
        height = source.naturalHeight
    }

    useEffect(() => {
        register({
            change_zoom_speed: {
                title: 'change zoom speed',
                func: (_, args) => {
                    let speed = args[0]

                    setZoom(s => {
                        if (typeof speed !== 'number') return {}
                        if (!args[1]) {
                            speed = s.speed + speed
                        }

                        if (speed < 1) speed = 1

                        return { speed }
                    })
                },
            },
            change_zoom_level: {
                title: 'change zoom level',
                func: (_, args) => {
                    let level = args[0]

                    setZoom(s => {
                        if (typeof level !== 'number') return {}

                        if (!args[1]) {
                            level = s.level + level
                        }

                        draw({ ...s, level })

                        return { level }
                    })
                },
            },
        })
    }, [])

    const setPost = useSetAtom(PostAtom)

    useEffect(() => {
        setPost({ width, height })

        register({
            change_zoom_pos: {
                title: 'change zoom position',
                func: (_, args) => {
                    const axis = args[0]
                    const dir = args[1]

                    if (
                        (axis !== 'x' && axis !== 'y') ||
                        typeof dir !== 'number'
                    )
                        return

                    if (args[2]) {
                        setZoom(s => {
                            draw({ ...s, [axis]: dir })
                            return { [axis]: dir }
                        })

                        return
                    }

                    setZoom(s => {
                        let value = s[axis] + (dir * s.speed) / s.level

                        let max = 0
                        let min = 0

                        if (ref.current && axis === 'x') {
                            max = width - 20
                            min = (ref.current.width * -10) / s.level + 20
                        } else if (ref.current && axis === 'y') {
                            max = height - 20
                            min = (ref.current.height * -10) / s.level + 20
                        }

                        if (value < min) value = min
                        if (value > max) value = max

                        draw({ ...s, [axis]: value })

                        return {
                            [axis]: value,
                        }
                    })
                },
            },
            set_zoom_comic: {
                title: 'set zoom to comic view',
                func: () => {
                    setZoom(s => {
                        let x = 0
                        if (ref.current) x = -((ref.current.width - width) / 2)

                        draw({ ...s, level: 10, x })
                        return { level: 10, x }
                    })
                },
            },
        })
    }, [width, height])

    useEffect(() => {
        if (general.mode !== 'Z') {
            if (AbortVideoRender) {
                clearTimeout(AbortVideoRender)
                AbortVideoRender = null
            }
            draw = () => {}
            return
        }

        const canvas = ref.current

        if (!source || !canvas) return

        if (source instanceof HTMLImageElement) {
            draw = draw_image(source, canvas)
            setZoom({
                speed: Math.round(
                    (source.naturalWidth + source.naturalHeight) / 20
                ),
            })

            source.onload = () => {
                draw = draw_image(source, canvas)
                setZoom({
                    speed: Math.round(
                        (source.naturalWidth + source.naturalHeight) / 20
                    ),
                })
                draw(zoom)
            }
        } else {
            draw = draw_video(source, canvas)

            setZoom({
                speed: Math.round(
                    (source.videoWidth + source.videoHeight) / 20
                ),
            })

            source.onloadeddata = () => {
                draw = draw_video(source, canvas)
                setZoom({
                    speed: Math.round(
                        (source.videoWidth + source.videoHeight) / 20
                    ),
                })
                draw(zoom)
            }
        }

        draw(zoom)
    }, [post, source, general])

    if (post.type === 'null' || general.mode !== 'Z') return <></>

    return (
        <div className='zoomed-container'>
            <canvas ref={ref} className='zoomed'></canvas>
        </div>
    )
}

type DrawFunc = (state: ZoomModel) => void
type Draw<T> = (source: T, canvas: HTMLCanvasElement) => DrawFunc

const draw_image: Draw<HTMLImageElement> = (image, canvas) => {
    if (image.naturalWidth > image.naturalHeight) {
        canvas.width = (image.naturalHeight * 16) / 9
        canvas.height = image.naturalHeight
    } else {
        canvas.width = image.naturalWidth
        canvas.height = (image.naturalWidth * 9) / 16
    }

    const context = canvas.getContext('2d')!

    return state => {
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(
            image,
            state.x,
            state.y,
            (canvas.width * 10) / state.level,
            (canvas.height * 10) / state.level,
            0,
            0,
            canvas.width,
            canvas.height
        )
    }
}

const draw_video: Draw<HTMLVideoElement> = (video, canvas) => {
    if (video.videoWidth > video.videoHeight) {
        canvas.width = (video.videoHeight * 16) / 9
        canvas.height = video.videoHeight
    } else {
        canvas.width = video.videoWidth
        canvas.height = (video.videoWidth * 9) / 16
    }

    const context = canvas.getContext('2d')!

    return state => {
        if (AbortVideoRender) {
            clearTimeout(AbortVideoRender)
            AbortVideoRender = null
        }

        function timerCallback() {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(
                video,
                state.x,
                state.y,
                (canvas.width * 10) / state.level,
                (canvas.height * 10) / state.level,
                0,
                0,
                canvas.width,
                canvas.height
            )

            if (video.paused || video.ended || video.readyState !== 4) return

            AbortVideoRender = setTimeout(timerCallback, 1)
        }

        timerCallback()

        video.onplay = () => timerCallback()
        video.ontimeupdate = () => video.paused && timerCallback()
        video.onprogress = () => {
            if (AbortVideoRender) {
                clearTimeout(AbortVideoRender)
                AbortVideoRender = null
            }

            if (video.readyState === 4) timerCallback()
        }
    }
}

export { Zoom }
