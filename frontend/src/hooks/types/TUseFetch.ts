type TData<GData> =
| {
    data: GData
    error: null
    status: number
    state: 'success'
}
| {
    data: null
    error: null
    status: null
    state: 'loading'
}
| {
    data: null
    error: Error
    status: number
    state: 'error'
}
| {
    data: null
    error: null
    status: null
    state: 'idle'
}

export type TUseFetch<GData> = TData<GData> & {
    isLoading: boolean
    isError: boolean
}
