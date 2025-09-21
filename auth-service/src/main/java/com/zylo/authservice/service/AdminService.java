package com.zylo.authservice.service;

import com.zylo.authservice.config.TenantContext;
import com.zylo.authservice.dto.InviteUserRequest;
import com.zylo.authservice.dto.UserCreationResponse;
import com.zylo.authservice.dto.UserRegistrationRequest;
import com.zylo.authservice.entity.Tenant;
import com.zylo.authservice.entity.User;
import com.zylo.authservice.exception.ResourceNotFoundException;
import com.zylo.authservice.repository.AccountsRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AdminService {

    public static final String USER = "USER";
    public static final String ADMIN = "ADMIN";
    @Autowired
    private AccountsRepository accountsRepository;

    @Autowired
    private AccountsService accountsService;

    public UserCreationResponse createRootUser(UserRegistrationRequest request) {
        accountsService.createUserInAccounts(request);
        User user = getUserAdminUser(request);
        User rootUser = accountsRepository.createUser(user);
        return UserCreationResponse.getUserResponse(rootUser);
    }


    private static User getUserAdminUser(UserRegistrationRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getOrganization());
        return getUser(request, ADMIN, tenant);
    }

    private static User getUser(InviteUserRequest request, String role, Tenant tenant) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(role);
        user.setTenant(tenant);
        return user;
    }

    public UserCreationResponse registerInvitedUser(InviteUserRequest request) {
        accountsService.registerInvitedUser(request);
        User user = getUser(request);
        User rootUser = accountsRepository.createUser(user);
        return UserCreationResponse.getUserResponse(rootUser);
    }


    private User getUser(InviteUserRequest request) {
        Tenant tenantByUser = accountsRepository.getTenantById(TenantContext.getTenantId());
        return getUser(request, USER, tenantByUser);
    }



}
