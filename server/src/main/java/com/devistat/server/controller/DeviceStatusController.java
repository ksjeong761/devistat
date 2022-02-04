package com.devistat.server.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
public class DeviceStatusController {
	@GetMapping("/devices/{id}/statuses")
	public String read() {
		return "read";
	}
	@PostMapping("/devices/{id}/statuses")
	public String create() {
		return "create";
	}
	@PutMapping("/devices/{id}/statuses")
	public String update() {
		return "update";
	}
	@DeleteMapping("/devices/{id}/statuses")
	public String delete() {
		return "delete";
	}
}
