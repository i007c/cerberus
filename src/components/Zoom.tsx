import './style/zoom.scss'
import { useAtomValue } from 'jotai'
import React, { FC, useEffect } from 'react'
import { PostAtom } from 'state'

const Zoom: FC = () => {
    const Post = useAtomValue(PostAtom)

    useEffect(() => {
        console.log(Post)
    }, [Post])

    return (
        <div className='zoomed-container'>
            <canvas className='zoomed'></canvas>
        </div>
    )
}

export { Zoom }
