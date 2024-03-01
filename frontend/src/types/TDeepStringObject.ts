export type TDeepStringObject<T> = {
    [K in keyof T]: T[K] extends string
        ? string
        : T[K] extends Record<string, any>
            ? TDeepStringObject<T[K]>
            : never
}
