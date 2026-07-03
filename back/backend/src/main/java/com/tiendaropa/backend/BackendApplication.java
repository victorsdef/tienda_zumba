package com.tiendaropa.backend;

import com.tiendaropa.backend.service.OrdenService;
import com.tiendaropa.backend.service.ProductoService;
import java.net.URI;
import java.net.URISyntaxException;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		normalizarDatabaseUrl();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void normalizarDatabaseUrl() {
		String dbUrl = System.getenv("DB_URL");
		if (dbUrl == null || dbUrl.isBlank()) {
			return;
		}

		if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
			System.setProperty("spring.datasource.url", convertirJdbcUrl(dbUrl));
		}
	}

	private static String convertirJdbcUrl(String dbUrl) {
		try {
			String normalizedUrl = dbUrl.startsWith("postgres://")
				? "postgresql://" + dbUrl.substring("postgres://".length())
				: dbUrl;
			URI uri = new URI(normalizedUrl);
			StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
				.append(uri.getHost());

			if (uri.getPort() > 0) {
				jdbcUrl.append(":").append(uri.getPort());
			}

			jdbcUrl.append(uri.getPath());

			if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
				jdbcUrl.append("?").append(uri.getQuery());
			}

			return jdbcUrl.toString();
		} catch (URISyntaxException | IllegalArgumentException ex) {
			return "jdbc:" + dbUrl;
		}
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

	@Bean
	CommandLineRunner migrarDatosComerciales(ProductoService productoService, OrdenService ordenService) {
		return args -> {
			productoService.generarSlugsExistentes();
			ordenService.generarCodigosOrdenesExistentes();
		};
	}
}
