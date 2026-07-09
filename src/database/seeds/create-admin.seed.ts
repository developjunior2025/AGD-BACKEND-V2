import 'reflect-metadata';
import { hashSecret } from '../../common/utils/password.util';
import { Group } from '../../modules/identity/entities/group.entity';
import {
  Partner,
  PartnerKind,
} from '../../modules/identity/entities/partner.entity';
import { User } from '../../modules/identity/entities/user.entity';
import { UserGroup } from '../../modules/identity/entities/user-group.entity';
import { AppDataSource } from '../data-source';

/**
 * Bootstrap del primer usuario admin. El registro público (POST
 * /enablement/requests) rechaza el perfil 'admin' a propósito, así que la
 * única forma de crear el primer administrador es este script directo a BD.
 *
 * Uso: ADMIN_EMAIL=... ADMIN_RIF=... ADMIN_PASSWORD=... npm run seed:admin
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const rif = process.env.ADMIN_RIF;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !rif || !password) {
    throw new Error(
      'ADMIN_EMAIL, ADMIN_RIF y ADMIN_PASSWORD son requeridas para crear el admin inicial',
    );
  }

  await AppDataSource.initialize();

  const groupRepo = AppDataSource.getRepository(Group);
  const partnerRepo = AppDataSource.getRepository(Partner);
  const userRepo = AppDataSource.getRepository(User);
  const userGroupRepo = AppDataSource.getRepository(UserGroup);

  const adminGroup = await groupRepo.findOneOrFail({
    where: { code: 'admin' },
  });

  let partner = await partnerRepo.findOne({ where: { email } });
  if (!partner) {
    partner = await partnerRepo.save(
      partnerRepo.create({
        kind: PartnerKind.INDIVIDUAL,
        firstName: 'Admin',
        lastName: 'AGD',
        rif,
        email,
        active: true,
      }),
    );
  }

  const existingUser = await userRepo.findOne({ where: { login: email } });
  if (existingUser) {
    console.log(
      `Ya existe un usuario con login ${email} (id=${existingUser.id})`,
    );
    await AppDataSource.destroy();
    return;
  }

  const user = await userRepo.save(
    userRepo.create({
      partnerId: partner.id,
      login: email,
      passwordHash: await hashSecret(password),
      mustChangePassword: true,
      active: true,
    }),
  );

  await userGroupRepo.insert({ userId: user.id, groupId: adminGroup.id });

  console.log(`Admin creado: user_id=${user.id}, login=${email}`);
  await AppDataSource.destroy();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
