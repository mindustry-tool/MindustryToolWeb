import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { z } from 'zod/v4-mini';
import { createCrashSchema, crashQuerySchema, updateCrashSchema } from '@mindustry-tool/api';
import { Prisma } from '@/generated/prisma/client';
import * as crypto from 'crypto';

import { ModCatalogService } from './mod-catalog.service';

@Injectable()
export class CrashService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private modCatalogService: ModCatalogService,
  ) {}

  parseCrash(content: string): {
    mod: string | null;
    modName: string | null;
    message: string;
    cause: string;
    stacktrace: string;
  } {
    if (content.startsWith('Ohno, the game has crashed')) {
      return {
        mod: 'foo-client',
        modName: 'Foo client',
        message: '',
        cause: '',
        stacktrace: content,
      };
    }
    const regex =
      /The mod\s+'(?<modName>.+)'\s+\((?<modId>[^)]+)\).+\r?\n(?<message>[\s\S]*?)(?:\r?\n){2,}(?<stacktrace>[\s\S]+$)/;

    const match = content.match(regex);

    if (!match || !match.groups) {
      const index = content.indexOf('\n\n');

      if (index === -1) {
        const isSolim = content.includes('solim.');
        return {
          mod: isSolim ? 'solim' : 'no-mod-detected',
          modName: isSolim ? 'Solim' : 'No mod detected',
          message: 'Invalid crash report format.',
          cause: '',
          stacktrace: content,
        };
      }

      const message = content.substring(0, index);
      const fullstacktrace = content.substring(index + 2);
      const causeIndex = fullstacktrace.indexOf('\n');
      const cause = causeIndex !== -1 ? fullstacktrace.substring(0, causeIndex) : '';
      const stacktrace = causeIndex !== -1 ? fullstacktrace.substring(causeIndex + 1) : fullstacktrace;

      const isSolim = fullstacktrace.includes('solim.');
      return {
        mod: isSolim ? 'solim' : 'no-mod-detected',
        modName: isSolim ? 'Solim' : 'No mod detected',
        message,
        cause,
        stacktrace,
      };
    }

    const { modId, modName, message, stacktrace: fullstacktrace } = match.groups;
    const causeIndex = fullstacktrace.indexOf('\n');
    const cause = causeIndex !== -1 ? fullstacktrace.substring(0, causeIndex) : '';
    const stacktrace = causeIndex !== -1 ? fullstacktrace.substring(causeIndex + 1) : fullstacktrace;

    return {
      mod: modId,
      modName,
      message,
      stacktrace,
      cause,
    };
  }

  async create(body: z.infer<typeof createCrashSchema>, ip: string) {
    const cacheKey = `crash_limit:${ip}`;
    const isRateLimited = await this.cacheManager.get(cacheKey);

    if (isRateLimited) {
      throw new BadRequestException('You can only post one crash report per minute.');
    }

    await this.cacheManager.set(cacheKey, true, 60000);

    const parsed = this.parseCrash(body.content);

    if (!parsed.stacktrace) {
      throw new BadRequestException('Invalid crash report format: ' + body.content);
    }

    if (parsed.mod) {
      await this.prismaService.crashedMod.upsert({
        where: { id: parsed.mod },
        create: {
          id: parsed.mod,
          name: parsed.modName,
          createdAt: new Date(),
        },
        update: {
          name: parsed.modName,
          updatedAt: new Date(),
        },
      });
    }

    const computedFingerprint = fingerprint(parsed.stacktrace, parsed.mod, parsed.cause);

    const existing = await this.prismaService.crashReport.findFirst({
      where: {
        mod: parsed.mod,
        fingerprint: computedFingerprint,
      },
      select: { id: true },
    });

    if (existing) {
      return await this.prismaService.crashReport.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          updatedAt: new Date(),
        },
      });
    }

    const content = body.content;

    for (let i = 0; i < Math.ceil(content.length / 1800); i++) {
      const data = content.substring(i * 1800, (i + 1) * 1800);

      fetch(
        'https://discord.com/api/webhooks/1469745185201324267/Ay7FCL_KSVqHHGUxPRaYPOU-cvcpRQYnIaIj1E81IpW7EtaUlut1vcrDfG6m8Tzu8hIZ',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: '`' + data.replaceAll('`', '') + '`',
          }),
          signal: AbortSignal.timeout(5000),
        },
      ).catch((err) => console.error(err));
    }

    return await this.prismaService.crashReport.create({
      data: {
        mod: parsed.mod,
        message: parsed.message,
        stacktrace: parsed.stacktrace,
        cause: parsed.cause,
        fingerprint: computedFingerprint,
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(query: z.infer<typeof crashQuerySchema>) {
    const { page, size, status, mod, sort = 'last_seen', order = 'desc' } = query;

    const where: Prisma.CrashReportWhereInput = {
      status: status === 'ALL' ? undefined : status,
      mod: mod ? { contains: mod } : undefined,
    };

    const sortField = sort === 'first_created' ? 'createdAt' : sort === 'count' ? 'count' : 'updatedAt';

    const items = await this.prismaService.crashReport.findMany({
      where,
      skip: page * size,
      take: size,
      orderBy: { [sortField]: order },
      include: {
        crashedMod: true,
      },
    });

    return items.map((item) => {
      const modInfo = this.modCatalogService.getMod(item.mod, item.crashedMod?.name);
      return {
        ...item,
        modName: modInfo.name ?? item.crashedMod?.name ?? null,
        modInfo,
      };
    });
  }

  async count(query: z.infer<typeof crashQuerySchema>) {
    const { status, mod } = query;

    const where: Prisma.CrashReportWhereInput = {
      status: status === 'ALL' ? undefined : status,
      mod: mod ? { contains: mod } : undefined,
    };

    return await this.prismaService.crashReport.count({
      where,
    });
  }

  async findMods(query: { page: number; size: number }) {
    const { page, size } = query;

    const results = await this.prismaService.crashedMod.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        crashes: {
          select: {
            count: true,
          },
          where: {
            status: 'PENDING',
          },
        },
      },
      skip: page * size,
      take: size,
    });

    return results.map((mod) => {
      const info = this.modCatalogService.getMod(mod.id, mod.name);
      return {
        mod: mod.id,
        modName: info.name ?? mod.name,
        pendingCount: mod.crashes.reduce((sum, crash) => sum + crash.count, 0),
        iconUrl: info.iconUrl,
        repo: info.repo,
        author: info.author,
        description: info.description,
        stars: info.stars,
        version: info.version,
        minGameVersion: info.minGameVersion,
        lastUpdated: info.lastUpdated,
      };
    });
  }

  async countMods() {
    return await this.prismaService.crashedMod.count();
  }

  async get(id: string) {
    const item = await this.prismaService.crashReport.findUniqueOrThrow({
      where: { id },
      include: {
        crashedMod: true,
      },
    });

    const modInfo = this.modCatalogService.getMod(item.mod, item.crashedMod?.name);

    return {
      ...item,
      modName: modInfo.name ?? item.crashedMod?.name ?? null,
      modInfo,
    };
  }

  async getModInfo(mod: string) {
    return this.modCatalogService.getMod(mod);
  }

  async update(id: string, body: z.infer<typeof updateCrashSchema>, userId: string) {
    return await this.prismaService.crashReport.update({
      where: { id },
      data: {
        status: body.status,
        updatedBy: userId,
      },
    });
  }
}

