import { EventPattern, Payload } from '@nestjs/microservices';

import { Controller, Logger } from '@nestjs/common';

@Controller()
export class EmailSenderController {
  private readonly logger = new Logger('Invoice Controller Service');

  @EventPattern('summary_created')
  async handle(@Payload() payload: any): Promise<void> {
    this.logger.log(
      `Received an event from the queue, Event: ${JSON.stringify(payload)}`,
    );
    this.logger.log(
      `Email is sent with the following body: ${JSON.stringify(payload)}`,
    );
  }
}
