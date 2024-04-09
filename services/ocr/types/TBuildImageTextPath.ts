import { TMemeEntity } from "."

export type TBuildImageTextPath = (
  params: TMemeEntity & {
    photoId: string
  },
  language: string,
) => Promise<string>
