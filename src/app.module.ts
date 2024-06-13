import { Module } from '@nestjs/common';
import { PerguntasModule } from './perguntas/perguntas.module';

@Module({
  imports: [PerguntasModule],
})
export class AppModule {}
