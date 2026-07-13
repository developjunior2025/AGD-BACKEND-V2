import { Case } from '../../cases/entities/case.entity';
import { SaleOrder } from '../entities/sale-order.entity';

export interface CheckoutResult {
  order: SaleOrder;
  case: Case;
}
