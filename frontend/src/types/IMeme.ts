export interface IMeme {
    id: string
    channel: string
    message: string
    fileName: string
    text: Record<'rus' | 'eng', string>
}
