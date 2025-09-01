package com.zylo.authservice.service;

import com.zylo.authservice.dto.UserRegistrationRequest;
import com.zylo.authservice.entity.Tenant;
import com.zylo.authservice.entity.User;
import com.zylo.authservice.repository.AccountsRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AdminService {

    @Autowired
    private AccountsRepository accountsRepository;

    @Autowired
    private AccountsService accountsService;

    public void createRootUser(UserRegistrationRequest request) {
        accountsService.createUserInAccounts(request);
        User user = getUserAdminUser(request);
        accountsRepository.createUser(user);
    }

    private static User getUserAdminUser(UserRegistrationRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getOrganization());
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("ADMIN");
        user.setTenant(tenant);
        return user;
    }

    public void registerInvitedUser(UserRegistrationRequest request) {
        accountsService.registerInvitedUser(request);
        User user = getUser(request);
        accountsRepository.createUser(user);
    }


    private User getUser(UserRegistrationRequest request) {
        Tenant tenantByUser = accountsRepository.getTenantByUser(request.getInvitedBy());
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole("ADMIN");
        user.setTenant(tenantByUser);
        return user;
    }

}
