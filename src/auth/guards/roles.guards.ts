import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private refletor: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.refletor.get<string[]>('roles', context.getHandler())
        if (!roles) return true
        const request = context.switchToHttp().getRequest()
        const user = request.user

        return matchRoles(roles, user.roles)
    }
}

function matchRoles(roles, userRoles) {
    if (!roles.includes(userRoles)) return false
    return true
}