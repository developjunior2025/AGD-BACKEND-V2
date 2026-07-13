import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Sequence } from './entities/sequence.entity';

/** ir_sequence — genera códigos correlativos formateados (p.ej. CASE-000123). */
@Injectable()
export class SequenceService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async next(code: string): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Sequence);
      const sequence = await repository
        .createQueryBuilder('sequence')
        .where('sequence.code = :code', { code })
        .setLock('pessimistic_write')
        .getOne();

      if (!sequence) {
        throw new NotFoundException(`Secuencia '${code}' no encontrada`);
      }

      sequence.lastNumber += 1;
      await repository.save(sequence);

      const number = String(sequence.lastNumber).padStart(
        sequence.padding,
        '0',
      );
      return sequence.prefix ? `${sequence.prefix}${number}` : number;
    });
  }
}
