import { NestFactory } from '@nestjs/core';
import { Transport, RmqOptions } from '@nestjs/microservices';
import { AppModule } from './src/app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI],
      queue: 'daily_sales_report',
      queueOptions: {
        durable: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
}

bootstrap();
