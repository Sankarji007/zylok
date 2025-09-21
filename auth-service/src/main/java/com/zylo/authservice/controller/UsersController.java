package com.zylo.authservice.controller;

import com.zylo.authservice.dto.UserCreationResponse;
import com.zylo.authservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UsersController {

    @Autowired
    private UserService userService;

    @GetMapping("/{Id}")
    public ResponseEntity<UserCreationResponse> getUserById(@PathVariable String Id) {
        UserCreationResponse userCreationResponse = userService.getUserById(Id);
        return ResponseEntity.ok(userCreationResponse);
    }


    @GetMapping()
    public ResponseEntity<Page<UserCreationResponse>> getUserByAllUsers(@RequestParam int page, @RequestParam int size,@RequestParam(defaultValue = "") String searchValue) {
        Page<UserCreationResponse> allUsers = userService.getAllUsers(page, size,searchValue);
        return ResponseEntity.ok(allUsers);
    }
}
