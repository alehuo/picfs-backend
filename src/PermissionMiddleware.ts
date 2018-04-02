import * as express from "express";
import { hasPermissions } from "./PermissionUtils";
import IPermission from "./models/IPermission";

/**
 * Permission middleware.
 * @param req Express request.
 * @param res Express response.
 * @param next Express NextFunction
 */
export const PermissionMiddleware = (
  requiredPermissions: IPermission[]
) => async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Handle required permissions here.
  const token: any = res.locals.token;
  if (token) {
    const userData: object = token.data;
    const userPerms: number = token.data.permissions;
    if (hasPermissions(userPerms, requiredPermissions)) {
      next();
    } else {
      res.status(400).json({ error: "Unauthorized" });
    }
  } else {
    res.status(400).json({ error: "Invalid token" });
  }
};