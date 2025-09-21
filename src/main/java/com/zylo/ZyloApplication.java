package com.zylo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
@ComponentScan(basePackages = {
    "com.zylo",
    "com.zylo.authservice",
    "com.zylo.chatservice", 
    "com.zylo.common",
    "com.zylo.notificationservice",
    "com.zylo.presenceservice"
})
public class ZyloApplication {
    public static void main(String[] args) {
        SpringApplication.run(ZyloApplication.class, args);
    }
}

