package com.tiendaropa.backend.infrastructure.config.database;

public record DatabaseConnectionData(String jdbcUrl, String username, String password) {
}
