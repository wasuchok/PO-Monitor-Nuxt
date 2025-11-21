export default defineNuxtRouteMiddleware((to) => {
  const authCookie = useCookie('po-auth')

  if (authCookie.value) return

  const redirectTo =
    to.fullPath && to.fullPath !== '/login' && to.fullPath !== '/'
      ? to.fullPath
      : undefined

  if (redirectTo) {
    return navigateTo({ path: '/login', query: { redirect: redirectTo } })
  }

  return navigateTo('/login')
})
