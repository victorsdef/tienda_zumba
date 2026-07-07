package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Usuario;

public interface JwtPort {
    String extractUsername(String token);
    String generateToken(Usuario usuario);
    String generateRefreshToken(Usuario usuario);
    boolean isTokenValid(String token, String username);
}
