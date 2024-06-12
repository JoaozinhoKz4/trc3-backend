import { ApiProperty } from "@nestjs/swagger";

export class CreatePerguntaDto {
    @ApiProperty({example:'O que é Ira?', name:'perguntaDoAluno'})
    public perguntaDoAluno:string
}
