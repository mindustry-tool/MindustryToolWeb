import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';

@Injectable()
export class OctokitService extends Octokit {
  constructor(private readonly configService: ConfigService) {
    const githubPat = configService.get<string>('github.pat');
    super({
      auth: githubPat,
    });
  }
}
