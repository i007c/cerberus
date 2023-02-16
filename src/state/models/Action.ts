type Arg = string | number | boolean
type ActionArgs = Arg[]
type ActionFunc = (e: KeyboardEvent, args: ActionArgs) => void

type Action = {
    title: string
    description?: string
    func: ActionFunc
}

type Actions = {
    [k: string]: Action
}

type KeyBind = [string, ActionArgs]

export {
    Actions as ActionsModel,
    Action as ActionModel,
    KeyBind as KeyBindModel,
    ActionArgs,
    ActionFunc,
}
