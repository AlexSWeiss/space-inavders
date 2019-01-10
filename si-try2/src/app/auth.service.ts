import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'


interface myData {
  success: boolean,
  message: string
}

interface registerResponse{
  success: boolean
  message: String
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private loggedInStatus = JSON.parse(localStorage.getItem('loggedIn') || 'false');

  setLoggedIn(val: boolean) {
    this.loggedInStatus = val;
    localStorage.setItem('loggedIn', 'true')
  }

  get isLoggedIn() {
    return JSON.parse(localStorage.getItem('loggedIn') || this.loggedInStatus.toString());
  }

  getUserDetails(username, password) {
    //post data to API Server
    return this.http.post<myData>('/api/login', {
      username,
      password
    })
  }

  registerUser(username, password, ){
    return this.http.post<registerResponse>('/api/register', {
      username,
      password
    })
  }
}
