import { Controller } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { api } from '@mindustry-tool/api';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  @Route(api.v4.verification.verify)
  verify() {
    return routeHandler(
      api.v4.verification.verify,
      ({ params, user }) => this.verifyService.update(params.itemType, params.id, user, 'verify'),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.verification.reject)
  reject() {
    return routeHandler(
      api.v4.verification.reject,
      ({ params, body, user }) => this.verifyService.update(params.itemType, params.id, user, 'reject', body?.reason),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.verification.reset)
  reset() {
    return routeHandler(
      api.v4.verification.reset,
      ({ params, user }) => this.verifyService.reset(params.itemType, params.id, user),
      {
        filter: true,
      },
    );
  }
}
