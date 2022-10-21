/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMaterialInput } from '../models/CreateMaterialInput'
import type { Material } from '../models/Material'
import type { MaterialGroupResponse } from '../models/MaterialGroupResponse'
import type { CreateMaterialGroupInput } from '../models/CreateMaterialGroupInput'
import type { UpdateMaterialGroupInput } from '../models/UpdateMaterialGroupInput'
import type { DeleteMaterialGroupInput } from '../models/DeleteMaterialGroupInput'
import { RequestService, RequestPlugin } from '@gopowerteam/request'

export class MaterialService {
  // 请求实例
  private request = RequestService.getInstance()

  /**
   * 创建素材
   */
  public createMaterial(
    requestBody: CreateMaterialInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Material[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取素材列表
   */
  public findMaterial(
    requestQuery: RequestQueryParams.FindMaterial,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Material[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material',
        method: 'get',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 删除素材
   */
  public deleteMaterialBatch(
    requestQuery: RequestQueryParams.DeleteMaterialBatch,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material',
        method: 'delete',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }

  /**
   * 获取素材分组
   */
  public findMaterialGroup(
    requestPlugins: RequestPlugin[] = []
  ): Promise<MaterialGroupResponse[]> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material/group',
        method: 'get'
      },
      requestPlugins
    )

    return result
  }

  /**
   * 创建素材分组
   */
  public createMaterialGroup(
    requestBody: CreateMaterialGroupInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Material> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material/group',
        method: 'post',
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 更新素材分组
   */
  public updateMaterialGroup(
    id: string,
    requestBody: UpdateMaterialGroupInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Material> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material/group/{id}',
        method: 'put',
        paramsPath: {
          id
        },
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 删除素材分组
   */
  public deleteMaterialGroup(
    id: string,
    requestBody: DeleteMaterialGroupInput,
    requestPlugins: RequestPlugin[] = []
  ): Promise<Material> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material/group/{id}',
        method: 'delete',
        paramsPath: {
          id
        },
        paramsBody: requestBody
      },
      requestPlugins
    )

    return result
  }

  /**
   * 修改素材分组
   */
  public changeGroupBatch(
    requestQuery: RequestQueryParams.ChangeGroupBatch,
    requestPlugins: RequestPlugin[] = []
  ): Promise<void> {
    // 请求数据
    const result = this.request.send(
      {
        path: '/api/admin/material/change-group',
        method: 'patch',
        paramsQuery: requestQuery
      },
      requestPlugins
    )

    return result
  }
}

namespace RequestQueryParams {
  export type FindMaterial = {
    group?: string
  }
  export type DeleteMaterialBatch = {
    ids?: string[]
  }
  export type ChangeGroupBatch = {
    ids?: string[]
  }
}
