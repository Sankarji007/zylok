package com.zylo.authservice.service;

import com.zylo.authservice.component.AccountComponent;
import com.zylo.authservice.dto.UserRegistrationRequest;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.GroupRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AccountsService {

    @Autowired
    public AccountsService(AccountComponent accountComponent) {
        this.accountComponent = accountComponent;
        accountComponent.init();
    }

    private final AccountComponent accountComponent;

    public void createUserInAccounts(UserRegistrationRequest request) {
        accountComponent.init();
        Keycloak keycloak = accountComponent.getKeycloak();
        RealmResource realmResource = keycloak.realm(accountComponent.getRealm());
        if (request.getOrganization() == null || request.getOrganization().isEmpty()) {
            throw new RuntimeException("Organization name is required for admin registration");
        }
        if (request.getInvitedBy() != null) {
            throw new RuntimeException("InvitedBy field is not allowed for admin registration");
        }
        String groupId = createGroup(realmResource, request.getOrganization());
        UserRepresentation user = getAdminUserRepresentation(request, "T_ADMIN");
        CredentialRepresentation passwordCred = getCredentialRepresentation(request);
        user.setCredentials(Collections.singletonList(passwordCred));
        Response response = realmResource.users().create(user);
        if (response.getStatus() != 201) {
            throw new RuntimeException("failed to create user: " + response.getStatusInfo());
        }
        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
        realmResource.users().get(userId).joinGroup(groupId);
    }

    private static String createGroup(RealmResource realmResource, String orgName) {
        GroupRepresentation group = new GroupRepresentation();
        group.setName(orgName);
        Response groupResponse = realmResource.groups().add(group);
        if (groupResponse.getStatus() != 201) {
            throw new RuntimeException("Failed to account");
        }
        return groupResponse.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
    }

    public void registerInvitedUser(UserRegistrationRequest request) {
        String orgName = getOrgName();
        String email = ((Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getClaims().get("preferred_username").toString();
        request.setInvitedBy(email);
        request.setOrganization(orgName);
        Keycloak keycloak = accountComponent.getKeycloak();
        String realm = accountComponent.getRealm();
        RealmResource realmResource = keycloak.realm(realm);

        String groupId = null;
        if (request.getInvitedBy() != null && !request.getInvitedBy().isEmpty()) {
            groupId = getGroupId(request, realmResource);
        } else if (request.getOrganization() != null && !request.getOrganization().isEmpty()) {
            groupId = getGroupIdByOrg(request, realmResource);
        } else {
            throw new RuntimeException("Either invitedBy or organization must be provided");
        }

        UserRepresentation user = getAdminUserRepresentation(request, "T_USER");

        CredentialRepresentation passwordCred = getCredentialRepresentation(request);
        user.setCredentials(Collections.singletonList(passwordCred));

        Response response = realmResource.users().create(user);
        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user: " + response.getStatusInfo());
        }

        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
        realmResource.users().get(userId).joinGroup(groupId);



    }

    private static String getGroupIdByOrg(UserRegistrationRequest request, RealmResource realmResource) {
        String groupId;
        groupId = realmResource.groups().groups().stream().filter(group -> group.getName().equals(request.getOrganization())).map(GroupRepresentation::getId).findFirst().orElse(null);
        if (groupId == null) {
            throw new RuntimeException("Group for organization " + request.getOrganization() + " not found");
        }
        return groupId;
    }

    private static String getGroupId(UserRegistrationRequest request, RealmResource realmResource) {
        String groupId;
        UserRepresentation inviter = realmResource.users().search(request.getInvitedBy()).stream().filter(u -> u.getUsername().equals(request.getInvitedBy())).findFirst().orElse(null);
        if (inviter == null) {
            throw new RuntimeException("Inviter user not found: " + request.getInvitedBy());
        }
        groupId = realmResource.users().get(inviter.getId()).groups().stream().map(GroupRepresentation::getId).findFirst().orElse(null);
        if (groupId == null) {
            throw new RuntimeException("No organization group found for inviter: " + request.getInvitedBy());
        }
        return groupId;
    }

    private static String getOrgName() {
        return ((ArrayList) ((Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getClaims().get("groups")).get(0).toString().split("/")[1];
    }

    private static CredentialRepresentation getCredentialRepresentation(UserRegistrationRequest request) {
        CredentialRepresentation passwordCred = new CredentialRepresentation();
        passwordCred.setType(CredentialRepresentation.PASSWORD);
        passwordCred.setValue(request.getPassword());
        passwordCred.setTemporary(false);
        return passwordCred;
    }

    private static UserRepresentation getAdminUserRepresentation(UserRegistrationRequest request, String role) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(false);
        Map<String, List<String>> clientRoles = new HashMap<>();
        String clientId = "zylo-web";
        List<String> roles = List.of(role);
        clientRoles.put(clientId, roles);
        user.setClientRoles(clientRoles);
        return user;
    }

}