export function extractRootCause(stack: string): {
  exception: string;
  message: string;
} {
  const matches = [...stack.matchAll(/Caused by:\s+([\w.$]+)(?:: (.*))?/g)];

  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    return {
      exception: last[1],
      message: last[2] ?? '',
    };
  }

  const first = stack.split('\n')[0];
  const m = first.match(/^([\w.$]+)(?:: (.*))?/);

  return {
    exception: m?.[1] ?? 'UnknownException',
    message: m?.[2] ?? '',
  };
}

export function isSyntheticFrame(frame: string): boolean {
  return (
    frame.includes('$$ExternalSyntheticLambda') ||
    frame.includes('$r8$lambda$') ||
    frame.includes('$$SyntheticClass') ||
    frame.includes('D8$$SyntheticClass')
  );
}

export function parseFrames(stack: string): string[] {
  return stack
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('at '))
    .map((l) => l.replace(/^at\s+/, ''))
    .filter((f) => !isSyntheticFrame(f));
}

const IGNORED_PREFIXES = ['java.', 'javax.', 'sun.', 'android.', 'arc.', 'mindustry.'];
const RUNTIME_ONLY_PREFIXES = ['java.', 'javax.', 'sun.', 'android.'];

export function filterFrames(frames: string[]): string[] {
  const modFrames = frames.filter((f) => !IGNORED_PREFIXES.some((prefix) => f.startsWith(prefix)));
  if (modFrames.length > 0) {
    return modFrames;
  }
  return frames.filter((f) => !RUNTIME_ONLY_PREFIXES.some((prefix) => f.startsWith(prefix)));
}

