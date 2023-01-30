import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await fastify.db.memberTypes.findMany();

  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.params.id });

      if (member === null) {
        throw fastify.httpErrors.notFound('Member  not exsist');
      }

      return member;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.params.id });

      if (member === null) {
        throw fastify.httpErrors.badRequest('Member not exsist');
      }

      const updatedMember = await fastify.db.memberTypes.change(request.params.id, {
        ...request.body,
      });

      return updatedMember;
    }
  );
};

export default plugin;
