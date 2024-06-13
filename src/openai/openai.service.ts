import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAIApi from 'openai';
import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import { Run } from 'openai/resources/beta/threads/runs/runs';


@Injectable()
export class OpenAIService {
  private readonly openai = new OpenAIApi({
    apiKey: '123',
  });

  /**
   * Make a request to ChatGPT to generate a response based on a prompt and message history.
   * @param messages - An array of messages representing the conversation history
   * @returns A string containing the generated response
   */
  async chatGptRequest(
    messages: ChatCompletionMessageParam[],
    response_format?: 'text' | 'json_object',
  ): Promise<unknown> {
    try {
      // Make a request to the ChatGPT model
      const completion: ChatCompletion =
        await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages,
          response_format: response_format && { type: response_format },
          n: 1,
        });

      // Extract the content from the response
      const [content] = completion.choices.map(
        (choice) => choice.message.content,
      );

      return content;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }

  //* Assistent manipulation
  /**
   * Create an assistant
   * @param name - Name of the assistant
   * @param instructions - General instructions (description) of what the assistant shoud do
   * @param tools - The tools that the assistant should have access to
   * @returns The created assistant
   */
  createAssistant(params: {
    name: string;
    instructions: string;
    tools?: ChatCompletionTool[];
  }) {
    return this.openai.beta.assistants.create({
      model: 'gpt-4-turbo',
      name: params.name,
      instructions: params.instructions,
      tools: params.tools,
    });
  }

  /**
   * Create a thread
   * @returns A thread
   */
  createThread() {
    return this.openai.beta.threads.create();
  }

  /**
   * Add a message to a thread
   * @param thread_id - The id of a thread already create by this service
   * @param role - Role of the message
   * @param content - The content of the message
   * @returns The added message
   */
  addMessageToThread(thread_id: string, content: string) {
    return this.openai.beta.threads.messages.create(thread_id, {
      role: 'user',
      content,
    });
  }

  /**
   * Create assistant run
   * @param thread_id - The id of a thread already create by this service
   * @param assistant_id - The id of an assistant that will respond to the message
   * @param instructions - Optional instructions to generate the response
   * @returns The created run of the assistant
   */
  createAssistantRun(params: {
    thread_id: string;
    assistant_id: string;
    instructions?: string;
  }) {
    return this.openai.beta.threads.runs.create(params.thread_id, {
      assistant_id: params.assistant_id,
      instructions: params.instructions,
    });
  }

  /**
   * Check run status
   * @param thread_id - The id of a thread already create by this service
   * @param run_id - The id of a created run
   * @param maximumRetry - The maximum number of retries to check the status
   * @param attempt - The current attempt intended for recursion
   * @param delay - The delay in milliseconds
   * @returns The run status
   */
  async checkRunStatus(
    thread_id: string,
    run_id: string,
    maximumRetry = 40,
    attempt = 0,
    delay = 0,
  ): Promise<Run['status']> {
    await new Promise((resolve) => setTimeout(resolve, delay));

    const _run = await this.openai.beta.threads.runs.retrieve(
      thread_id,
      run_id,
    );

    if (
      _run.status === 'completed' ||
      _run.status === 'cancelled' ||
      _run.status === 'expired' ||
      _run.status === 'failed' ||
      attempt >= maximumRetry
    ) {
      return _run.status;
    }

    return this.checkRunStatus(
      thread_id,
      run_id,
      maximumRetry,
      attempt + 1,
      2000,
    );
  }

  /**
   * List the threads messages
   * @param thread_id - The id of a thread already create by this service
   * @returns The messages in the thread
   */
  listThreadMessages(thread_id: string) {
    return this.openai.beta.threads.messages.list(thread_id);
  }
}
