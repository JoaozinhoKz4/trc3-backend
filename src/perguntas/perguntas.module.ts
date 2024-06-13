import { Module } from '@nestjs/common';
import { PerguntasService } from './perguntas.service';
import { PerguntasController } from './perguntas.controller';
import { OpenAIService } from 'src/openai/openai.service';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports:[OpenAIModule],
  controllers: [PerguntasController],
  providers: [PerguntasService]
})
export class PerguntasModule {}
