import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });

      if (post === null) {
        throw fastify.httpErrors.notFound('Project does not exsist');
      }

      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postRer = await fastify.db.posts.create(request.body);

      if (!postRer) {
        throw fastify.httpErrors.badRequest('Project is not created');
      }

      return postRer;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });

      if (postId === null) {
        throw fastify.httpErrors.badRequest('Project was not found');
      }

      const postToDeleteId = await fastify.db.posts.delete(request.params.id);

      return postToDeleteId;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const postId = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });

      if (postId === null) {
        throw fastify.httpErrors.badRequest('Project does not exsist');
      }

      const updatedPostId = await fastify.db.posts.change(request.params.id, {
        ...request.body,
      });

      return updatedPostId;
    }
  );
};

export default plugin;
