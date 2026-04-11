import type { NextFunction, Request, Response } from "express";
import type { UserService } from "./user.service";
import { HttpStatus } from "../../constants/http-status.constant";
import { validate } from "../../common/validate";
import { assignUserRoleDto } from "./user.dto";

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      next(error);
    }
  }

  assignUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = validate(assignUserRoleDto, req.body);
      const user = await this.userService.assignUserRole(data);
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  }
}