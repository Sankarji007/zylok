package com.zylo.authservice;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("admin/auth")
public class AuthController {

    @PostMapping("/register")
    public String registerAdmin() {
        return "";
    }
}
