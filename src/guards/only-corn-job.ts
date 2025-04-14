import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class OnlyCronJobGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization;

        if (!auth || auth !== process.env.CRON_JOB_SECRET) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
