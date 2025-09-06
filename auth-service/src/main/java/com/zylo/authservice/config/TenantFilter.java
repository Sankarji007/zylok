package com.zylo.authservice.config;

import com.zylo.authservice.repository.AccountsRepository;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.UUID;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    EntityManager entityManager;

    @Autowired
    AccountsRepository accountsRepository;

    @Autowired
    RedisTemplate<String,String> redisTemplate;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication==null) {
            filterChain.doFilter(request, response);
            return;
        }
        if(authentication.getPrincipal().equals("anonymousUser")) {
            filterChain.doFilter(request, response);
            return;
        }
        Jwt principal = (Jwt) authentication.getPrincipal();
        ArrayList<Object> groups = (ArrayList<Object>) principal.getClaims().get("groups");
        String name = groups.get(0).toString().split("/")[1];
        String tenantUUID = redisTemplate.opsForValue().get("tenant:" + name);
        if(tenantUUID == null) {
            tenantUUID = accountsRepository.getTenantIdByName(name);
            if(tenantUUID == null) {
                filterChain.doFilter(request,response);
                return;
            }
            redisTemplate.opsForValue().set("tenant:" + name, tenantUUID);
        }
        UUID tenantId = UUID.fromString(tenantUUID);
        TenantContext.setTenantId(tenantId);
        Session unwrap = entityManager.unwrap(Session.class);
        Filter tenantFilter = unwrap.enableFilter("tenantFilter");
        tenantFilter.setParameter("tenantId", TenantContext.getTenantId());
        filterChain.doFilter(request,response);
        TenantContext.clear();
        unwrap.disableFilter("tenantFilter");
    }
}
