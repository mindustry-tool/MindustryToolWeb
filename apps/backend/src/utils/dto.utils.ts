import { ItemTagDto } from '@mindustry-tool/api';
import { Prisma } from '@/generated/prisma/client';

export function tagToDto(
  tag: Prisma.TagGetPayload<{
    include: {
      category: {
        select: {
          color: true;
        };
      };
    };
  }>,
): ItemTagDto {
  return {
    ...tag,
    color: tag.category.color,
  };
}

export function postToDto(
  post: Prisma.PostGetPayload<{
    include: {
      item: {
        include: {
          tags: {
            select: {
              tag: {
                include: {
                  category: {
                    select: {
                      color: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  }>,
) {
  return {
    ...post.item,
    ...post,
    tags: post.item.tags.map((tag) => tagToDto(tag.tag)),
  };
}
