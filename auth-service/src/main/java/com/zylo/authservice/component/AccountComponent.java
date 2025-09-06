package com.zylo.authservice.component;

import lombok.Getter;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AccountComponent {

    @Getter
    private Keycloak keycloak;

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Getter
    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-username}")
    private String adminUsername;

    @Value("${keycloak.admin-password}")
    private String adminPassword;

    @Value("${keycloak.admin-client-id}")
    private String adminClientId;

    public void init() {
        if(this.keycloak != null) {
            return;
        }
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientId(adminClientId)
                .clientSecret(adminPassword)
                .build();

    }

}
