import React, { FC } from 'react'

import './style/zoom.scss'

const Zoom: FC = () => {
    return <></>

    /* 
    const Post = useAtomValue(PostAtom)
    // const canvas = useRef<HTMLCanvasElement>(null)


    useEffect(() => {
        const video = document.querySelector<HTMLVideoElement>('video.main')!
        const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
        // const img = document.querySelector<HTMLImageElement>('img.main')
        if (!video || !canvas) throw new Error('error getting main video')

        // if (Post.type !== 'image' || !canvas.current) return

        canvas.width = video.videoWidth / 2
        canvas.height = video.videoHeight / 2

        const context = canvas.getContext('2d')!
        if (!context) throw new Error('error getting canvas context')

        // if (img.complete) {
        //     canvas.current.width = img.naturalWidth
        //     canvas.current.height = img.naturalHeight
        //     draw(canvas.current, context, img)
        // } else {
        //     img.onload = () => {
        //         if (!canvas.current) return
        //         canvas.current.width = img.naturalWidth
        //         canvas.current.height = img.naturalHeight
        //         draw(canvas.current, context, img)
        //     }
        // }

        function timerCallback() {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            if (video.paused || video.ended) {
                return
            }

            // const data = frame.data;

            setTimeout(timerCallback, 0)

            // timerCallback()
        }

        // setInterval(timerCallback, 1)

        // timerCallback()

        // video.addEventListener('timeupdate', timerCallback)
        video.addEventListener('play', timerCallback)
        video.addEventListener('timeupdate', () => {
            if (video.paused) timerCallback()
        })

        console.log(Post)
    }, [Post])


    // return (
    //     <div className='zoomed-container'>
    //         <canvas className='zoomed'></canvas>
    //     </div>
    // ) */
}

// type Source = HTMLImageElement | HTMLVideoElement
// function draw(
//     canvas: HTMLCanvasElement,
//     context: CanvasRenderingContext2D,
//     source: Source
// ) {
//     context.drawImage(
//         source,
//         0,
//         0,
//         canvas.width,
//         canvas.height,
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     )
// }

export { Zoom }
