package com.tiendaropa.backend.application.ports.output;

public interface PasswordEncoderPort {

     String encode(String password);

    boolean matches(String rawPassword, String encodedPassword);
    
}
