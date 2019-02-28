import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AwsService {

  private url = 'https://4h38l208qa.execute-api.us-east-2.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  authenticate(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/authenticate`, {
      method: 'authenticate',
      email: email,
      password: password
    });

  }


  register(email: string, password: string, first: string, last: string): Observable<any> {
    return this.http.post(`${this.url}/register`, {
      method: 'register',
      email: email,
      password: password,
      first: first,
      last: last
    });
  }

  getForms(token: string, email: string): Observable<any> {
    return this.http.get(`${this.url}/forms?email=${email}`, {
      headers: {
        'token': token
      }
    });
  }
}
