import React, { FC } from 'react'

import { useAtomValue } from 'jotai'
import { PostAtom } from 'state'

import { Zoom } from 'components'

const Content: FC = () => {
    const Post = useAtomValue(PostAtom)

    return (
        <div className='content' tabIndex={0}>
            <div className='plate' tabIndex={0}>
                {Post.post.type === 'video' ? (
                    <video
                        className='main'
                        // autoPlay
                        src={Post.post.file}
                        controls
                    ></video>
                ) : (
                    <img className='main' src={Post.post.file} />
                )}

                <div className='volume' style={{ display: 'none' }}>
                    <div></div>
                </div>

                <div className='timeline' style={{ display: 'none' }}>
                    <div></div>
                </div>

                <div className='loading'>
                    <div></div>
                </div>

                <div className='overlay_info' style={{ display: 'none' }}>
                    <div className='isr'>
                        <span className='id'>N/A</span>
                        <span className='score'>N/A</span>
                        <span className='rating'>N/A</span>
                        <span className='index'>N/A</span>
                        <span className='slideshow'>N/A</span>
                    </div>
                    <span className='parent' style={{ display: 'none' }}>
                        parent: N/A
                    </span>
                    <div className='tags' style={{ display: 'none' }}></div>
                </div>

                <div className='slideshow_bar' style={{ display: 'none' }}>
                    <div></div>
                </div>

                <Zoom />
            </div>
        </div>
    )
}

export default Content
