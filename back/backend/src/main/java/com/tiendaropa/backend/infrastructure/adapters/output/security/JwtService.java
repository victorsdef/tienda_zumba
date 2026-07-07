package com.tiendaropa.backend.infrastructure.adapters.output.security;

import com.tiendaropa.backend.application.ports.output.JwtPort;
import com.tiendaropa.backend.domain.model.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService implements JwtPort {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    @Override
    public String generateToken(Usuario usuario) {
        return buildToken(new HashMap<>(), usuario.getEmail(), jwtExpiration);
    }

    @Override
    public String generateRefreshToken(Usuario usuario) {
        return buildToken(new HashMap<>(), usuario.getEmail(), refreshExpiration);
    }

    private String buildToken(Map<String, Object> extra, String username, long expiration) {
        return Jwts.builder()
            .setClaims(extra)
            .setSubject(username)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    @Override
    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSigningKey() {
        try {
            byte[] decodedKey = Decoders.BASE64.decode(secretKey);
            if (decodedKey.length >= 32) {
                return Keys.hmacShaKeyFor(decodedKey);
            }
        } catch (IllegalArgumentException | DecodingException ignored) {
            // Permite usar secretos de texto plano en dev o despliegues simples.
        }

        byte[] rawKey = secretKey.getBytes(StandardCharsets.UTF_8);
        if (rawKey.length < 32) {
            rawKey = sha256(rawKey);
        }

        return Keys.hmacShaKeyFor(rawKey);
    }

    private byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("No se pudo generar la clave JWT", e);
        }
    }
}
