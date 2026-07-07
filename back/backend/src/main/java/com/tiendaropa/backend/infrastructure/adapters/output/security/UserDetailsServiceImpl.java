package com.tiendaropa.backend.infrastructure.adapters.output.security;

import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepositoryPort usuarioRepositoryPort;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario u = usuarioRepositoryPort.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return User.withUsername(u.getEmail())
            .password(u.getPassword())
            .roles(u.getRol() != null ? u.getRol().name() : "USER")
            .disabled(!u.isActivo())
            .build();
    }
}
