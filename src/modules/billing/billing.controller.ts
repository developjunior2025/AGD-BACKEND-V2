import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelName } from '../../common/constants/model-names';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BillingService } from './billing.service';

/**
 * Sin pasarela de pago real (backend standalone): un administrador asienta
 * el pago manualmente. La consulta de facturas/pagos por orden vive en
 * `sales` (`GET /orders/:id/invoices` y `/payments`), donde se puede
 * verificar la titularidad de la orden antes de exponer los datos.
 */
@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @RequirePermission(ModelName.INVOICE, 'create')
  @Post('payments')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.billingService.createPayment(dto);
  }
}
