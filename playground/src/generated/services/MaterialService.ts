/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMaterialInput } from '../models/CreateMaterialInput'
import type { Material } from '../models/Material'
import type { MaterialGroupResponse } from '../models/MaterialGroupResponse'
import type { CreateMaterialGroupInput } from '../models/CreateMaterialGroupInput'
import type { UpdateMaterialGroupInput } from '../models/UpdateMaterialGroupInput'
import type { DeleteMaterialGroupInput } from '../models/DeleteMaterialGroupInput'
import {
  RequestService,
  RequestGenerateType,
  type RequestSendOptions,
  type RequestPlugin,
  type RequestGenerateOptions
} from '@gopowerteam/request'
export class MaterialService {
  // 请求实例
  private request = RequestService.getInstance()
  private service = ''

  private generateRequest(
    requestSendOptions: RequestSendOptions,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ) {
    switch (true) {
      case requestGenerateOptions?.type === RequestGenerateType.URL:
        // 生成URL
        return this.request.toURL(requestSendOptions, requestPlugins)
      default: {
        // 请求数据
        const result = this.request.send(requestSendOptions, requestPlugins)

        return result
      }
    }
  }

  /**
   * 创建素材
   */
  public createMaterial(
    requestBody: CreateMaterialInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createMaterial(
    requestBody: CreateMaterialInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material[]>
  public createMaterial(
    requestBody: CreateMaterialInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material',
      method: 'post',
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 获取素材列表
   */
  public findMaterial(
    requestQuery: RequestQueryParams.FindMaterial,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findMaterial(
    requestQuery: RequestQueryParams.FindMaterial,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material[]>
  public findMaterial(
    requestQuery: RequestQueryParams.FindMaterial,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material',
      method: 'get',
      paramsQuery: requestQuery
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 删除素材
   */
  public deleteMaterialBatch(
    requestQuery: RequestQueryParams.DeleteMaterialBatch,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteMaterialBatch(
    requestQuery: RequestQueryParams.DeleteMaterialBatch,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public deleteMaterialBatch(
    requestQuery: RequestQueryParams.DeleteMaterialBatch,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material',
      method: 'delete',
      paramsQuery: requestQuery
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 获取素材分组
   */
  public findMaterialGroup(
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public findMaterialGroup(
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<MaterialGroupResponse[]>
  public findMaterialGroup(
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<MaterialGroupResponse[]> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material/group',
      method: 'get'
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 创建素材分组
   */
  public createMaterialGroup(
    requestBody: CreateMaterialGroupInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public createMaterialGroup(
    requestBody: CreateMaterialGroupInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material>
  public createMaterialGroup(
    requestBody: CreateMaterialGroupInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material/group',
      method: 'post',
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 更新素材分组
   */
  public updateMaterialGroup(
    id: string,
    requestBody: UpdateMaterialGroupInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public updateMaterialGroup(
    id: string,
    requestBody: UpdateMaterialGroupInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material>
  public updateMaterialGroup(
    id: string,
    requestBody: UpdateMaterialGroupInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material/group/{id}',
      method: 'put',
      paramsPath: {
        id
      },
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 删除素材分组
   */
  public deleteMaterialGroup(
    id: string,
    requestBody: DeleteMaterialGroupInput,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public deleteMaterialGroup(
    id: string,
    requestBody: DeleteMaterialGroupInput,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material>
  public deleteMaterialGroup(
    id: string,
    requestBody: DeleteMaterialGroupInput,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<Material> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material/group/{id}',
      method: 'delete',
      paramsPath: {
        id
      },
      paramsBody: requestBody
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }

  /**
   * 修改素材分组
   */
  public changeGroupBatch(
    requestQuery: RequestQueryParams.ChangeGroupBatch,
    requestPlugins: RequestPlugin[],
    requestGenerateOptions: RequestGenerateOptions & {
      type: RequestGenerateType.URL
    }
  ): string
  public changeGroupBatch(
    requestQuery: RequestQueryParams.ChangeGroupBatch,
    requestPlugins?: RequestPlugin[],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void>
  public changeGroupBatch(
    requestQuery: RequestQueryParams.ChangeGroupBatch,
    requestPlugins: RequestPlugin[] = [],
    requestGenerateOptions?: RequestGenerateOptions
  ): Promise<void> | string {
    const requestSendOptions = {
      service: this.service,
      path: '/api/admin/material/change-group',
      method: 'patch',
      paramsQuery: requestQuery
    }

    return this.generateRequest(
      requestSendOptions,
      requestPlugins,
      requestGenerateOptions
    )
  }
}

namespace RequestQueryParams {
  export type FindMaterial = {
    /**
     * 分组ID
     */
    group?: string
  }
  export type DeleteMaterialBatch = {
    ids: string[]
  }
  export type ChangeGroupBatch = {
    ids: string[]
  }
}
