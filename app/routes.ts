import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/notifications.tsx"),

  // User auth routes
  route("register", "routes/register.tsx"),
  route("login", "routes/login.tsx"),

  // Admin routes
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/send", "routes/admin/send.tsx"),
  route("admin/history", "routes/admin/history.tsx"),
] satisfies RouteConfig;
