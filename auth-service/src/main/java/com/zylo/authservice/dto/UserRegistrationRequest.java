package com.zylo.authservice.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class UserRegistrationRequest extends InviteUserRequest {
    private String organization;
}

