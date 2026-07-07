package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Usuario;
import java.util.Map;

public interface AuthUseCase {
    Map<String, String> login(String email, String password);
    Usuario register(Usuario usuario, String rawPassword);
}

