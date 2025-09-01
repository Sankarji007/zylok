package com.zylo.authservice.repository;

import com.zylo.authservice.config.TenantContext;
import com.zylo.authservice.entity.Tenant;
import com.zylo.authservice.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Transactional
@Repository
public class AccountsRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String TENANTS_KEY = "tenants";
    private static final String USERNAME_KEY_PREFIX = "tenant:%s:usernames";
    private static final String EMAIL_KEY_PREFIX = "tenant:%s:emails";

    public void createUser(User user) {
        UUID tenantId = TenantContext.getTenantId();
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        Tenant tenant = user.getTenant();
        String tenantName = tenant.getName();

        boolean tenantExistsInCache = tenantId != null && Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(TENANTS_KEY, tenantId.toString()));

        CriteriaQuery<Tenant> tenantQuery = criteriaBuilder.createQuery(Tenant.class);
        Root<Tenant> tenantRoot = tenantQuery.from(Tenant.class);
        if (tenantExistsInCache) {
            tenantQuery.where(criteriaBuilder.equal(tenantRoot.get("id"), tenantId));

            try {
                tenant = entityManager.createQuery(tenantQuery).getSingleResult();
                user.setTenant(tenant);
            } catch (Exception e) {
                throw new RuntimeException("Tenant not found in database for ID: " + tenantId, e);
            }
        } else {
            tenantQuery.where(criteriaBuilder.equal(tenantRoot.get("name"), tenantName));

            if (entityManager.createQuery(tenantQuery).getResultList().isEmpty()) {
                entityManager.persist(tenant);
            } else {
                tenant = entityManager.createQuery(tenantQuery).getSingleResult();
            }
            redisTemplate.opsForSet().add(TENANTS_KEY, tenant.getId().toString());
            tenantId = tenant.getId();
            user.setTenant(tenant);
            if (TenantContext.getTenantId() == null) {
                TenantContext.setTenantId(tenantId);
            }
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }

        String usernameKey = String.format(USERNAME_KEY_PREFIX, tenantId);
        String emailKey = String.format(EMAIL_KEY_PREFIX, tenantId);

        Boolean usernameExists = redisTemplate.opsForSet().isMember(usernameKey, user.getUsername());
        Boolean emailExists = redisTemplate.opsForSet().isMember(emailKey, user.getEmail());

        if (Boolean.TRUE.equals(usernameExists) || Boolean.TRUE.equals(emailExists)) {
            throw new RuntimeException("User with same username or email already exists in tenant");
        }

        CriteriaQuery<User> query = criteriaBuilder.createQuery(User.class);
        Root<User> userRoot = query.from(User.class);
        query.where(
                criteriaBuilder.or(
                        criteriaBuilder.equal(userRoot.get("username"), user.getUsername()),
                        criteriaBuilder.equal(userRoot.get("email"), user.getEmail())
                )
        );

        if (!entityManager.createQuery(query).getResultList().isEmpty()) {
            redisTemplate.opsForSet().add(usernameKey, user.getUsername());
            redisTemplate.opsForSet().add(emailKey, user.getEmail());
            throw new RuntimeException("User with same username or email already exists in tenant");
        }

        entityManager.persist(user);
        redisTemplate.opsForSet().add(usernameKey, user.getUsername());
        redisTemplate.opsForSet().add(emailKey, user.getEmail());
    }

    public Tenant getTenantByUser( String invitedBy) {
        CriteriaQuery<User> query = this.entityManager.getCriteriaBuilder().createQuery(User.class);
        Root<User> userRoot = query.from(User.class);
        query.where(this.entityManager.getCriteriaBuilder().equal(userRoot.get("username"), invitedBy));
        User inviter = entityManager.createQuery(query).getSingleResult();
        Tenant tenant = inviter.getTenant();
        return tenant;

    }
}