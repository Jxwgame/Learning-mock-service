import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import {
  isUserAuthenticated,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../core/api/permission";

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (to.meta.requiresAuth && !isUserAuthenticated()) {
    return next({
      name: "login",
      query: { redirect: to.fullPath },
    });
  }

  if (
    typeof to.meta.permission === "string" &&
    !hasPermission(to.meta.permission)
  ) {
    return next({ name: "forbidden" });
  }

  if (
    Array.isArray(to.meta.permissionsAny) &&
    !hasAnyPermission(to.meta.permissionsAny)
  ) {
    return next({ name: "forbidden" });
  }

  if (
    Array.isArray(to.meta.permissionsAll) &&
    !hasAllPermissions(to.meta.permissionsAll)
  ) {
    return next({ name: "forbidden" });
  }

  return next();
}
