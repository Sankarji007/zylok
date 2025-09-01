package com.zylo.authservice.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class TenantFilter implements Filter {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    private static final String TENANTS_KEY = "tenants";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String tenantIdHeader = httpRequest.getHeader("Tenant-Id");

        try {
            if (tenantIdHeader != null && !tenantIdHeader.isEmpty()) {
                try {
                    UUID tenantId = UUID.fromString(tenantIdHeader);
                    Boolean tenantExists = redisTemplate.opsForSet().isMember(TENANTS_KEY, tenantId.toString());

                    if (Boolean.TRUE.equals(tenantExists)) {
                        TenantContext.setTenantId(tenantId);

                        Session session = entityManager.unwrap(Session.class);
                        session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
                    } else {
                        TenantContext.setTenantId(null); // Ensure null for new tenant creation
                    }
                } catch (IllegalArgumentException e) {
                    throw new ServletException("Invalid Tenant-Id format", e);
                }
            } else {
                TenantContext.setTenantId(null);
            }
            chain.doFilter(request, response);
        } finally {
            if (TenantContext.getTenantId() != null) {
                Session session = entityManager.unwrap(Session.class);
                session.disableFilter("tenantFilter");
            }
            TenantContext.clear();
        }
    }
}