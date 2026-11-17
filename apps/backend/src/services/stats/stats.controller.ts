import { Controller } from '@nestjs/common';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { StatsService } from './stats.service';

@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Route(api.v4.stats.visits)
  visits() {
    return routeHandler(api.v4.stats.visits, ({ query }) =>
      this.statsService.getVisitCounts(new Date(query.start), new Date(query.end)),
    );
  }
}
