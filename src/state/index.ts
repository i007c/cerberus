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

const get_data = <T>(args: SetArgs<T>, state: T): T => {
    if (typeof args === 'function') {
        let data = {}
        let result = args(state)

        if (result instanceof Promise) {
            result.then(v => (data = v))
        } else {
            data = result
        }

        return { ...state, ...data }
    } else {
        return { ...state, ...args }
    }
}
