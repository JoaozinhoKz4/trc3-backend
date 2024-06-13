import { Injectable } from '@nestjs/common';
import { CreatePerguntaDto } from './dto/create-pergunta.dto';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class PerguntasService {
  public gptMessages= []
  public perguntasAlunos=[]
  public entidadeEmMemoriaPerguntas= []
  constructor(private readonly openAiService: OpenAIService){

  }
  async create(createPerguntaDto: CreatePerguntaDto) {
    return await this.perguntaAluno(createPerguntaDto.perguntaDoAluno, this.entidadeEmMemoriaPerguntas.length > 1 ? this.entidadeEmMemoriaPerguntas[this.entidadeEmMemoriaPerguntas.length - 1] : 1)
  }

  findAll() {
    return this.entidadeEmMemoriaPerguntas;
  }

  findOne(id: number) {
    return this.entidadeEmMemoriaPerguntas[id - 1]
  }

  async perguntaAluno(perguntaDoAluno, id){
   this.gptMessages.push({
        role: "system",
        content: `Você é um assistente capaz de responder as perguntas de alunos da Universidade de Brasilia, conhecida como UnB, a partir de busca na base de dados interna e na internet.`,
      })
    
    this.gptMessages.push({
        role: 'assistant',
        content: 'Me dê instruções de como responder a pergunta',
      });

     this.gptMessages.push({ role: 'user', content: perguntaDoAluno});
  
    this.gptMessages.push({
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
       this.gptMessages,
        'json_object',
      )) as string;

      const gptResponse = JSON.parse(gptRawResponse);

      if (gptResponse.questions) {
       this.gptMessages.push({
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
      this.perguntasAlunos.push(perguntaDoAluno)
      let entityASerSalva = {
        id,
        retornoAi,
        searchTerms,
        keywords,
        perguntaDoAluno
      }
      this.entidadeEmMemoriaPerguntas.push(entityASerSalva)
      return {
        retornoAi,
        searchTerms,
        keywords,
        perguntaDoAluno
      }
  }
}
