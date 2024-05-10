export type RequiredProperty<GType, GKey extends keyof GType> = GType & {
  [GProperty in GKey]: GType[GProperty];
}
