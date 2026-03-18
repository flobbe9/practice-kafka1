package com.example.backend;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import lombok.extern.log4j.Log4j2;

@SpringBootTest
@Import({
    SecurityTestConfig.class
})
@Log4j2
class BackendApplicationTests {

	@BeforeAll
	static void beforeAll() {
		BackendApplication.readEnvFiles("./.env.local");
	}	

	@Test
	void contextLoads() {        
	}
}
