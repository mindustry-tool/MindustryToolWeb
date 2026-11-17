import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery, ApiResult } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class WikiService {
  constructor(
    private prisma: PrismaService,
    private cache: Cache,
  ) {}
  async create(createWikiDto: ApiBody<typeof api.v4.wiki.create>, session: Session) {
    const result = await this.prisma.wiki.create({
      data: {
        ...createWikiDto,
        createdBy: session.id,
        createdAt: new Date(),
      },
    });

    return { ...result, posts: [] };
  }

  async link(id: string, linkWikiDto: ApiBody<typeof api.v4.wiki.linkPost>) {
    const result = await this.prisma.wikiLink.create({
      data: {
        wikiId: id,
        ...linkWikiDto,
      },
    });

    return result;
  }

  async view(query: ApiQuery<typeof api.v4.wiki.view>): Promise<ApiResult<typeof api.v4.wiki.view>> {
    const { language } = query;
    const cacheKey = `wiki:view:${language}`;

    const cacheData = await this.cache.get<ApiResult<typeof api.v4.wiki.view>>(cacheKey);

    if (cacheData) {
      return cacheData;
    }

    const result: ApiResult<typeof api.v4.wiki.view> = await this.prisma.$queryRaw`    
        SELECT 
          "Wiki".*,
          json_build_object(
              'id', "Post"."id",
              'title', "Post"."title",
              'summary', "Post"."summary",
              'status', "Post"."status",
              'verificationStatus', "Post"."verificationStatus",
              'language', "Post"."language",
              'cover', "Post"."cover",
              'verifierId', "Post"."verifierId",
              'postType', "Post"."postType",
              'createdAt', "Post"."createdAt",
              'updatedAt', "Post"."updatedAt",
              'createdBy', "Post"."createdBy",
              'updatedBy', "Post"."updatedBy",
              'likes', "Post"."likes",
              'views', "Post"."views",
              'comments', "Post"."comments"
          ) AS post
      FROM "Wiki"
      INNER JOIN "WikiLink" ON "Wiki"."id" = "WikiLink"."wikiId"
      INNER JOIN "Post" ON "Post"."id" = "WikiLink"."postId"
      WHERE path ~ '*'::lquery
        AND "Post"."language" = ${query.language}
      ORDER BY path
`;
    await this.cache.set(cacheKey, result, 60 * 5);

    return result;
  }

  async findAll(query: ApiQuery<typeof api.v4.wiki.findAll>): Promise<ApiResult<typeof api.v4.wiki.findAll>> {
    const { path } = query;

    if (path === null || path === undefined || path === '') {
      return await this.prisma.$queryRaw`
          SELECT
              "Wiki".*,
              COALESCE(
                json_agg(
                    json_build_object(
                        'id', "Post"."id",
                        'title', "Post"."title",
                        'itemId', "Post"."itemId",
                        'summary', "Post"."summary",
                        'status', "Post"."status",
                        'verificationStatus', "Post"."verificationStatus",
                        'language', "Post"."language",
                        'cover', "Post"."cover",
                        'verifierId', "Post"."verifierId",
                        'postType', "Post"."postType",
                        'createdAt', "Post"."createdAt",
                        'updatedAt', "Post"."updatedAt",
                        'createdBy', "Post"."createdBy",
                        'updatedBy', "Post"."updatedBy",
                        'likes', "Post"."likes",
                        'views', "Post"."views",
                        'comments', "Post"."comments"
                    ) ORDER BY "Post"."createdAt"
                ) FILTER (WHERE "Post"."id" IS NOT NULL), '[]'::json
            ) AS posts
          FROM "Wiki"
          LEFT JOIN "WikiLink" ON "Wiki"."id" = "WikiLink"."wikiId"
          LEFT JOIN "Post" ON "Post"."id" = "WikiLink"."postId"
          WHERE path ~ '*'::lquery
          GROUP BY "Wiki"."id"
          ORDER BY path;
     `;
    }

    return await this.prisma.$queryRaw`
          SELECT
              "Wiki".*,
              COALESCE(
                json_agg(
                    json_build_object(
                        'id', "Post"."id",
                        'title', "Post"."title",
                        'summary', "Post"."summary",
                        'status', "Post"."status",
                        'verificationStatus', "Post"."verificationStatus",
                        'language', "Post"."language",
                        'cover', "Post"."cover",
                        'verifierId', "Post"."verifierId",
                        'postType', "Post"."postType",
                        'createdAt', "Post"."createdAt",
                        'updatedAt', "Post"."updatedAt",
                        'createdBy', "Post"."createdBy",
                        'updatedBy', "Post"."updatedBy",
                        'likes', "Post"."likes",
                        'views', "Post"."views",
                        'comments', "Post"."comments"
                    ) ORDER BY "Post"."createdAt"
                ) FILTER (WHERE "Post"."id" IS NOT NULL), '[]'::json
            ) AS posts
          FROM "Wiki"
          LEFT JOIN "WikiLink" ON "Wiki"."id" = "WikiLink"."wikiId"
          LEFT JOIN "Post" ON "Post"."id" = "WikiLink"."postId"
          WHERE path ~ ${path + '.*'}::lquery
          GROUP BY "Wiki"."id"
          ORDER BY path;
    `;
  }

  findOne(id: string) {
    return `This action returns a #${id} wiki`;
  }

  async update(id: string, updateWikiDto: ApiBody<typeof api.v4.wiki.update>, session: Session) {
    const result = await this.prisma.wiki.update({
      where: { id },
      data: {
        ...updateWikiDto,
        updatedBy: session.id,
        updatedAt: new Date(),
      },
    });

    return { ...result, posts: [] };
  }

  async remove(id: string) {
    const result = this.prisma.wiki.delete({ where: { id } });

    return result;
  }

  async removeLink(wikiId: string, postId: string) {
    const result = this.prisma.wikiLink.delete({
      where: {
        wikiId_postId: {
          wikiId,
          postId,
        },
      },
    });

    return result;
  }
}
