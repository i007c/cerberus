//
export * from './atoms/action'
export * from './atoms/general'
export * from './atoms/post'
export * from './atoms/slideshow'
export * from './atoms/zoom'
//
export * from './models/Action'
export * from './models/General'
export * from './models/Post'
export * from './models/SlideShow'
export * from './models/Zoom'
export { SetArgs, get_data }
//

type SetArgs<T> = Partial<T> | ((s: T) => Partial<T> | Promise<Partial<T>>)

const get_data = async <T>(args: SetArgs<T>, state: T): Promise<T> => {
    if (typeof args === 'function') {
        let data = {}
        let result = args(state)

        if (result instanceof Promise) {
            data = await result
        } else {
            data = result
        }

        return { ...state, ...data }
    } else {
        return { ...state, ...args }
    }
}
