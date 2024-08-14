import { SetMetadata } from "@nestjs/common";
import { Roles } from "src/common/database/Enums";

export const RolesDecorator = (...args: Roles[]) => SetMetadata("roles", args);
