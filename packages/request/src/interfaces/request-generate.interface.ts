export enum RequestGenerateType {
  Request = 'TO_REQUEST',
  URL = 'TO_URL',
}

export interface RequestGenerateOptions {
  type?: RequestGenerateType
}
