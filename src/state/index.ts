//
export * from './atoms/action'
export * from './atoms/general'
export * from './atoms/post'
export * from './atoms/zoom'
//
export * from './models/Action'
export * from './models/General'
export * from './models/Post'
export * from './models/Zoom'
export { SetArgs, get_data }
//

type SetArgs<T> = Partial<T> | ((s: T) => Partial<T>)

const get_data = <T>(args: SetArgs<T>, state: T): T => {
    if (typeof args === 'function') {
        let data = args(state)

        return { ...state, ...data }
    } else {
        return { ...state, ...args }
    }
}
