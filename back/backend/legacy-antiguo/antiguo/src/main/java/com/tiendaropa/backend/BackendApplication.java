package com.tiendaropa.backend;

import com.tiendaropa.backend.service.OrdenService;
import com.tiendaropa.backend.service.ProductoService;
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

		if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")
			|| dbUrl.startsWith("jdbc:postgresql://") || dbUrl.startsWith("jdbc:postgres://")) {
			DatosConexion datosConexion = extraerDatosConexion(dbUrl);
			System.setProperty("spring.datasource.url", datosConexion.jdbcUrl());
			if (System.getenv("DB_USERNAME") == null || System.getenv("DB_USERNAME").isBlank()) {
				System.setProperty("spring.datasource.username", datosConexion.username());
			}
			if (System.getenv("DB_PASSWORD") == null || System.getenv("DB_PASSWORD").isBlank()) {
				System.setProperty("spring.datasource.password", datosConexion.password());
			}
		}
	}

	private static DatosConexion extraerDatosConexion(String dbUrl) {
		String normalizedUrl = dbUrl;
		if (normalizedUrl.startsWith("jdbc:")) {
			normalizedUrl = normalizedUrl.substring("jdbc:".length());
		}
		if (normalizedUrl.startsWith("postgres://")) {
			normalizedUrl = "postgresql://" + normalizedUrl.substring("postgres://".length());
		}

		String sinEsquema = normalizedUrl.substring("postgresql://".length());
		String[] partesRuta = sinEsquema.split("/", 2);
		String authority = partesRuta[0];
		String pathAndQuery = partesRuta.length > 1 ? partesRuta[1] : "";

		String credenciales = "";
		String hostPort = authority;
		int indiceArroba = authority.lastIndexOf('@');
		if (indiceArroba >= 0) {
			credenciales = authority.substring(0, indiceArroba);
			hostPort = authority.substring(indiceArroba + 1);
		}

		String username = "";
		String password = "";
		if (!credenciales.isBlank()) {
			String[] partesCredenciales = credenciales.split(":", 2);
			username = partesCredenciales[0];
			password = partesCredenciales.length > 1 ? partesCredenciales[1] : "";
		}

		return new DatosConexion("jdbc:postgresql://" + hostPort + "/" + pathAndQuery, username, password);
	}

	private record DatosConexion(String jdbcUrl, String username, String password) {}

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
