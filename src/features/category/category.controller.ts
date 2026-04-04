import type { NextFunction, Request, Response } from "express";
import type { CategoryService } from "./category.service";
import { validate } from "../../common/validate";
import { createCategorySchema } from "./category.dto";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error)
    }
  }

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id as string);
      res.status(200).json(category);
    } catch (error) {
      next(error)
    }
  }

  createCategory = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const data = validate(createCategorySchema, req.body);
      const category = await this.categoryService.createCategroy(data);
      res.status(201).json(category);
    } catch (error) {
      next(error)
    }
  }

  updateCategory = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const data = validate(createCategorySchema, req.body);
      const category = await this.categoryService.updateCategory(req.params.id as string, data);
      res.status(200).json(category);
    } catch (error) {
      next(error)
    }
  }

  deleteCategory = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const category = await this.categoryService.deleteCategory(req.params.id as string);
      res.status(200).json(category);
    } catch (error) {
      next(error)
    }
  }
}