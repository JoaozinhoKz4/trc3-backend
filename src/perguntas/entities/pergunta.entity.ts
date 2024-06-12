import { ChatCompletionMessageParam } from "openai/resources";
import { Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from "typeorm";

export class Pergunta {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({ name: 'retornoAI', type: 'text', nullable: true, array: true })
    public retornoAi: string[]

    @Column({ name: 'concatenate_fields', type: 'text', nullable: true })
    public concatenateFields?: string;

    @Column({
        name: 'keywords',
        type: 'text',
        array: true,
        nullable: true,
    })
    public keywords?: string[];

    @Column({
        name: 'searchTerms',
        type: 'text',
        array: true,
        nullable: true,
    })
    public searchTerms?: string[];

    @Column({
        name: 'perguntaAluno',
        type: 'text',
        nullable: true,
    })
    public perguntaAluno?: string;

    @Column({
        name: 'conversa_gpt',
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
        nullable: false,
    })
    gptMessages: ChatCompletionMessageParam[];

    @BeforeInsert()
    @BeforeUpdate()
    async concatenationFields (): Promise<void> {
        let concatenate = ' ';


        if (this.keywords !== undefined && this.keywords.length > 0) {
            this.keywords.forEach((e) => {
                concatenate = `${concatenate + e} `;
            });
        }

        if (
            this.gptMessages !== undefined &&
            this.gptMessages.length > 0
        ) {
            this.gptMessages.forEach((e) => {
                concatenate = `${concatenate + e} `;
            });
        }

        if (
            this.searchTerms !== undefined &&
            this.searchTerms.length > 0
        ) {
            this.searchTerms.forEach((e) => {
                concatenate = `${concatenate + e} `;
            });
        }

        concatenate = `${concatenate} ${this.perguntaAluno}`
        
    }
}
