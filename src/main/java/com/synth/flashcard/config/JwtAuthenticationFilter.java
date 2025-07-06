package com.synth.flashcard.config;

import com.synth.flashcard.service.UserDetailsServiceImpl;
import com.synth.flashcard.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        System.out.println("=== JWT FILTER DEBUG ===");
        System.out.println("Request URL: " + request.getRequestURL());
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Method: " + request.getMethod());
        
        final String requestTokenHeader = request.getHeader("Authorization");
        System.out.println("Authorization header present: " + (requestTokenHeader != null));

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            System.out.println("Token extracted: " + jwtToken.substring(0, 20) + "...");
            try {
                username = jwtUtil.getUsernameFromToken(jwtToken);
                System.out.println("Username from token: " + username);
            } catch (Exception e) {
                System.err.println("Unable to get JWT Token: " + e.getMessage());
                logger.error("Unable to get JWT Token", e);
            }
        } else {
            System.out.println("No valid Bearer token found");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Attempting to authenticate user: " + username);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                System.out.println("Token validation successful");
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null,
                                userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            } else {
                System.out.println("Token validation failed");
            }
        } else {
            System.out.println("Username null or already authenticated");
        }
        System.out.println("=== END JWT FILTER DEBUG ===");
        filterChain.doFilter(request, response);
    }
}