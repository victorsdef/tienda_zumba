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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
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
    private final EmailService emailService;

    @Transactional
    public String register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        Usuario usuario = Usuario.builder()
            .nombre(request.getNombre())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .rol(Rol.CLIENTE)
            .emailVerificado(true)
            .build();
        usuarioRepository.save(usuario);

        Carrito carrito = Carrito.builder().usuario(usuario).build();
        carritoRepository.save(carrito);

        return "Cuenta creada correctamente. Ya podés iniciar sesión.";
    }

    @Transactional
    public String verificarEmail(String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacion(token)
            .orElseThrow(() -> new IllegalArgumentException("Token de verificación inválido o ya utilizado"));
        usuario.setEmailVerificado(true);
        usuario.setTokenVerificacion(null);
        usuarioRepository.save(usuario);
        return "Correo verificado correctamente. Ya podés iniciar sesión.";
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Credenciales incorrectas"));

        if (!usuario.isEmailVerificado()) {
            throw new DisabledException("Debés verificar tu correo antes de iniciar sesión. Revisá tu bandeja de entrada.");
        }

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
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
