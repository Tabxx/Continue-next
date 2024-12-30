import {
    ChatMessage,
    CompletionOptions,
    LLMOptions,
    Tool,
  } from "../../index.js";
  import { renderChatMessage } from "../../util/messageContent.js";
  import { BaseLLM } from "../index.js";
  import { streamSse } from "../stream.js";

  const inUrl = 'http://10.217.128.15/code-cvn'
  // const outUrl = 'https://hipilot.myhexin.com/code-cvn'
  
  class Hipilot extends BaseLLM {
  
    constructor(options: LLMOptions) {
      super(options);
    }
  
    static providerName = "hipilot";
  
    protected _convertModelName(model: string): string {
      return model;
    }
  
    protected async _complete(
      prompt: string,
      signal: AbortSignal,
      options: CompletionOptions,
    ): Promise<string> {
      let completion = "";
      for await (const chunk of this._streamChat(
        [{ role: "user", content: prompt }],
        signal,
        options,
      )) {
        completion += chunk.content;
      }
  
      return completion;
    }
  
    protected async *_streamComplete(
      prompt: string,
      signal: AbortSignal,
      options: CompletionOptions,
    ): AsyncGenerator<string> {
      for await (const chunk of this._streamChat(
        [{ role: "user", content: prompt }],
        signal,
        options,
      )) {
        yield renderChatMessage(chunk);
      }
    }

    protected handleMessagesToContext(messages: any[]) {
      const context = [];
      for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          if (message.role === 'system' || message.role === 'user') {
              context.push({
                  input: message.content,
                  output: '',
              });
          } else if (message.role === 'assistant') {
              if (context.length > 0) {
                  context[context.length - 1].output = message.content;
              }
          }
      }
      return context;
  }
  
    protected async *_streamChat(
      messages: ChatMessage[],
      signal: AbortSignal,
      options: CompletionOptions,
    ): AsyncGenerator<ChatMessage> {

      const { token, appid, email  } = (options || {}) as any

      const prompt = (messages.pop() || {}).content;

      const body = JSON.stringify({
        scene: 'chat',
        session_id: Date.now(),
        prompt,
        stream: true,
        user_id: email,
        context: this.handleMessagesToContext(messages),
      });
      

      const response = await this.fetch(`${inUrl}/v1/chat`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          token,
          appid,
          'hipilot-env': 'rtahz'
        },
        body,
        signal,
      });
  
      
      // 默认流式
      for await (const value of streamSse(response)) {
        let chunk: ChatMessage | undefined = undefined;
        if (value.choices[0].delta?.content) {
          chunk = {
            role: "assistant",
            content: value.choices[0].delta?.content,
          };
        }
        // const chunk = fromChatCompletionChunk(value);
        if (chunk) {
          yield chunk;
        }
      }
    }
  
    protected async *_streamFim(
      prefix: string,
      suffix: string,
      signal: AbortSignal,
      options: CompletionOptions,
    ): AsyncGenerator<string> {
      const endpoint = new URL("fim/completions", this.apiBase);
      const resp = await this.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          model: options.model,
          prompt: prefix,
          suffix,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop,
          stream: true,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": this.apiKey ?? "",
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal,
      });
      for await (const chunk of streamSse(resp)) {
        yield chunk.choices[0].delta.content;
      }
    }
  }
  
  export default Hipilot;
  