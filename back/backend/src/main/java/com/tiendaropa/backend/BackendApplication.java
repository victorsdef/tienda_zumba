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
		SpringApplication.run(BackendApplication.class, args);
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
