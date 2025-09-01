package com.zylo.authservice.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class UserRegistrationRequest {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String organization;
    private String invitedBy;

}