import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseDto } from './create-purchase.dto';

/** Describes the Purchase fields that are updatable
 *
 * <br>Note that since this is a
 * <u>Partial of <a href="CreatePurchaseDto.html">CreatePurchaseDto</a></u>,
 * any field there is optional here
 */
export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {}
