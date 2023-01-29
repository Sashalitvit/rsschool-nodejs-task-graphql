import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    const Users = await fastify.db.users.findMany();
    return Users;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const userById = await fastify.db.users.findOne({key: 'id', equals: request.params.id});

      if (userById === null) {

        throw fastify.httpErrors.notFound("User does not found");
      }

      return userById;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const oneUser = await fastify.db.users.create(request.body);

      if (!oneUser) {
        throw fastify.httpErrors.badRequest('User is not created');
      }

      return oneUser;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });

      if (user === null) {
        throw fastify.httpErrors.badRequest('User was not found');
      }
      const userFollowers = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: request.params.id });

      userFollowers.map(async (follower) => {
        const updatedSubscriptions = follower.subscribedToUserIds.filter((id) => id !== request.params.id);

        await fastify.db.users.change(follower.id, {
          subscribedToUserIds: updatedSubscriptions,
        })
      });

      const userPosts = await fastify.db.posts.findMany({ key: 'userId', equals: request.params.id });

      userPosts.map(async (post) => {
        await fastify.db.posts.delete(post.id);
      });

      const userProfiles = await fastify.db.profiles.findMany({ key: 'userId', equals: request.params.id });

      userProfiles.map(async (profile) => {
        await fastify.db.profiles.delete(profile.id);
      });


      const userToDelete = await fastify.db.users.delete(request.params.id);

      return userToDelete;
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {}
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {}
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {}
  );
};

export default plugin;
