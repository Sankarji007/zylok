package com.zylo.authservice.controller;

import com.zylo.authservice.dto.LoginDto;
import com.zylo.authservice.dto.UserRegistrationRequest;
import com.zylo.authservice.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/v1/accounts")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<String> registerAdmin(@RequestBody UserRegistrationRequest request) {
        adminService.createRootUser(request);
        return ResponseEntity.ok("Admin user created and assigned to group: " + request.getOrganization());
    }


    @PostMapping("/admin/invite")
    public ResponseEntity<String> registerUser(@RequestBody UserRegistrationRequest request) {
        adminService.registerInvitedUser(request);
        return null;
    }




}