export function normalizeFrame(frame: string): string {
  let f = frame
    .replace(/:\d+/g, '') // remove line numbers
    .replace(/\(.*\)/g, '') // remove file info
    .trim();

  // Strip Android D8 desugaring package suffixes
  f = f.replace(/\$(?:mindustrytool|betamindy|newhorizon|[a-z0-9_-]+)$/i, '');
  // Normalize lambda numbering so minor index changes don't diverge fingerprints
  f = f.replace(/lambda\$([a-zA-Z0-9_$]+?)\$\d+/g, 'lambda$$$1');
  f = f.replace(/lambda\$\d+/g, 'lambda');

  return f.trim();
}

export function normalizeMessage(exception: string, rawMessage: string): string {
  if (!rawMessage) return '';
  let msg = cleanWrapperNoise(rawMessage.trim());

  // Strip Android APK dynamic install paths and declaration wrappers
  msg = msg.replace(/\(declaration of '[^']+' appears in [^)]+\)/g, '');
  msg = msg.replace(/\/data\/app\/[^\s)]+/g, '');
  msg = msg.replace(/[a-zA-Z]:\\[^\s)]+/g, '');

  if (exception.includes('NoSuchMethodError') || exception.includes('NoSuchMethodException')) {
    const artMatch = msg.match(
      /No (?:virtual|static|direct|interface) method (\w+)\(.*?\).*? in class L?([a-zA-Z0-9_$/]+);?/i,
    );
    if (artMatch) {
      const methodName = artMatch[1];
      const className = artMatch[2].replace(/\//g, '.');
      return `NoSuchMethod:${className}.${methodName}`;
    }
    const jvmMatch = msg.match(/['"]?(?:[\w.$<>\[\]]+\s+)?([a-zA-Z0-9_$.]+)\.([a-zA-Z0-9_$]+)\s*(?:\(|\[)/);
    if (jvmMatch) {
      const className = jvmMatch[1];
      const methodName = jvmMatch[2];
      return `NoSuchMethod:${className}.${methodName}`;
    }
  }

  if (exception.includes('NoSuchFieldError')) {
    const artFieldMatch = msg.match(
      /No (?:instance|static)?\s*field (\w+) of type .*? in class L?([a-zA-Z0-9_$/]+);?/i,
    );
    if (artFieldMatch) {
      return `NoSuchField:${artFieldMatch[2].replace(/\//g, '.')}.${artFieldMatch[1]}`;
    }
    const jvmFieldMatch = msg.match(/Class ([a-zA-Z0-9_$.]+) does not have (?:member )?field ['"]?(\w+)['"]?/i);
    if (jvmFieldMatch) {
      return `NoSuchField:${jvmFieldMatch[1]}.${jvmFieldMatch[2]}`;
    }
  }

  if (exception.includes('NullPointerException')) {
    const artNpeMatch = msg.match(
      /Attempt to invoke \w+ method '.*? ([a-zA-Z0-9_$.]+)\.([a-zA-Z0-9_$]+)\(.*?\)' on a null/i,
    );
    if (artNpeMatch) {
      return `NPE:${artNpeMatch[1]}.${artNpeMatch[2]}`;
    }
    const jvmNpeMatch = msg.match(/Cannot invoke ['"]?([a-zA-Z0-9_$.]+)\.([a-zA-Z0-9_$]+)\(.*?\)/i);
    if (jvmNpeMatch) {
      return `NPE:${jvmNpeMatch[1]}.${jvmNpeMatch[2]}`;
    }
  }

  return msg
    .replace(/#\d+/g, '') // remove line numbers in script files (e.g. script.js#123)
    .replace(/.*/g, (s) => s.split(/[/\\]/).pop() || '') // strip path -> filename
    .replace(/[0-9a-f-]{36}/gi, '') // remove UUID
    .replace(/\b\d+\b/g, '') // remove standalone numbers
    .replace(/\S+@\S+/g, '') // remove emails
    .trim();
}

export function cleanWrapperNoise(message: string): string {
  return message.replace(/^(arc\.util\.ArcRuntimeException:\s*)+/i, '');
}

export function buildFingerprint(stack: string, modId?: string | null, cause?: string): string {
  return fingerprint(stack, modId, cause);
}

export function fingerprint(stack: string, modId?: string | null, cause?: string): string {
  const fullText = cause && cause.trim().length > 0 ? cause.trim() + '\n' + stack.trim() : stack.trim();
  const framesRaw = parseFrames(fullText);
  const frames = filterFrames(framesRaw).map(normalizeFrame);

  const root = extractRootCause(fullText);
  const message = normalizeMessage(root.exception, root.message);

  const effectiveMod = modId ?? 'unknown';
  const raw = [effectiveMod, root.exception, message, ...frames.slice(0, 3)].join('|');

  return crypto.createHash('sha256').update(raw).digest('hex');
}
