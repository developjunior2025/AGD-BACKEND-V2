import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AccessRule, AccessScope } from './entities/access-rule.entity';
import { ModelAccess } from './entities/model-access.entity';
import { RequestUser } from './interfaces/request-user.interface';

export type PermissionAction = 'read' | 'write' | 'create' | 'unlink';

const PERMISSION_COLUMN: Record<
  PermissionAction,
  keyof Pick<
    ModelAccess,
    'permRead' | 'permWrite' | 'permCreate' | 'permUnlink'
  >
> = {
  read: 'permRead',
  write: 'permWrite',
  create: 'permCreate',
  unlink: 'permUnlink',
};

const SCOPE_RANK: Record<AccessScope, number> = {
  [AccessScope.OWN]: 0,
  [AccessScope.COMPANY]: 1,
  [AccessScope.ALL]: 2,
};

/**
 * Motor de autorización simplificado: ir_model_access (permiso CRUD por
 * grupo+modelo) + ir_rule (alcance own/company/all por grupo+modelo).
 * Un usuario puede tener varios perfiles (grupos); se toma el permiso más
 * permisivo entre todos sus grupos.
 */
@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(ModelAccess)
    private readonly modelAccessRepository: Repository<ModelAccess>,
    @InjectRepository(AccessRule)
    private readonly accessRuleRepository: Repository<AccessRule>,
  ) {}

  async hasPermission(
    user: RequestUser,
    modelName: string,
    action: PermissionAction,
  ): Promise<boolean> {
    if (user.groupCodes.length === 0) return false;

    const rows = await this.modelAccessRepository.find({
      where: { modelName, group: { code: In(user.groupCodes) } },
      relations: { group: true },
    });

    const column = PERMISSION_COLUMN[action];
    return rows.some((row) => row[column]);
  }

  async assertPermission(
    user: RequestUser,
    modelName: string,
    action: PermissionAction,
  ): Promise<void> {
    const allowed = await this.hasPermission(user, modelName, action);
    if (!allowed) {
      throw new ForbiddenException(
        `No tiene permiso de '${action}' sobre '${modelName}'`,
      );
    }
  }

  /** Alcance efectivo (own/company/all) del usuario sobre un modelo. */
  async getScope(user: RequestUser, modelName: string): Promise<AccessScope> {
    if (user.groupCodes.length === 0) return AccessScope.OWN;

    const rules = await this.accessRuleRepository.find({
      where: { modelName, active: true, group: { code: In(user.groupCodes) } },
      relations: { group: true },
    });

    if (rules.length === 0) return AccessScope.OWN;

    return rules.reduce<AccessScope>(
      (broadest, rule) =>
        SCOPE_RANK[rule.scope] > SCOPE_RANK[broadest] ? rule.scope : broadest,
      AccessScope.OWN,
    );
  }
}
