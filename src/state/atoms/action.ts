import { atom } from 'jotai'
import { ActionArgs, ActionsModel } from 'state'

const Actions = atom<ActionsModel>({})

const get_movement = (args: ActionArgs): number => {
    return typeof args[0] === 'number' ? args[0] : 1
}

const ActionsAtom = atom(
    get => get(Actions),
    (get, set, args: ActionsModel) => {
        const actions = get(Actions)
        Object.keys(args).map(key => {
            if (actions[key]) {
                throw new Error(`key: ${key} is already in use.`)
            }
        })

        // let actions = get(Actions)

        // Object.entries(args).map(([key, new_value]) => {
        //     actions[key] = [...(actions[key] || []), ...new_value]
        // })

        set(Actions, { ...actions, ...args })
    }
)

export { ActionsAtom, get_movement }
