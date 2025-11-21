import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { Ref } from 'vue'

type ApiErrorPayload = {
  message?: string
  statusCode?: number
  [key: string]: unknown
}

type NormalizedError = {
  statusCode: number
  message: string
  data?: ApiErrorPayload
}

const DEFAULT_TIMEOUT = 15_000

const createInstance = (overrides?: AxiosRequestConfig): AxiosInstance => {
  const runtimeConfig = useRuntimeConfig()
  const apiBase =
    typeof runtimeConfig.public?.apiBase === 'string'
      ? runtimeConfig.public.apiBase
      : undefined
  const baseURL = overrides?.baseURL ?? apiBase ?? 'http://10.17.2.3:4000/api/v1'

  const instance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...overrides,
  })

  instance.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError<ApiErrorPayload>) => {
      const normalizedError: NormalizedError = {
        statusCode: error.response?.status ?? 500,
        message:
          error.response?.data?.message ??
          error.message ??
          'Unexpected error has occurred',
        data: error.response?.data,
      }

      return Promise.reject(normalizedError)
    },
  )

  return instance
}

const attachAuthInterceptor = (
  instance: AxiosInstance,
  token: Ref<string | null>,
): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (token.value) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token.value}`
      }

      return config
    },
  )
}

type UseApiOptions = AxiosRequestConfig & {
  tokenCookieName?: string
}

export const useApi = (options?: UseApiOptions) => {
  const { tokenCookieName = 'auth_token', ...config } = options ?? {}
  const apiPublic = createInstance(config)
  const apiPrivate = createInstance(config)
  const token = useCookie<string | null>(tokenCookieName)

  attachAuthInterceptor(apiPrivate, token)

  return { apiPublic, apiPrivate }
}
