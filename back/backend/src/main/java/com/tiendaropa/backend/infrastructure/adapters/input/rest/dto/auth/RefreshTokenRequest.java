package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth;

public class RefreshTokenRequest {

    private String refreshToken;

    public RefreshTokenRequest() {
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
