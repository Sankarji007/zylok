package com.zylo.authservice.component;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.keycloak.admin.client.Keycloak;
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
        this.keycloak = Keycloak.getInstance(
                serverUrl,
                realm,
                adminUsername,
                adminPassword,
                adminClientId);
    }

}
