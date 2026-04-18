// @ts-ignore
/* eslint-disable */
import request from '@/request'

export async function addSiteTemplate(body: API.SiteTemplateAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/template/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function createTemplateFromApp(
  body: API.SiteTemplateCreateFromAppRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong>('/template/create/from-app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function getSiteTemplateVoById(
  params: API.getSiteTemplateVOByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseSiteTemplateVO>('/template/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

export async function listSiteTemplateVoByPage(
  body: API.SiteTemplateQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageSiteTemplateVO>('/template/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function updateSiteTemplate(
  body: API.SiteTemplateUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/template/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function updateSiteTemplateByAdmin(
  body: API.SiteTemplateAdminUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean>('/template/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

export async function deleteSiteTemplate(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/template/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
