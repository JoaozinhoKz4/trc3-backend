import { Injectable } from '@nestjs/common';
import { CreatePerguntaDto } from './dto/create-pergunta.dto';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class PerguntasService {
  constructor(private readonly openAiService: OpenAIService){

  }
  create(createPerguntaDto: CreatePerguntaDto) {
    return 'This action adds a new pergunta';
  }

  findAll() {
    return `This action returns all perguntas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pergunta`;
  }

  update(id: number, updatePerguntaDto: UpdatePerguntaDto) {
    return `This action updates a #${id} pergunta`;
  }

  remove(id: number) {
    return `This action removes a #${id} pergunta`;
  }

  async perguntaAluno(perguntaDoAluno){
    let gptMessages = []
    gptMessages.push({
        role: "system",
        content: `Você é um assistente capaz de responder as perguntas de alunos da Universidade de Brasilia, conhecida como UnB, a partir de busca na base de dados interna e na internet.`,
      })
    
     gptMessages.push({
        role: 'assistant',
        content: 'Me dê instruções de como responder a pergunta',
      });

      gptMessages.push({ role: 'user', content: perguntaDoAluno.texto });
  
     gptMessages.push({
        role: 'user',
        content: `Sua função é retornar uma resposta plausível a pergunta dada pelo usuário buscando as informações em dados previamente pesquisados
  
        Responda tudo em português,
        Use o seguinte formato json:
        {
          retornoAi: String[];
          searchTerms: String[];
          keywords: String[];
        }
        Se ocorrer das informações serem muito poucas para a resposta, responda com o seguinte json as perguntas ao usuário (cada pergunta é um item do array) a fim de conseguir mais informações para o resultado:
        {
          questions: String[];
        }`,
      });

      const gptRawResponse = (await this.openAiService.chatGptRequest(
        gptMessages,
        'json_object',
      )) as string;

      const gptResponse = JSON.parse(gptRawResponse);

      if (gptResponse.questions) {
        gptMessages.push({
          role: 'assistant',
          content: gptRawResponse,
        });


        return {
          status: 'need-more-data',
          requests: gptResponse.questions,
        };
      }

      const { retornoAi, searchTerms, keywords } =
        gptResponse as {
          retornoAi: string[];
          searchTerms: string[];
          keywords: string[];
        };
    
      return {
        retornoAi,
        searchTerms,
        keywords,
        perguntaDoAluno
      }
  }
}
