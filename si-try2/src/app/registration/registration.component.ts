import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private Auth: AuthService, private router: Router) { }

  ngOnInit() { }

  registerUser(event) {
    event.preventDefault();
    const error = [];
    const target = event.target
    const username = target.querySelector('#username').value;
    const password = target.querySelector('#password').value;
    const cpassword = target.querySelector('#cpassword').value;

    if (password != cpassword) {
      error.push("Passwords don`t match");
    }
    //more validations
    if (error.length === 0) {
      this.Auth.registerUser(username, password).subscribe(data => {
        if (data.success) {
          this.router.navigate(['game']);
        }
      })
    }
  }
}


