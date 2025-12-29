package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import({
    SecurityTestConfig.class
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
