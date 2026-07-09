import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { IdentityModule } from '../identity/identity.module';
import { EnablementController } from './enablement.controller';
import { EnablementService } from './enablement.service';
import { EnablementRequest } from './entities/enablement-request.entity';
import { EnablementStep } from './entities/enablement-step.entity';
import { PolicyAcceptance } from './entities/policy-acceptance.entity';
import { TrainingAcceptance } from './entities/training-acceptance.entity';

@Module({
  imports: [
    IdentityModule,
    AuthModule,
    TypeOrmModule.forFeature([
      EnablementRequest,
      EnablementStep,
      PolicyAcceptance,
      TrainingAcceptance,
    ]),
  ],
  controllers: [EnablementController],
  providers: [EnablementService],
})
export class EnablementModule {}
