package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.auth.*;
import com.tiendaropa.backend.entity.Carrito;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.entity.enums.Rol;
import com.tiendaropa.backend.repository.CarritoRepository;
import com.tiendaropa.backend.repository.UsuarioRepository;
import com.tiendaropa.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CarritoRepository carritoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        Usuario usuario = Usuario.builder()
            .nombre(request.getNombre())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .rol(Rol.CLIENTE)
            .build();
        usuarioRepository.save(usuario);

        Carrito carrito = Carrito.builder().usuario(usuario).build();
        carritoRepository.save(carrito);

        return buildResponse(usuario);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElseThrow();
        return buildResponse(usuario);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String email = jwtService.extractUsername(request.getRefreshToken());
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        if (!jwtService.isTokenValid(request.getRefreshToken(), usuario)) {
            throw new IllegalArgumentException("Refresh token inválido");
        }
        return buildResponse(usuario);
    }

    private AuthResponse buildResponse(Usuario usuario) {
        return AuthResponse.builder()
            .accessToken(jwtService.generateToken(usuario))
            .refreshToken(jwtService.generateRefreshToken(usuario))
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .rol(usuario.getRol().name())
            .build();
    }
}
