export type SplitString<GString extends string, GDelimiter extends string> =
  string extends GString ? string[] :
    GString extends '' ? [] :
      GString extends `${infer GType}${GDelimiter}${infer GRest}` ? [GType, ...SplitString<GRest, GDelimiter>] :
        [GString]
