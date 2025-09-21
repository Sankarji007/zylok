package com.zylo.authservice.controller;

import com.zylo.authservice.dto.InviteUserRequest;
import com.zylo.authservice.dto.UserCreationResponse;
import com.zylo.authservice.dto.UserRegistrationRequest;
import com.zylo.authservice.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;


@RestController
@RequestMapping("/api/v1/accounts")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<Object> registerAdmin(@RequestBody UserRegistrationRequest request) throws URISyntaxException {
        UserCreationResponse userCreationResponse = adminService.createRootUser(request);
        URI uri=new URI("/api/v1/accounts/"+userCreationResponse.getId());
        return ResponseEntity.created(uri).build();
    }


    @PostMapping("/admin/invite")
    public ResponseEntity<String> registerUser(@RequestBody InviteUserRequest request) throws URISyntaxException {
        UserCreationResponse userCreationResponse = adminService.registerInvitedUser(request);
        URI uri=new URI("/api/v1/accounts/"+userCreationResponse.getId());
        return ResponseEntity.created(uri).build();
    }




}