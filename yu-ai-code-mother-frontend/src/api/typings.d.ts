declare namespace API {
  type AppAddRequest = {
    initPrompt?: string
    templateId?: number
    customPrompt?: string
  }

  type AppAdminUpdateRequest = {
    id?: number
    appName?: string
    cover?: string
    priority?: number
  }

  type AppCommitVersionRequest = {
    appId?: number
    versionTitle?: string
    changeSummary?: string
    userPrompt?: string
  }

  type AppDeployRequest = {
    appId?: number
  }

  type AppFrontendVersionQueryRequest = {
    appId?: number
    pageNum?: number
    pageSize?: number
  }

  type AppRollbackVersionRequest = {
    versionId?: number
    rollbackReason?: string
  }

  type AppSetVersionStableRequest = {
    versionId?: number
    isStable?: number
  }

  type AppFrontendVersionDiffVO = {
    leftVersionId?: number
    rightVersionId?: number
    leftVersionNo?: number
    rightVersionNo?: number
    addedFiles?: string[]
    removedFiles?: string[]
    changedFiles?: string[]
  }

  type AppFrontendVersionFileDiffVO = {
    leftVersionId?: number
    rightVersionId?: number
    filePath?: string
    leftContent?: string
    rightContent?: string
  }

  type AppFrontendVersionVO = {
    id?: number
    appId?: number
    versionNo?: number
    versionTitle?: string
    changeSummary?: string
    userPrompt?: string
    codeGenType?: string
    sourceType?: string
    versionPath?: string
    metaPath?: string
    parentVersionNo?: number
    sourceVersionId?: number
    isStable?: number
    currentVersion?: boolean
    versionStatus?: string
    metaInfo?: Record<string, string>
    createdBy?: number
    createTime?: string
    updateTime?: string
  }

  type AppQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    priority?: number
    userId?: number
  }

  type AppUpdateRequest = {
    id?: number
    appName?: string
  }

  type AppVO = {
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    templateId?: number
    codeGenType?: string
    deployKey?: string
    deployedTime?: string
    priority?: number
    userId?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
  }

  type BaseResponseAppFrontendVersionDiffVO = {
    code?: number
    data?: AppFrontendVersionDiffVO
    message?: string
  }

  type BaseResponseAppFrontendVersionFileDiffVO = {
    code?: number
    data?: AppFrontendVersionFileDiffVO
    message?: string
  }

  type BaseResponseAppFrontendVersionVO = {
    code?: number
    data?: AppFrontendVersionVO
    message?: string
  }

  type BaseResponseAppVO = {
    code?: number
    data?: AppVO
    message?: string
  }

  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponsePageAppFrontendVersionVO = {
    code?: number
    data?: PageAppFrontendVersionVO
    message?: string
  }

  type BaseResponsePageAppVO = {
    code?: number
    data?: PageAppVO
    message?: string
  }

  type BaseResponsePageChatHistory = {
    code?: number
    data?: PageChatHistory
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseSiteTemplateVO = {
    code?: number
    data?: SiteTemplateVO
    message?: string
  }

  type BaseResponsePageSiteTemplateVO = {
    code?: number
    data?: PageSiteTemplateVO
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type ChatHistory = {
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ChatHistoryQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    lastCreateTime?: string
  }

  type chatToGenCodeParams = {
    appId: number
    message: string
  }

  type DeleteRequest = {
    id?: number
  }

  type downloadAppCodeParams = {
    appId: number
  }

  type getAppFrontendVersionDiffParams = {
    leftVersionId: number
    rightVersionId: number
  }

  type getAppFrontendVersionFileDiffParams = {
    leftVersionId: number
    rightVersionId: number
    filePath: string
  }

  type getAppFrontendVersionVOByIdParams = {
    versionId: number
  }

  type getAppVOByIdByAdminParams = {
    id: number
  }

  type getAppVOByIdParams = {
    id: number
  }

  type getUserByIdParams = {
    id: number
  }

  type getUserVOByIdParams = {
    id: number
  }

  type getSiteTemplateVOByIdParams = {
    id: number
  }

  type listAppChatHistoryParams = {
    appId: number
    pageSize?: number
    lastCreateTime?: string
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    updateTime?: string
  }

  type PageAppFrontendVersionVO = {
    records?: AppFrontendVersionVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageAppVO = {
    records?: AppVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageChatHistory = {
    records?: ChatHistory[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageSiteTemplateVO = {
    records?: SiteTemplateVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type SiteTemplateAddRequest = {
    name?: string
    description?: string
    cover?: string
    category?: string
    initPrompt?: string
    codeGenType?: string
    templateSource?: string
    sourceAppId?: number
    isPublic?: number
  }

  type SiteTemplateCreateFromAppRequest = {
    appId?: number
    name?: string
    description?: string
    cover?: string
    category?: string
    isPublic?: number
  }

  type SiteTemplateAdminUpdateRequest = {
    id?: number
    isPublic?: number
  }

  type SiteTemplateQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    name?: string
    category?: string
    codeGenType?: string
    templateSource?: string
    userId?: number
    isPublic?: number
    searchText?: string
  }

  type SiteTemplateUpdateRequest = {
    id?: number
    name?: string
    description?: string
    cover?: string
    category?: string
    isPublic?: number
  }

  type SiteTemplateVO = {
    id?: number
    name?: string
    description?: string
    cover?: string
    category?: string
    initPrompt?: string
    codeGenType?: string
    templateSource?: string
    sourceAppId?: number
    userId?: number
    isPublic?: number
    useCount?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
  }

  type ServerSentEventString = true

  type serveStaticResourceParams = {
    deployKey: string
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    userName?: string
    userAccount?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    pageNum?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    userPassword?: string
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
  }
}