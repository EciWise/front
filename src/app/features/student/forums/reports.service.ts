import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppError, httpErrorToKey } from '../../../core/errors/app-error';
import { stripTrailingSlashes } from '../../../core/config/url.util';
import { TALK_CONFIG } from '../../../core/talk/talk.config';
import { CreateReportRequest, Report } from './community.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TALK_CONFIG);

  private get base(): string {
    return `${stripTrailingSlashes(this.config.talkApiUrl)}/reportes`;
  }

  createReport(req: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(this.base, req).pipe(this.handle());
  }

  listMyReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.base}/mis-reportes`).pipe(this.handle());
  }

  private handle<T>() {
    return catchError<T, Observable<never>>((err) =>
      throwError(() => new AppError(httpErrorToKey(err))),
    );
  }
}
