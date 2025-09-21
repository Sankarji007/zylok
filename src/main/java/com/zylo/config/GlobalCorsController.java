package com.zylo.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Global CORS Controller to handle preflight OPTIONS requests
 * This ensures all preflight requests are properly handled
 */
@RestController
public class GlobalCorsController {

    /**
     * Handle all OPTIONS requests (CORS preflight)
     * This catches any OPTIONS request that might not be handled elsewhere
     */
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .header("Access-Control-Allow-Origin", "http://localhost:3000")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
                .header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers")
                .header("Access-Control-Allow-Credentials", "true")
                .header("Access-Control-Max-Age", "3600")
                .build();
    }
}
