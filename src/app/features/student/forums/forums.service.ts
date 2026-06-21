import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppError, httpErrorToKey } from '../../../core/errors/app-error';
import { stripTrailingSlashes } from '../../../core/config/url.util';
import { TALK_CONFIG } from '../../../core/talk/talk.config';
import { CreateForumRequest, Forum, ForumDetail, Materia } from './community.models';

@Injectable({ providedIn: 'root' })
export class ForumsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TALK_CONFIG);

  private get base(): string {
    return `${stripTrailingSlashes(this.config.talkApiUrl)}/forums`;
  }

  listForums(): Observable<Forum[]> {
    return this.http.get<Forum[]>(this.base).pipe(this.handle());
  }

  createForum(req: CreateForumRequest): Observable<Forum> {
    return this.http.post<Forum>(this.base, req).pipe(this.handle());
  }

  getForum(id: string): Observable<ForumDetail> {
    return this.http.get<ForumDetail>(`${this.base}/${id}`).pipe(this.handle());
  }

  likeForum(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/like`, {}).pipe(this.handle());
  }

  closeForum(id: string): Observable<Forum> {
    return this.http.post<Forum>(`${this.base}/${id}/close`, {}).pipe(this.handle());
  }

  listMaterias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.base}/materias`).pipe(this.handle());
  }

  private handle<T>() {
    return catchError<T, Observable<never>>((err) =>
      throwError(() => new AppError(httpErrorToKey(err))),
    );
  }
}
