package com.zylo.authservice.service;

import com.zylo.authservice.config.TenantContext;
import com.zylo.authservice.dto.UserCreationResponse;
import com.zylo.authservice.entity.User;
import com.zylo.authservice.exception.ResourceNotFoundException;
import com.zylo.authservice.repository.AccountsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class UserService {

    @Autowired
    private AccountsRepository accountsRepository;

    public UserCreationResponse getUserById(String id) {
        User userById = accountsRepository.getUserById(id);
        if (userById != null) {
            return UserCreationResponse.getUserResponse(userById);
        } else {
            throw new ResourceNotFoundException(id);
        }
    }



    public Page<UserCreationResponse> getAllUsers(int page, int size, String searchValue) {
        return accountsRepository.getUsersByTenantId(TenantContext.getTenantId(), page, size,searchValue);
    }
}
