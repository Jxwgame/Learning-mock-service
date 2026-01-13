import "pinia";

declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | {
      key?: string;
      storage?: Storage;
      paths?: (keyof S)[];
      [k: string]: any;
    } | any;
  }
}