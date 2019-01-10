import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


interface myData{
  message: string,
  success: boolean
}

interface isLoggedIn{
  status: boolean
}

interface logoutStatus{
  success: boolean
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getSomeData(){
    return this.http.get<myData>('/api/');
  }

  isLoggedIn(): Observable<isLoggedIn>{
    return this.http.get<isLoggedIn>('/api/isLoggedIn')
  }

  logout(){
    return this.http.get<logoutStatus>("/api/");
  }
}
