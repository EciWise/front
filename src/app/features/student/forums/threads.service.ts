import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppError, httpErrorToKey } from '../../../core/errors/app-error';
import { stripTrailingSlashes } from '../../../core/config/url.util';
import { TALK_CONFIG } from '../../../core/talk/talk.config';
import { CreateThreadRequest, EditThreadRequest, Thread, ThreadDetail } from './community.models';

@Injectable({ providedIn: 'root' })
export class ThreadsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TALK_CONFIG);

  private get forumsBase(): string {
    return `${stripTrailingSlashes(this.config.talkApiUrl)}/forums`;
  }

  private get threadsBase(): string {
    return `${stripTrailingSlashes(this.config.talkApiUrl)}/threads`;
  }

  createThread(forumId: string, req: CreateThreadRequest): Observable<Thread> {
    return this.http
      .post<Thread>(`${this.forumsBase}/${forumId}/threads`, req)
      .pipe(this.handle());
  }

  getThread(id: string): Observable<ThreadDetail> {
    return this.http.get<ThreadDetail>(`${this.threadsBase}/${id}`).pipe(this.handle());
  }

  likeThread(id: string): Observable<void> {
    return this.http.post<void>(`${this.threadsBase}/${id}/like`, {}).pipe(this.handle());
  }

  editThread(id: string, req: EditThreadRequest): Observable<Thread> {
    return this.http.post<Thread>(`${this.threadsBase}/${id}/edit`, req).pipe(this.handle());
  }

  private handle<T>() {
    return catchError<T, Observable<never>>((err) =>
      throwError(() => new AppError(httpErrorToKey(err))),
    );
  }
}
