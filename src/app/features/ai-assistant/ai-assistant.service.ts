import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { IA_CONFIG } from '../../core/ia/ia.config';
import { AiHistoryEntry, AiMessage, RelatedDoc } from './ai-message.model';

const TOKEN_KEY = 'eciwise.token';

interface ChatResponse {
  success: boolean;
  answer: string;
  relatedDocuments?: RelatedDoc[];
}

interface SocraticResponse {
  success: boolean;
  answer: string;
  relatedDocuments?: RelatedDoc[];
}

interface StreamEvent {
  token?: string;
  done?: boolean;
  error?: string;
  relatedDocuments?: RelatedDoc[];
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(IA_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _messages = signal<AiMessage[]>([
    {
      id: 'seed',
      author: 'assistant',
      text: 'aiAssistant.seed',
    },
  ]);
  private readonly _history = signal<AiHistoryEntry[]>([]);
  private readonly _sending = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly sending = this._sending.asReadonly();

  get ragBase(): string {
    return this.config.ragApiUrl;
  }

  async send(text: string, mode: 'chat' | 'socratic'): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || this._sending()) return;

    this._sending.set(true);
    this.appendMessage({ id: `u-${Date.now()}`, author: 'user', text: trimmed });

    try {
      if (mode === 'chat' && this.isBrowser) {
        await this.sendStream(trimmed);
      } else if (mode === 'chat') {
        await this.sendChat(trimmed);
      } else {
        await this.sendSocratic(trimmed);
      }
    } catch {
      this.appendMessage({
        id: `err-${Date.now()}`,
        author: 'assistant',
        text: 'aiAssistant.errorNetwork',
      });
    } finally {
      this._sending.set(false);
    }
  }

  resetConversation(): void {
    this._messages.set([
      { id: 'seed', author: 'assistant', text: 'aiAssistant.seed' },
    ]);
    this._history.set([]);
  }

  private async sendChat(message: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<ChatResponse>(`${this.ragBase}/api/chat`, { message }),
    );
    this.appendMessage({
      id: `a-${Date.now()}`,
      author: 'assistant',
      text: res.answer,
      relatedDocuments: res.relatedDocuments,
    });
  }

  private async sendSocratic(message: string): Promise<void> {
    const history = this._history();
    const res = await firstValueFrom(
      this.http.post<SocraticResponse>(`${this.ragBase}/api/socratic`, { message, history }),
    );
    this._history.update((h) => [
      ...h,
      { role: 'user', content: message },
      { role: 'assistant', content: res.answer },
    ]);
    this.appendMessage({
      id: `a-${Date.now()}`,
      author: 'assistant',
      text: res.answer,
      relatedDocuments: res.relatedDocuments,
    });
  }

  private async sendStream(message: string): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);
    const streamId = `a-${Date.now()}`;

    this.appendMessage({ id: streamId, author: 'assistant', text: '', streaming: true });

    const response = await fetch(`${this.ragBase}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      this.updateStreamingMessage(streamId, 'aiAssistant.errorNetwork', false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let relatedDocs: RelatedDoc[] | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event: StreamEvent = JSON.parse(line.slice(6));
          if (event.error) {
            this.updateStreamingMessage(streamId, 'aiAssistant.errorNetwork', false);
            return;
          }
          if (event.token) {
            fullText += event.token;
            this.updateStreamingMessage(streamId, fullText, true);
          }
          if (event.done) {
            relatedDocs = event.relatedDocuments;
          }
        } catch {
          // línea malformada, ignorar
        }
      }
    }

    this.updateStreamingMessage(streamId, fullText || 'aiAssistant.errorNetwork', false, relatedDocs);
  }

  private updateStreamingMessage(
    id: string,
    text: string,
    streaming: boolean,
    relatedDocuments?: RelatedDoc[],
  ): void {
    this._messages.update((msgs) =>
      msgs.map((m) =>
        m.id === id ? { ...m, text, streaming, relatedDocuments } : m,
      ),
    );
  }

  private appendMessage(message: AiMessage): void {
    this._messages.update((list) => [...list, message]);
  }
}
