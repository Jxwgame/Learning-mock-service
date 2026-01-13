module.exports = {
  repo: {
    userRoles: require("./repos/userRoles.repo"),
    rolePermissions: require("./repos/rolePermissions.repo"),
    permissions: require("./repos/permissions.repo"),
  },
  service: {
    query: require("./services/rbacQuery.service"),
    mutation: require("./services/rbac.service"),
  },
  policy: require("./policies/rbac.policy"),
};
