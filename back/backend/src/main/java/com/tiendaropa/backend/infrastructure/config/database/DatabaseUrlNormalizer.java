package com.tiendaropa.backend.infrastructure.config.database;

final class DatabaseUrlNormalizer {

    private DatabaseUrlNormalizer() {
    }

    static boolean supports(String dbUrl) {
        return dbUrl != null
            && (dbUrl.startsWith("postgresql://")
            || dbUrl.startsWith("postgres://")
            || dbUrl.startsWith("jdbc:postgresql://")
            || dbUrl.startsWith("jdbc:postgres://"));
    }

    static DatabaseConnectionData normalize(String dbUrl) {
        String normalizedUrl = dbUrl;
        if (normalizedUrl.startsWith("jdbc:")) {
            normalizedUrl = normalizedUrl.substring("jdbc:".length());
        }
        if (normalizedUrl.startsWith("postgres://")) {
            normalizedUrl = "postgresql://" + normalizedUrl.substring("postgres://".length());
        }

        String withoutScheme = normalizedUrl.substring("postgresql://".length());
        String[] pathParts = withoutScheme.split("/", 2);
        String authority = pathParts[0];
        String pathAndQuery = pathParts.length > 1 ? pathParts[1] : "";

        String credentials = "";
        String hostPort = authority;
        int atIndex = authority.lastIndexOf('@');
        if (atIndex >= 0) {
            credentials = authority.substring(0, atIndex);
            hostPort = authority.substring(atIndex + 1);
        }

        String username = "";
        String password = "";
        if (!credentials.isBlank()) {
            String[] credentialParts = credentials.split(":", 2);
            username = credentialParts[0];
            password = credentialParts.length > 1 ? credentialParts[1] : "";
        }

        return new DatabaseConnectionData("jdbc:postgresql://" + hostPort + "/" + pathAndQuery, username, password);
    }
}
