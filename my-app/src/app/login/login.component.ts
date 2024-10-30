import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login = {
    username: '',
    password: ''
  };

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    // Khi mở lại màn hình, lấy thông tin từ cookie
    this.loginService.getLoginInfo().subscribe((response: any) => {
      this.login.username = response.username;
      this.login.password = response.password;
    });
  }

  getFashion() {
    this.loginService.loginUser(this.login).subscribe(
      (response: any) => {
        console.log('Login successful', response);
        this.router.navigate(['/fashion-list']); // Điều hướng tới fashion-list sau khi đăng nhập thành công
      },
      (error: any) => {
        console.error('Login failed', error);
        alert('Invalid username or password'); // Thông báo lỗi
      }
    );
  }

  logout() {
    this.loginService.logout().subscribe(
      (response: any) => {
        console.log(response.message); // Logged out successfully
        this.login.username = ''; // Xóa thông tin đăng nhập
        this.login.password = '';
      },
      (error: any) => {
        console.error('Logout failed', error);
      }
    );
  }
}
